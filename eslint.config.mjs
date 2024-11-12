import globals from "globals";
import pluginJs from "@eslint/js";
import pluginJest from "eslint-plugin-jest";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,  
      },
    },
    plugins: {
      js: pluginJs,
      jest: pluginJest,  
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginJest.configs.recommended.rules,
    },
  },
];
