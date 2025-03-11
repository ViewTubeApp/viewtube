import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import drizzle from "eslint-plugin-drizzle";
import compiler from "eslint-plugin-react-compiler";
import tseslint from "typescript-eslint";

const compat = new FlatCompat();

export default [
  { ignores: ["node_modules/**", ".next/**", "dist/**", "src/paraglide/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.config({ extends: ["next"] }),
  compiler.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      drizzle: drizzle,
      "@next/next": next,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: true },
    },
    rules: {
      "react/jsx-no-literals": "warn",
      "react-compiler/react-compiler": "error",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
      "drizzle/enforce-delete-with-where": ["error", { drizzleObjectName: ["db", "ctx.db"] }],
      "drizzle/enforce-update-with-where": ["error", { drizzleObjectName: ["db", "ctx.db"] }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
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
      ],
    },
  },
  {
    files: ["tailwind.config.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["eslint.config.mjs"],
    rules: { "import/no-anonymous-default-export": "off" },
  },
];
