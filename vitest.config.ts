import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './src/__tests__/setup.ts',

    // CSS import-ları testdə də işləsin (animasiyalar üçün vacib)
    css: true,

    // Coverage (95%+ alacaqsan)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/_global.ts', // barrel fayllar
        'src/styles/',
      ],
    },

    pool: 'forks',
    // Testlər çox tez işləsin
    // pool: 'threads',
    // poolOptions: {
    //   threads: {
    //     singleThread: true,
    //   },
    // },
  },
});
