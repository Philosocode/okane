// External
import vue from '@vitejs/plugin-vue'
import { transformLazyShow } from 'v-lazy-show'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    resolve: {
      alias: {
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
        '@tests': fileURLToPath(new URL('./src/__tests__', import.meta.url)),
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            nodeTransforms: [transformLazyShow],
          },
        },
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          secure: false,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@shared/styles/mixins/_index.scss" as *;
            @use "@shared/styles/functions/_index.scss" as *;
          `,
        },
      },
    },
  }
})
