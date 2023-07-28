/**
 * @type {import("prettier").Config}
 * @type {import("prettier-plugin-tailwindcss").PluginOptions}
 */
module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["clsx", "cva"],
};
