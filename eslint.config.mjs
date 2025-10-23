// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImport from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      import: eslintPluginImport,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
      {
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-floating-promises': 'warn',
          '@typescript-eslint/no-unsafe-argument': 'warn',
          "prettier/prettier": ["error", { endOfLine: "auto" }],
          "no-console": "error",
          // Import ordering rules
          "import/order": [
            "error",
            {
              "groups": [
                "builtin",
                "external",
                "internal",
                "parent",
                "sibling",
                "index"
              ],
              "newlines-between": "always",
              "alphabetize": {
                "order": "asc",
                "caseInsensitive": true
              }
            }
          ],
          "import/newline-after-import": "error",
          "import/no-duplicates": "error"
        },
      },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
