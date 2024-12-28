/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "drizzle"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  rules: {
    "react/jsx-no-literals": "warn",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    "drizzle/enforce-delete-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
    "drizzle/enforce-update-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        name: "next/link",
        message: "Please import from `@/i18n/routing` instead.",
      },
      {
        name: "next/navigation",
        importNames: ["redirect", "permanentRedirect", "useRouter", "usePathname"],
        message: "Please import from `@/i18n/routing` instead.",
      },
    ],
  },
  overrides: [
    {
      files: ["tailwind.config.ts"],
      rules: {
        "@typescript-eslint/no-require-imports": "off",
      },
    },
  ],
};

module.exports = config;
