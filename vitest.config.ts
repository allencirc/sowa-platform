import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    pool: "forks",
    setupFiles: ["./src/__tests__/setup.tsx"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "html"],
      include: ["src/lib/**", "src/components/**", "src/app/api/**"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/__tests__/**", "src/lib/data/**"],
    },
  },
});
