// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import * as importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';

export default tseslint.config([
  // ─────────────────────────────────────────────
  // Ignored paths
  // ─────────────────────────────────────────────
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'coverage/**', 'node_modules/**'],
  },

  // ─────────────────────────────────────────────
  // Base rule sets
  // ─────────────────────────────────────────────
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  // ─────────────────────────────────────────────
  // Language options
  // ─────────────────────────────────────────────
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ─────────────────────────────────────────────
  // Plugins
  // ─────────────────────────────────────────────
  {
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      sonarjs,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },

  // ─────────────────────────────────────────────
  // Rules
  // ─────────────────────────────────────────────
  {
    rules: {
      /*
       * =============================================================
       * Naming Conventions
       * Enforces consistent naming across classes, interfaces,
       * enums, types, variables, and methods to match NestJS
       * conventions and the project's coding standards.
       * =============================================================
       */
      '@typescript-eslint/naming-convention': [
        'error',
        // Classes: PascalCase (e.g. UsersService, CreateUserDto)
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // Interfaces: PascalCase, optional 'I' prefix allowed
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I?[A-Z][a-zA-Z0-9]*$',
            match: true,
          },
        },
        // Type aliases: PascalCase
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        // Enums: PascalCase name (e.g. UserStatus)
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        // Enum members: SCREAMING_SNAKE_CASE (e.g. ACTIVE, SOFT_DELETED)
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        // Variables and functions: camelCase or UPPER_CASE constants
        {
          selector: ['variable', 'function'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Class methods and properties: camelCase
        {
          selector: ['method', 'classProperty'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Private members: camelCase, leading underscore allowed
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Parameters: camelCase, underscore prefix for unused params
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],

      /*
       * =============================================================
       * TypeScript Safety
       * Catches async misuse, type unsafety, and unnecessary
       * conditions that TypeScript itself may silently allow.
       * =============================================================
       */
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',

      /*
       * =============================================================
       * Explicit Types
       * Requires explicit return types on functions and class
       * members to prevent accidental type widening and make
       * the API surface of services/controllers self-documenting.
       * =============================================================
       */
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          // Do not require 'public' keyword — it is implicit.
          // 'private' and 'protected' must be explicit.
          accessibility: 'no-public',
        },
      ],

      /*
       * =============================================================
       * Consistent Type Usage
       * Enforces interface over type alias for object shapes,
       * and requires type-only imports to be marked with 'type'.
       * =============================================================
       */
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      /*
       * =============================================================
       * Unsafe Operations
       * These rules catch operations on 'any'-typed values.
       * Set to 'error' to prevent unsafe patterns from accumulating.
       * Temporarily downgrade to 'warn' only when migrating legacy
       * code — track as a tech-debt ticket before merging.
       * =============================================================
       */
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      /*
       * =============================================================
       * Unused Variables and Imports
       * unused-imports handles import cleanup automatically.
       * no-unused-vars is turned off in favour of the plugin rule
       * to avoid duplicate reports.
       * =============================================================
       */
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      /*
       * =============================================================
       * Variable Declarations
       * =============================================================
       */
      '@typescript-eslint/no-shadow': 'error',
      'no-shadow': 'off', // Disabled in favour of @typescript-eslint/no-shadow
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',

      /*
       * =============================================================
       * Code Complexity — Single Responsibility Principle
       * Prevents functions from growing too large or deeply nested.
       * Violations are a signal to extract smaller methods.
       * =============================================================
       */
      'complexity': ['error', { max: 10 }],
      'max-depth': ['error', { max: 4 }],
      'max-params': ['error', { max: 4 }],
      'max-lines-per-function': [
        'warn',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],

      /*
       * =============================================================
       * Import Organisation
       * Enforces a consistent import order across all files:
       *   1. NestJS core packages
       *   2. External npm packages
       *   3. Internal path-aliased modules (@/*)
       *   4. Relative imports
       *   5. Type imports
       * =============================================================
       */
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            {
              pattern: '@nestjs/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'import/no-duplicates': 'error',
      'no-duplicate-imports': 'off', // Disabled in favour of import/no-duplicates

      /*
       * =============================================================
       * Code Correctness
       * =============================================================
       */
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-else-return': 'error',
      'no-useless-return': 'error',
      'no-unreachable': 'error',
      'consistent-return': 'error',
      'no-unused-expressions': 'error',

      /*
       * =============================================================
       * Logging
       * NestJS services must use the built-in Logger class.
       * console.* calls are forbidden in all production code.
       * =============================================================
       */
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      /*
       * =============================================================
       * Code Smells — SonarJS
       * Detects patterns that are structurally or logically
       * problematic but are not caught by the TypeScript compiler.
       * =============================================================
       */
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      /*
       * =============================================================
       * Prettier
       * =============================================================
       */
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
]);