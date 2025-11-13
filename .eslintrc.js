module.exports = {
  root: true,
  env: { node: true, browser: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": "warn",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: { project: ["./tsconfig.json"] },
    },
  ],
};
