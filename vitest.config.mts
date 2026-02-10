import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  return {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
      globals: true,
      fileParallelism: false,
      pool: 'threads',
      server: {
        deps: {
          inline: [
            /^(?!.*node_modules).*/, 
            "react-toastify",
            "html-encoding-sniffer",
            "@exodus/bytes",
          ],
        },
      },
      env: loadEnv(mode, process.cwd(), ""),
      setupFiles: "./vitest.setup.ts",
    },
    resolve: {
      alias: {
        "server-only": path.resolve(__dirname, "test/__test__/integration/server-only.ts"),
      },
    }
  };
});
