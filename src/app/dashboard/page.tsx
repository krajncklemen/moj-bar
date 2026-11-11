"use client";

import { useEffect } from "react";
import { loadScripts } from "@/lib/load-scripts";

const DASH_MARKUP = `
  <div class="stage" aria-hidden="true">
    <div class="wash"></div>
    <div class="orb orb-1"></div>
    <div class="mesh"></div>
  </div>

  <div class="app">
    <header class="topbar">
      <div class="brand-mini">
        <img src="/assets/foch-logo.png" alt="MOJ BAR" />
        <div>
          <strong>MOJ BAR</strong>
          <span>Interni portal</span>
        </div>
      </div>
      <nav class="nav">
        <button type="button" data-view="pregled" class="active">Pregled</button>
        <button type="button" data-view="urnik">Urnik</button>
        <button type="button" data-view="dopusti">Dopusti</button>
        <button type="button" data-view="menjave">Menjave</button>
        <button type="button" data-view="dolzniki">Dolžniki</button>
        <button type="button" data-view="izkupicek">Izkupiček</button>
        <button type="button" data-view="ekipa" data-role="admin">Ekipa</button>
      </nav>
      <div class="who">
        <div class="meta">
          <b id="who-name">—</b>
          <small id="who-role">—</small>
        </div>
        <button class="ghost" type="button" id="logout">Odjava</button>
      </div>
    </header>

    <div class="weekbar">
      <h2>Teden</h2>
      <span id="week-label"></span>
    </div>

    <main class="content">
      <div id="view-pregled"></div>
      <div id="view-urnik" class="hidden"></div>
      <div id="view-dopusti" class="hidden"></div>
      <div id="view-menjave" class="hidden"></div>
      <div id="view-dolzniki" class="hidden"></div>
      <div id="view-izkupicek" class="hidden"></div>
      <div id="view-ekipa" class="hidden"></div>
    </main>
  </div>

  <div id="modal"></div>
`;

export default function DashboardPage() {
  useEffect(() => {
    document.body.classList.add("app-body");
    const links = ["/css/login.css", "/css/app.css"].map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.mojbarCss = href;
      document.head.appendChild(link);
      return link;
    });

    let cancelled = false;
    loadScripts(["/js/storage.js", "/js/data.js", "/js/app.js"]).catch(
      (err) => {
        if (!cancelled) console.error(err);
      }
    );

    return () => {
      cancelled = true;
      document.body.classList.remove("app-body");
      links.forEach((l) => l.remove());
      document
        .querySelectorAll("script[data-mojbar-src]")
        .forEach((el) => el.remove());
    };
  }, []);

  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: DASH_MARKUP }}
    />
  );
}
