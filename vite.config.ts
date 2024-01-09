import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      globs: ["src/components/**/*.vue"],
      dts: "components.d.ts",
      // filters for transforming targets
      include: [/\.vue$/, /\.vue\?vue/],
      exclude: [
        /[\\/]node_modules[\\/]/,
        /[\\/]\.git[\\/]/,
        /[\\/]\.nuxt[\\/]/,
        /[\\/]dist[\\/]/,
        /src\/components\/\*\*\/\*.stories\.vue/,
      ],
    }),
    AutoImport({
      // Auto import `vue` runtime
      imports: ["vue", "vue-router"],
      dirs: [
        // Composables
        // Scan top-level modules
        "src/composables",
        // scan all nested modules with a specific file extension
        "src/composables/**/*.{ts,js,mjs,mts}",

        // Utils
        // Scan top-level modules
        "src/utils",
        // scan all nested modules with a specific file extension
        "src/utils/**/*.{ts,js,mjs,mts}",
      ],
      dts: "auto-imports.d.ts",
      exclude: [
        /[\\/]node_modules[\\/]/,
        /[\\/]\.git[\\/]/,
        /[\\/]\.nuxt[\\/]/,
        /[\\/]dist[\\/]/,
      ],
    }),
  ],
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
