/** Zaporedno naloži klasične (non-module) skripte iz /public. */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-mojbar-src="${src}"]`
    );
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.mojbarSrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Ni mogoče naložiti ${src}`));
    document.body.appendChild(script);
  });
}

export async function loadScripts(srcs: string[]) {
  for (const src of srcs) {
    await loadScript(src);
  }
}
