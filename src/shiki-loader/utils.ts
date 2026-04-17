// @ts-expect-error for simplicity, we can ignore type errors in this loader since it's meant to be used as a standalone script
import { bundledThemes } from "https://esm.sh/shiki@3.0.0";

export interface LoaderInputs {
  theme: string;
  darkTheme?: string;
}

const LOADER_CSS = "/* LOADER_CSS placeholder - this will be replaced with the contents of loader.css */";
const themes = new Set(Object.keys(bundledThemes));

export function generateStyles() {
  const style = document.createElement("style");
  style.textContent = LOADER_CSS;
  return style;
}

export function readSearchParams(): LoaderInputs {
  let scriptElement = document.currentScript as HTMLScriptElement;

  // Fallback for dynamically added scripts where currentScript might be null
  if (!scriptElement || scriptElement.nodeName !== "SCRIPT") {
    const scripts = document.getElementsByTagName("script");
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      if (s.src && (s.src.includes("shiki-loader.js") || s.src.includes("index.ts"))) {
        scriptElement = s;
        break;
      }
    }
  }

  // Default configuration
  const config: LoaderInputs = { theme: "material-theme" };

  // Parse URL parameters if script element is available
  if (scriptElement?.src) {
    try {
      const url = new URL(scriptElement.src);

      const themeParam = url.searchParams.get("theme") ?? "";
      if (themeParam && themes.has(themeParam)) {
        config.theme = themeParam;
      }

      const darkThemeParam = url.searchParams.get("dark-theme") ?? "";
      if (darkThemeParam && themes.has(darkThemeParam)) {
        config.darkTheme = darkThemeParam;
      }
    } catch (error) {
      console.error("Failed to parse script URL:", error);
      return config;
    }
  }

  return config;
}

const tooltipResetTimers = new WeakMap<HTMLElement, number>();

export async function handleCopyButtonClick(event: MouseEvent) {
  const button = event.currentTarget as HTMLButtonElement | null;
  if (!button) return;

  const tooltip = button.closest(".shiki-loader-tooltip") as HTMLElement | null;
  const container = button.closest(".shiki-loader-mockup-code") as HTMLElement | null;

  if (!container) return;

  const codeElement = container.querySelector("pre code") as HTMLElement | null;
  const code = codeElement?.textContent ?? "";

  if (!code) return;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  } catch (err) {
    console.error("Failed to copy code to clipboard:", err);
  }

  if (!tooltip) return;

  const previousTimeout = tooltipResetTimers.get(tooltip);
  if (previousTimeout !== undefined) {
    window.clearTimeout(previousTimeout);
  }

  tooltip.setAttribute("data-tip", "Copied");

  const timeoutId = window.setTimeout(() => {
    tooltip.setAttribute("data-tip", "Copy");
    tooltipResetTimers.delete(tooltip);
  }, 2000);

  tooltipResetTimers.set(tooltip, timeoutId);
}
