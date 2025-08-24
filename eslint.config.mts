// import eslint from "@eslint/js";
// import globals from "globals";
// import tseslint from "typescript-eslint";
// import markdown from "@eslint/markdown";
// import { defineConfig } from "eslint/config";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  {
    ignores: ["dist/**"],
  }
);
//
// export default defineConfig([
//   {
//     files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
//     plugins: { js },
//     extends: ["js/recommended"],
//     languageOptions: { globals: { ...globals.browser, ...globals.node } },
//   },
//   // ...tseslint.config(tseslint.configs.recommended),
//   {
//     files: ["**/*.md"],
//     plugins: { markdown },
//     language: "markdown/gfm",
//     extends: ["markdown/recommended"],
//   },
// ]);
