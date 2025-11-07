import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.mjs"], languageOptions: {sourceType: "module"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
];