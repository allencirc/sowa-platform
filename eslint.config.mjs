import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  // Disable React Compiler / strict-hooks rules that flag valid patterns
  // throughout the codebase (data-fetching in useEffect, inline helper
  // components, window.prompt in event handlers).
  {
    rules: {
      "react-compiler/react-compiler": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/purity": "off",
    },
  },
  // Exclude e2e/ from React hook rules — Playwright's `use()` fixture
  // API triggers false positives.
  {
    files: ["e2e/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
]);

export default eslintConfig;
