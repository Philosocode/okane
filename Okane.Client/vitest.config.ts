// External
import { fileURLToPath, URL } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'

// Internal
import viteConfig from './vite.config'

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        coverage: {
          provider: 'v8',
        },
        environment: 'jsdom',
        exclude: [...configDefaults.exclude],
        globals: true,
        root: fileURLToPath(new URL('./', import.meta.url)),
        setupFiles: [
          './src/__tests__/setup/customMatchers.ts',
          './src/__tests__/setup/vueTestUtilExtensions.ts',
          './src/__tests__/setup/testHooks.ts',
          './src/__tests__/setup/getMountComponent.ts',
        ],
        watch: false,
      },
    }),
  ),
)
