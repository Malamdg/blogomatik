const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    files: ["src/js/**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": ["error", { caughtErrors: "none" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["src/bundler/**/*.js", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
  },
];
