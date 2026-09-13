import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".next", "next-env.d.ts", "node_modules", "scripts"] },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      // react-hooks v7 added these; the existing shadcn/ui primitives and the
      // simulated-loading effects trip them. Surfaced as warnings until those
      // are reworked separately.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  eslintConfigPrettier,
);
