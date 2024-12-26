/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: true,
  tabWidth: 2,
  endOfLine: "lf",
  printWidth: 120,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  experimentalTernaries: true,
  plugins: ["prettier-plugin-tailwindcss", "@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@/server/(.*)$",
    "^@/lib/(.*)$",
    "^@/constants/(.*)$",
    "^@/components/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
