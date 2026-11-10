import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Manjka URL" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Neveljaven URL" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MojBarBot/1.0; +https://moj-bar.local)",
        Accept: "text/html",
      },
      redirect: "follow",
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Stran ni dosegljiva (${res.status})` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const ogMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i
      );

    const image = ogMatch?.[1];
    if (!image) {
      return NextResponse.json({
        error: "og:image ni bil najden (Facebook pogosto blokira scrape)",
      });
    }

    return NextResponse.json({ image });
  } catch {
    return NextResponse.json(
      { error: "Scrape ni uspel" },
      { status: 500 }
    );
  }
}
