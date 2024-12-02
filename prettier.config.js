/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: true,
  tabWidth: 2,
  endOfLine: "lf",
  printWidth: 140,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
