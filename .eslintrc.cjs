/** @type {import('eslint').Linter.Config} */
module.exports = {
  ignorePatterns: ["!.prettierrc.cjs", "/coverage", "/build", "/public/build"],
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "prettier",
  ],
};
