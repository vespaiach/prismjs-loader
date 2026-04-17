# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**shiki-loader** is a browser-only syntax highlighter built on [Shiki](https://shiki.style/). The repository contains two distinct parts:

1. **The Loader** (`src/shiki-loader/`): A standalone, self-contained script (`public/shiki-loader.js`) that can be embedded in any HTML page. It finds `<pre><code>` blocks, highlights them with Shiki, and wraps them with a language label and copy-to-clipboard button.
2. **The Demo App** (`src/app/`): A Next.js static site (GitHub Pages compatible) that showcases the loader and allows manual testing of themes and functionality.

The loader is **framework-agnostic and browser-only**—it has no Node runtime or React dependencies. All logic runs client-side.

## Setup

### Prerequisites

- **Bun** 1.0+: Install from https://bun.sh (replaces npm/yarn)
- **Node.js** 20+ (optional, for compatibility, but Bun is primary)

### First-Time Setup

```bash
bun install
bun run type-check  # Verify TypeScript setup
bun run build:lib   # Build the loader once to verify setup
```

## Quick Start Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start Next.js dev server (localhost:3000) |
| `bun run build:lib` | Build the standalone loader to `public/shiki-loader.js` |
| `bun run build` | Build the Next.js static site |
| `bun run start` | Run the production server |
| `bun run lint` | Check code with Biome |
| `bun run format` | Format code with Biome |
| `bun run type-check` | TypeScript type-check (no emit) |
| `bun test` | Run tests with Bun |

## Architecture & Key Files

### Loader Core (`src/shiki-loader/`)

The loader is built from a single entry point and bundled into one script:

- **`index.ts`**: Entry point. On DOM ready, it:
  - Reads `theme` and `dark-theme` from the script's URL search params
  - Detects system dark mode preference (`prefers-color-scheme: dark`)
  - Finds all `<pre><code>` blocks and highlights them with Shiki (imported from esm.sh)
  - Applies a single-run guard (`hasRun`) to avoid duplicate processing
  
- **`transformer.ts`**: Wraps each highlighted `<pre>` in a container with:
  - Language label in the top-left corner
  - Copy-to-clipboard button with "Copied!" tooltip state
  
- **`utils.ts`**: Utilities for:
  - `readSearchParams()`: Extracts `theme` and `dark-theme` from script URL
  - `generateStyles()`: Injects `loader.css` into a `<style>` element (CSS is embedded by the build script)
  - `handleCopyButtonClick()`: Clipboard copy with tooltip reset
  
- **`loader.css`**: All styling for the loader wrapper and UI. Modified directly; the build script embeds it into the bundle.
  
- **`themes.ts`**: Source of truth for supported Shiki theme names. Update this when adding/removing themes.

### Demo App (`src/app/`)

- **`layout.tsx`**: Root layout with Tailwind + DaisyUI styling
- **`page.tsx` & `_components/HomeClient.tsx`**: Home page showing theme selector and code examples
- **`about/page.tsx`**: About page
- **`_components/Select.tsx`**: Reusable dropdown component
- **`components/icons/`**: Icon components (Sun, Moon, GitHub, etc.)

### Configuration Files

- **`biome.json`**: Linter & formatter (2-space indent, 110-char line width, single quotes)
- **`tsconfig.json`**: TypeScript config (ES2017 target, strict mode, path alias `@/*`)
- **`next.config.ts`**: Static export for GitHub Pages; `basePath` and `assetPrefix` conditional on production
- **`.github/copilot-instructions.md`**: Detailed guidelines for Copilot (subset of this document)

## Build & Development Workflow

### Building the Loader

```bash
bun run build:lib
```

This:
1. Bundles `src/shiki-loader/index.ts` with Bun (`--target browser --bundle --minify`)
2. Runs `scripts/embed-loader-css.ts`, which inlines `loader.css` into the JS bundle via a placeholder in `utils.ts`
3. Outputs the final script to `public/shiki-loader.js`

The loader script is entirely self-contained: no external CSS files, no external dependencies (Shiki is imported from esm.sh at runtime).

### Running the Demo App Locally

```bash
bun run dev
```

The Next.js app runs at `localhost:3000`. The demo showcases the loader by:
- Including `<script src="/public/shiki-loader.js?theme=...&dark-theme=...">` in the HTML
- Rendering code blocks with language classes (e.g., `language-ts`, `lang-js`)

### Static Build for GitHub Pages

```bash
bun run build
bun run start
```

The app exports to static HTML. `next.config.ts` sets `basePath` and `assetPrefix` based on `NODE_ENV` to make assets work under `/shiki-loader/` on GitHub Pages.

### Pre-Merge Checklist

Before merging to `main`:

```bash
bun run lint          # Check for style/lint violations
bun run type-check    # Verify TypeScript compiles
bun run build:lib     # Build the loader
bun run build         # Build the demo app
bun run test          # Run all tests (if any exist)
git diff --stat       # Review what changed
```

All commands should exit with code 0.

## Language & Theme Detection

### Language Classes

The loader recognizes `language-xxx` or `lang-xxx` classes on `<code>` elements:

```html
<pre><code class="language-ts">const x = 1;</code></pre>
<pre><code class="lang-js">console.log('hi');</code></pre>
```

Valid languages come from Shiki's `bundledLanguages`. Unknown languages log a warning and are skipped.

### Theme Selection

The loader reads URL search params on the script tag:

```html
<!-- Use 'github-light' in light mode, 'github-dark' in dark mode -->
<script src="/shiki-loader.js?theme=github-light&dark-theme=github-dark" defer></script>
```

At runtime:
- If system is in dark mode **and** `dark-theme` is provided → use `dark-theme`
- Otherwise → use `theme` (defaults to `material-theme`)

Unknown theme names fall back to `material-theme`.

## Key Development Guidelines

### Keep the Loader Framework-Agnostic

- **Do not** import React, Next.js, or any framework into `src/shiki-loader/`
- Only use standard DOM APIs (`document`, `window`, `element.classList`, etc.)
- Shiki is imported from `esm.sh` at runtime—no build-time bundling

### Browser-Only Constraints

- Access to `document`, `window`, and `navigator.clipboard` must be guarded or scoped to browser-only code
- The `hasRun` guard in `index.ts` ensures highlighting runs only once, even if the script is injected multiple times
- CSS is embedded; no external stylesheets

### When Modifying Styles

1. Edit `src/shiki-loader/loader.css` directly
2. Run `bun run build:lib`—the embed script will inject the new CSS into the bundle
3. Do not hardcode large CSS strings in TypeScript

### When Adding Themes

1. Verify the theme name exists in Shiki's bundled themes
2. Update `src/shiki-loader/themes.ts` to document it
3. If the demo app lists themes (e.g., in a dropdown), update that UI as well

### When Adding Configuration

- New URL parameters belong in `readSearchParams()` in `utils.ts`
- Keep configuration simple and backward-compatible (avoid breaking existing `theme` / `dark-theme` parameters)
- Document new parameters in `README.md`

### Extending the Wrapper/UI

- To add UI around code blocks (e.g., line numbers toggle, syntax selector):
  - Modify `createShikiLoaderTransformer()` in `transformer.ts`
  - Add corresponding CSS rules in `loader.css`
- The transformer receives the language and can customize the wrapper structure

## Code Quality

- **Linting & Formatting**: `bun run lint` and `bun run format` (Biome)
- **Type Checking**: `bun run type-check` (tsc with no emit)
- **Testing**: `bun test` (Bun test runner)
- **Conventions**:
  - 2-space indentation, 110-character line width, single quotes (enforced by Biome)
  - TypeScript strict mode enabled
  - Path alias `@/*` points to `src/` or repo root

## Testing

Currently, there are no test files in the repository, but the project is configured for Bun test runner. To add tests:

1. Create test files in `src/__tests__/` or alongside source files (e.g., `src/shiki-loader/__tests__/transformer.test.ts`)
2. Use Bun's test API:
   ```typescript
   import { test, expect } from "bun:test";
   test("should highlight code", () => {
     expect(true).toBe(true);
   });
   ```
3. Run tests with `bun test`

**Key areas for testing:**
- Theme detection logic (`readSearchParams()`)
- Language detection and validation
- CSS embedding and injection
- Clipboard copy functionality

## TypeScript Target

The project targets **ES2017** (legacy support). This differs from the global CLAUDE.md recommendation (ES2022+) to maintain broader browser compatibility for the standalone loader script. Do not upgrade the target without testing across a wide range of browsers.

## Static Assets

- **`public/shiki-loader.js`**: The built, minified loader script (generated by `bun run build:lib`)
- **`public/shiki-loader.js`** is in `.gitignore`—it is built on demand, not checked in
- Exclude it from linting and formatting in `biome.json`

## Troubleshooting

### Script Not Highlighting Code Blocks

**Symptoms:** Code blocks appear unchanged, no error in console.

**Cause:** Loader script wasn't built or theme parameter is invalid.

**Solution:**
1. Run `bun run build:lib` to generate the loader script
2. Check the script tag has valid theme: `theme=github-light&dark-theme=github-dark`
3. Verify code blocks have correct class: `class="language-js"` or `class="lang-ts"`

### Theme Not Applying Correctly

**Symptoms:** Wrong colors, unexpected theme appears in dark mode.

**Cause:** Theme name not in Shiki's bundled themes, or `dark-theme` not set.

**Solution:**
1. Verify theme name in [Shiki's bundled themes](https://shiki.style/themes)
2. For dark mode support, always provide both `theme` and `dark-theme` params
3. Check `src/shiki-loader/themes.ts` for documented themes

### CSS Not Embedding Properly

**Symptoms:** Copy button styling broken, language label missing.

**Cause:** Embed script failed or CSS modifications not compiled.

**Solution:**
1. After editing `loader.css`, run `bun run build:lib` again
2. Check `public/shiki-loader.js` contains CSS (view source, search for `.shiki-loader`)
3. If build fails, check for syntax errors in `loader.css`

### Build Fails with Bun Version Mismatch

**Symptoms:** `bun run build:lib` throws errors about features not supported.

**Cause:** Bun version too old.

**Solution:** Update Bun with `bun upgrade` and try again.

## References

- **README.md**: User-facing documentation for the loader and demo app
- **.github/copilot-instructions.md**: The original Copilot guidelines this document is based on
- **[Shiki Documentation](https://shiki.style/)**: Official Shiki theme and language reference
