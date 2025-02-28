// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";
export default defineNuxtConfig({
  // Enable SSR for better SEO
  ssr: true,

  // Runtime config
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || "http://localhost:3000",
    },
  },

  // Configure TypeScript
  typescript: {
    strict: true,
    // Temporarily disable type checking on build due to ufo errors
    // @todo: enable type checking on build
    typeCheck: process.env.NODE_ENV !== "production",
    shim: true,
  },

  build: {
    transpile: ["vuetify"],
  },

  // Configure modules
  modules: [
    // SEO modules
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
    "@nuxt/image",

    // UI modules
    "@invictus.codes/nuxt-vuetify",

    // Content modules (for CMS functionality)
    "@nuxt/content",
  ],

  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
      // @TODO: list all vuetify options
      theme: {
        defaultTheme: "light",
        themes: {
          light: {
            dark: false,
            colors: {
              primary: "#6200EA",
              secondary: "#424242",
              accent: "#82B1FF",
              error: "#FF5252",
              info: "#2196F3",
              success: "#4CAF50",
              warning: "#FFC107",
            },
          },
        },
      },
    },

    moduleOptions: {
      /* nuxt-vuetify module options */
      treeshaking: true,
      useIconCDN: true,

      /* vite-plugin-vuetify options */
      styles: true,
      autoImport: true,
      useVuetifyLabs: false,
    },
  },

  // Configure app metadata
  app: {
    head: {
      title: "Rifqi Ruhyattamam | Software Engineer",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Personal website of Rifqi Ruhyattamam, Software Engineer",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.svg" }],
    },
  },

  // Include global CSS
  css: ["/assets/css/main.css"],

  // Configure content module
  content: {
    // Content module configuration (for blog/CMS features)
    documentDriven: true,
    highlight: {
      theme: "github-dark",
    },
  },

  // Configure image module
  image: {
    // Image optimization configuration
    provider: "ipx",
  },

  // Configure sitemap
  sitemap: {
    urls: ["https://rifqi.dev"],
  },

  // Configure robots.txt
  robots: {
    groups: [
      {
        userAgent: "*",
        // Temporarily disable indexing until the site is ready
        // @todo: enable indexing when the site is ready
        // allow: ["/"],
        disallow: ["/"],
      },
    ],
  },

  // Add aliases for imports
  alias: {
    "@": path.resolve(__dirname, "."),
    "~": path.resolve(__dirname, "."),
    "@domains": path.resolve(__dirname, "./domains"),
  },

  // Directory structure configuration
  dir: {
    pages: "pages",
    layouts: "layouts",
  },

  compatibilityDate: "2025-02-28",

  devtools: {
    // Temporarily disable devtools to avoid spawn EBADF error
    enabled: false,
    // timeline: {
    //   enabled: true,
    // },
  },
});
