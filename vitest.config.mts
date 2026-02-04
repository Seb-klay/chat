import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    server: {
      deps: {
        inline: [/^(?!.*node_modules).*/, 'react-toastify'], 
      },
    },
    setupFiles: "./vitest.setup.ts",
  },
})