import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: [reactCompilerPreset()],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@routes": path.resolve(__dirname, "./src/routes/"),
      "@features": path.resolve(__dirname, "./src/features/"),
      "@shared": path.resolve(__dirname, "./src/shared/"),
      "@components": path.resolve(__dirname, "./src/shared/components/"),
      "@ui": path.resolve(__dirname, "./src/shared/ui/"),
      "@hooks": path.resolve(__dirname, "./src/shared/hooks/"),
      "@services": path.resolve(__dirname, "./src/services/"),
      "@assets": path.resolve(__dirname, "./src/assets/"),
    },
  },
});