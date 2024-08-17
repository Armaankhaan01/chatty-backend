import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint, { parser } from "typescript-eslint";

export default [
  { files: ["src/**/*.{js,ts}"] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser,
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "eslint.config.mjs" , "**/build/**"],
  },
  {
    rules: {
      semi: [2, "always"],
      "space-before-function-paren": [
        0,
        { anonymous: "always", named: "always", asyncArrow: "always" },
      ],
      camelcase: 0,
      "no-return-assign": 0,
      quotes: ["error", "single"],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
