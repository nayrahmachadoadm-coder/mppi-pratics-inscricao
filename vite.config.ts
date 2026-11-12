import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react({ devTarget: "es2018" }), mode === "development" && componentTagger()].filter(Boolean),
  esbuild: {
    target: "es2018",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2018",
    },
  },
  build: {
    target: ["es2018", "firefox60", "chrome64", "edge79", "safari12"],
    cssTarget: ["firefox60", "chrome64", "edge79", "safari12"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
