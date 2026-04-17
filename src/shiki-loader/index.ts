// @ts-expect-error for simplicity, we can ignore type errors in this loader since it's meant to be used as a standalone script
import { bundledLanguages, codeToHtml } from "https://esm.sh/shiki@3.0.0";
import createShikiLoaderTransformer from "./transformer";
import { generateStyles, handleCopyButtonClick, readSearchParams } from "./utils";

const languages = new Set(Object.keys(bundledLanguages));
let hasRun = false;

async function highlight() {
  if (hasRun) return;
  hasRun = true;

  document.head.appendChild(generateStyles());

  const { theme, darkTheme } = readSearchParams();
  const codeBlocks = document.querySelectorAll("pre code");
  const isDarkMode = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const activeTheme = (isDarkMode && darkTheme) || theme;

  const highlightTasks = Array.from(codeBlocks).map(async (codeBlock) => {
    const element = codeBlock as HTMLElement;
    const parent = element.parentElement;
    if (!parent) return;

    // Extract language from class (e.g., language-js)
    const classNames = Array.from(element.classList);
    const langClass = classNames.find((c) => c.startsWith("language-") || c.startsWith("lang-"));

    let lang = "unknown";
    if (langClass) {
      if (langClass.startsWith("language-")) {
        lang = langClass.replace("language-", "");
      } else if (langClass.startsWith("lang-")) {
        lang = langClass.replace("lang-", "");
      }
    }

    if (lang === "unknown" || !languages.has(lang)) {
      console.warn("Unsupported or unknown language:", lang);
      return;
    }

    try {
      const code = element.textContent || "";
      const html = await codeToHtml(code, {
        lang,
        theme: activeTheme || "material-theme",
        transformers: [createShikiLoaderTransformer(lang)],
      });

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const newPre = tempDiv.firstElementChild as HTMLElement | null;

      if (newPre) {
        newPre.classList.add(langClass || `language-${lang}`);
        parent.replaceWith(newPre);
      }
    } catch (err) {
      console.error(`Failed to highlight code block with language "${lang}":`, err);
    }
  });

  await Promise.allSettled(highlightTasks);

  // Attach event listener for copy buttons
  document.querySelectorAll("button[data-target='copy']").forEach((b) => {
    const button = b as HTMLButtonElement;
    button.addEventListener("click", handleCopyButtonClick);
  });
}

// Side effect to automatically highlight on load
// Works both for scripts present at initial load and for
// scripts injected dynamically after DOMContentLoaded.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void highlight();
  });
} else {
  void highlight();
}
