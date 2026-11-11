"use client";

import { useEffect } from "react";
import { loadScripts } from "@/lib/load-scripts";

const LOGIN_MARKUP = `
  <div class="stage" aria-hidden="true">
    <div class="wash"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="mesh"></div>
    <div class="scan"></div>
    <svg class="halo" viewBox="0 0 800 420" fill="none">
      <ellipse cx="400" cy="210" rx="318" ry="168" />
      <ellipse cx="400" cy="210" rx="292" ry="148" />
      <ellipse cx="400" cy="210" rx="266" ry="128" />
    </svg>
  </div>

  <main class="shell">
    <section class="panel">
      <aside class="brand">
        <div class="logo-frame">
          <img src="/assets/foch-logo.png" alt="MOJ BAR" />
        </div>
        <p class="eyebrow">Interni sistem</p>
        <h1>MOJ BAR</h1>
        <p class="tag">Urniki, dežurstva in dopusti za oba lokala — ena prijava za administracijo in strežbo.</p>
        <ul class="pills">
          <li>Lokal A</li>
          <li>Lokal B</li>
          <li>Samo strežba</li>
        </ul>
      </aside>

      <div class="auth">
        <div id="login-panel">
          <header class="auth-head">
            <p class="kicker">Vstop v portal</p>
            <h2>Prijava</h2>
            <p class="sub">Ista stran za administratorja in zaposlene.</p>
          </header>

          <form id="login-form" novalidate>
            <label class="field">
              <span>Uporabniško ime</span>
              <input type="text" name="username" id="username" required autofocus autocomplete="username" placeholder="npr. ana" />
            </label>

            <label class="field">
              <span>Geslo</span>
              <div class="pass-wrap">
                <input type="password" name="password" id="password" required autocomplete="current-password" placeholder="••••••••" />
                <button type="button" class="eye" id="toggle-pass" aria-label="Prikaži geslo" aria-pressed="false">
                  <svg class="i-show" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
                  <svg class="i-hide" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4M9.9 5.2A11 11 0 0112 5c6.5 0 10 7 10 7a18 18 0 01-4.2 4.8M6.1 6.1A18 18 0 002 12s3.5 7 10 7c1.3 0 2.5-.2 3.6-.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </button>
              </div>
            </label>

            <p class="error" id="error" hidden role="alert"></p>

            <button type="submit" class="cta" id="submit">
              <span>Prijava</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>

          <div class="demo">
            <p>Začetek</p>
            <button type="button" class="cta" id="load-sample" style="margin-bottom:12px">
              <span>Naloži vzorčne podatke</span>
            </button>
            <div id="sample-creds" class="hint-staff" hidden style="margin-bottom:12px;line-height:1.5"></div>
            <p class="hint-staff">
              Nov lokal?
              <button type="button" id="open-reg" class="ghost" style="margin-left:8px;height:auto;padding:4px 10px;display:inline-flex;vertical-align:middle">Registracija (2 koraka)</button>
            </p>
          </div>
        </div>

        <div id="reg-panel" hidden>
          <header class="auth-head">
            <p class="kicker">Nov portal</p>
            <h2>Registracija</h2>
            <p class="sub" id="reg-sub">Korak 1/2 — ustvari administratorski račun.</p>
          </header>

          <p class="error" id="reg-error" hidden role="alert"></p>

          <form id="reg-form-1">
            <div id="reg-step-1">
              <label class="field">
                <span>Ime in priimek</span>
                <input type="text" name="name" required placeholder="npr. Ana Novak" />
              </label>
              <label class="field">
                <span>Uporabniško ime</span>
                <input type="text" name="username" required autocomplete="username" placeholder="npr. ana" />
              </label>
              <label class="field">
                <span>Geslo</span>
                <input type="password" name="password" required minlength="6" autocomplete="new-password" />
              </label>
              <label class="field">
                <span>Ponovi geslo</span>
                <input type="password" name="password2" required minlength="6" autocomplete="new-password" />
              </label>
              <button type="submit" class="cta"><span>Nadaljuj</span></button>
              <p class="hint-staff" style="margin-top:14px">
                <button type="button" id="back-login" class="ghost" style="height:auto;padding:4px 10px">Nazaj na prijavo</button>
              </p>
            </div>
          </form>

          <form id="reg-form-2">
            <div id="reg-step-2" hidden>
              <p class="sub" style="margin-bottom:16px">Korak 2/2 — poimenuj lokala (ista podstran za admin in zaposlene).</p>
              <label class="field">
                <span>Lokal 1</span>
                <input type="text" name="venue1" value="Lokal A" required />
              </label>
              <label class="field">
                <span>Lokal 2</span>
                <input type="text" name="venue2" value="Lokal B" required />
              </label>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button type="button" class="ghost" id="reg-back-1">Nazaj</button>
                <button type="submit" class="cta" style="flex:1"><span>Ustvari portal</span></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  <footer class="foot">MOJ BAR · interni portal · 2026</footer>
`;

export default function LoginPage() {
  useEffect(() => {
    document.body.classList.remove("app-body");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/login.css";
    link.dataset.mojbarCss = "login";
    document.head.appendChild(link);

    let cancelled = false;
    loadScripts([
      "/js/storage.js",
      "/js/data.js",
      "/js/seed.js",
      "/js/auth.js",
    ]).catch((err) => {
      if (!cancelled) console.error(err);
    });

    return () => {
      cancelled = true;
      link.remove();
      document
        .querySelectorAll("script[data-mojbar-src]")
        .forEach((el) => el.remove());
    };
  }, []);

  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: LOGIN_MARKUP }}
    />
  );
}
