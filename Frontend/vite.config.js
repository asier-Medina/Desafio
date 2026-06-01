import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@routes": path.resolve(__dirname, "./src/routes/"),
      "@components": path.resolve(__dirname, "./src/shared/components/"),
      "@hooks": path.resolve(__dirname, "./src/shared/hooks/"),
      "@features": path.resolve(__dirname, "./src/features/"),
      "@ui": path.resolve(__dirname, "./src/shared/ui/"),
      "@shared": path.resolve(__dirname, "./src/shared/"),
      "@services": path.resolve(__dirname, "./src/services/"),
    },
  },
});