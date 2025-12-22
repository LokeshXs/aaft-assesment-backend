// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import path from "node:path";

export default defineConfig({
  languageOptions:{
  parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: path.resolve(),
      },
  },
  files: ["**/*.ts"],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
  ],
  ignores:[
    "node_modules",
    "dist"
  ]
});
