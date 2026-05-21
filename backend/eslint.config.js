import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
    ignores: ["node_modules/", "prisma/"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
];
