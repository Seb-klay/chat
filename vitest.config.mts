import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  return {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
      globals: true,
      server: {
        deps: {
          inline: [/^(?!.*node_modules).*/, "react-toastify"],
        },
      },
      env: loadEnv(mode, process.cwd(), ""),
      setupFiles: "./vitest.setup.ts",
    },
  };
});
