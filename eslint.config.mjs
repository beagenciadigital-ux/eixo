import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy Vite-era UI (Mantine 5 + React Router); lint incrementally later.
    "src/game/**",
    // Express/TypeORM handlers live here; lint incrementally later.
    "src/server/**",
    // Node CommonJS scripts (require() is intentional).
    "scripts/**/*.cjs",
  ]),
]);

export default eslintConfig;
