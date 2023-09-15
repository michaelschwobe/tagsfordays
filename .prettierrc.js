/**
 * @type {import("prettier").Config}
 * @type {import("prettier-plugin-tailwindcss").PluginOptions}
 */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["clsx", "cn", "cva"],
};
