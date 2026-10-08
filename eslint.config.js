import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const DEEP_IMPORT = {
  group: ['@/api/*', '@/state/*', '@/lib/*', '@/components/*/*', '@/features/*/*', './*/*', '../*/*'],
  message: 'Import from the folder index ("./components", "@/features/chat"), not from a file inside it.',
};
const OTHER_FOLDER = 'Import other folders through "@/<folder>", not by a relative path.';
const restrictImports = (relativeGroup) => [
  'error',
  { patterns: [DEEP_IMPORT, { group: [relativeGroup], message: OTHER_FOLDER }] },
];

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh, 'simple-import-sort': simpleImportSort },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-deprecated': 'error',
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      '@typescript-eslint/no-restricted-imports': restrictImports('../../*'),
      'simple-import-sort/imports': ['error', { groups: [['^\\u0000'], ['^@?\\w'], ['^@/'], ['^\\.']] }],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['src/*.{ts,tsx}', 'src/*/*.{ts,tsx}', 'src/components/*/*.{ts,tsx}', 'src/features/*/*.{ts,tsx}'],
    rules: { '@typescript-eslint/no-restricted-imports': restrictImports('../*') },
  },
);
