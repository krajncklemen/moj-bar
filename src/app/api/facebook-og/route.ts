import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 5_000;
const MAX_BODY_BYTES = 512_000;
const MAX_REDIRECTS = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function clientKey(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

function takeRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function isPrivateIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  const ranges: Array<[number, number]> = [
    [ipv4ToInt("0.0.0.0"), ipv4ToInt("0.255.255.255")],
    [ipv4ToInt("10.0.0.0"), ipv4ToInt("10.255.255.255")],
    [ipv4ToInt("100.64.0.0"), ipv4ToInt("100.127.255.255")],
    [ipv4ToInt("127.0.0.0"), ipv4ToInt("127.255.255.255")],
    [ipv4ToInt("169.254.0.0"), ipv4ToInt("169.254.255.255")],
    [ipv4ToInt("172.16.0.0"), ipv4ToInt("172.31.255.255")],
    [ipv4ToInt("192.0.0.0"), ipv4ToInt("192.0.0.255")],
    [ipv4ToInt("192.168.0.0"), ipv4ToInt("192.168.255.255")],
    [ipv4ToInt("198.18.0.0"), ipv4ToInt("198.19.255.255")],
    [ipv4ToInt("224.0.0.0"), ipv4ToInt("255.255.255.255")],
  ];
  return ranges.some(([start, end]) => n >= start && n <= end);
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
  if (normalized.startsWith("fe80")) return true; // link-local
  if (normalized.startsWith("::ffff:")) {
    const v4 = normalized.slice("::ffff:".length);
    if (isIP(v4) === 4) return isPrivateIpv4(v4);
  }
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  ) {
    return true;
  }
  const kind = isIP(host);
  if (kind === 4) return isPrivateIpv4(host);
  if (kind === 6) return isPrivateIpv6(host);
  return false;
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Neveljaven URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Dovoljena sta samo http in https");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URL z uporabniškimi podatki ni dovoljen");
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Ciljni naslov ni dovoljen");
  }

  const kind = isIP(parsed.hostname.replace(/^\[|\]$/g, ""));
  if (kind === 0) {
    const records = await lookup(parsed.hostname, { all: true, verbatim: true });
    if (!records.length) throw new Error("DNS ni vrnil naslova");
    for (const record of records) {
      if (record.family === 4 && isPrivateIpv4(record.address)) {
        throw new Error("Ciljni naslov ni dovoljen");
      }
      if (record.family === 6 && isPrivateIpv6(record.address)) {
        throw new Error("Ciljni naslov ni dovoljen");
      }
    }
  }
  return parsed;
}

async function readLimitedText(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      throw new Error("Odgovor je prevelik");
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

async function fetchSafe(startUrl: string): Promise<Response> {
  let current = await assertPublicUrl(startUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "MojBarBot/1.0 (+https://cursor.com)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) throw new Error("Preusmeritev brez Location");
        const nextUrl = new URL(location, current);
        current = await assertPublicUrl(nextUrl.toString());
        continue;
      }

      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("Preveč preusmeritev");
}

function extractOgImage(html: string): string | undefined {
  const match =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i
    );
  return match?.[1];
}

export async function GET(req: NextRequest) {
  if (!takeRateLimit(clientKey(req))) {
    return NextResponse.json(
      { error: "Preveč zahtev. Poskusite znova čez minuto." },
      { status: 429 }
    );
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Manjka URL" }, { status: 400 });
  }

  try {
    const res = await fetchSafe(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Stran ni dosegljiva (${res.status})` },
        { status: 502 }
      );
    }

    const html = await readLimitedText(res, MAX_BODY_BYTES);
    const image = extractOgImage(html);
    if (!image) {
      return NextResponse.json({
        error: "og:image ni bil najden (vir pogosto blokira scrape)",
      });
    }

    // Validate image URL is also public http(s) before returning
    try {
      await assertPublicUrl(new URL(image, url).toString());
    } catch {
      return NextResponse.json({ error: "og:image ni veljaven javni URL" });
    }

    return NextResponse.json({ image: new URL(image, url).toString() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Scrape ni uspel";
    const status =
      message.includes("dovoljen") ||
      message.includes("Neveljaven") ||
      message.includes("Dovoljena")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
