module.exports = {
  root: true,
  ignorePatterns: [
    'coverage/**',
    'dist/**',
    'build/**',
    'node_modules/**',
    '**/*.d.ts',
    '**/*.config.js',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
    linkComponents: [
      { name: 'RouterLink', linkAttribute: ['href', 'to'] },
      { name: 'Link', linkAttribute: ['href', 'to'] },
    ],
    jest: {
      version: '29.0',
    },
  },
  overrides: [
    {
      files: ['*.js', '**/*.styles.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/*.styles.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-return': 'off',
      },
    },
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended-legacy',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:testing-library/react',
    'plugin:@vitest/legacy-recommended',
    'plugin:jest/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'sonarjs',
    'import',
    'prettier',
    'react',
    'react-hooks',
    'jsx-a11y',
    'testing-library',
    '@vitest',
    'jest',
  ],
  rules: {
    /** React-specific rules */
    'react/hook-use-state': ['warn', { allowDestructuredState: true }],
    'react/react-in-jsx-scope': ['off'],
    'react/no-array-index-key': ['error'],
    'react/display-name': ['off'],
    'react/prop-types': ['off'],

    /** Accessibility rules */
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link', 'RouterLink'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],

    /** Best practices and coding style */
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'prefer-const': ['error'],
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    'no-nested-ternary': ['error'],

    /** SonarJS rules */
    'sonarjs/cognitive-complexity': ['error'],
    'sonarjs/no-inverted-boolean-check': ['off'],
    'sonarjs/no-duplicate-string': ['off'],

    /** Import rules */
    'import/no-anonymous-default-export': 'off',
    'import/no-cycle': ['off'],
    'import/namespace': ['off'],
    'import/no-named-as-default': ['off'],
    'import/no-unresolved': [
      'off',
      {
        ignore: ['^src/'],
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: 'src/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
      },
    ],

    /** TypeScript-specific rules */
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-unsafe-return': ['warn'],
    '@typescript-eslint/no-unsafe-call': ['warn'],
    '@typescript-eslint/no-unsafe-member-access': ['warn'],
    '@typescript-eslint/no-unsafe-assignment': ['warn'],
    '@typescript-eslint/prefer-optional-chain': ['error'],
    '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Array: {
            message: 'Use yourType[] instead. So for Array<string> you need to use string[]',
          },
        },
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase'],
        prefix: ['is', 'should', 'has', 'can', 'did', 'will', 'are'],
      },
    ],

    /** File size constraints */
    'max-lines': ['warn', { max: 250, skipComments: true, skipBlankLines: true }],
  },
};
