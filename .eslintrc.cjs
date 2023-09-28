/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "prettier",
  ],
  ignorePatterns: [
    "!.prettierrc.cjs",
    "/build",
    "/coverage",
    "/playwright-report",
    "/playwright/.cache",
    "/public/build",
    "/test-results",
  ],
};
