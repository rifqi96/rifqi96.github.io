// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import { parseBoolean } from "./utils/input.util";

export default defineNuxtConfig({
  // Enable SSR for better SEO
  ssr: true,

  // Runtime config
  runtimeConfig: {
    public: {
      baseURL: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      buildEnv: process.env.NODE_ENV,
      // Supabase configuration
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      // Legacy margin calculator config (will be replaced by options from Supabase)
      mcRequiresPassword: parseBoolean(
        process.env.NUXT_PUBLIC_MC_SHOULD_USE_PASSWORD,
      ),
      mcAleeertDefaultSlot: process.env.NUXT_PUBLIC_MC_ALEEERT_DEFAULT_SLOT,
      mcAleeertDefaultSecret:
        process.env.NUXT_PUBLIC_MC_ALEEERT_DEFAULT_API_SECRET,
      // Domain configuration
      mainDomain: process.env.NUXT_PUBLIC_MAIN_DOMAIN || "rifqi.dev",
      authDomain: process.env.NUXT_PUBLIC_AUTH_DOMAIN || "auth.rifqi.dev",
      consoleDomain:
        process.env.NUXT_PUBLIC_CONSOLE_DOMAIN || "console.rifqi.dev",
      // Cookie configuration for authentication
      cookieDomain: process.env.NUXT_PUBLIC_COOKIE_DOMAIN || ".rifqi.dev", // Shared across all subdomains
      cookieSecure: process.env.NODE_ENV === "production", // Only secure in production
    },
    // Private server-side config
    supabaseServiceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
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
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },

    // Content modules (for CMS functionality)
    "@nuxt/content",
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
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

  // Configure cookie options for authentication
  appConfig: {
    nuxtCookies: {
      sameSite: "lax", // Allow cookies to be sent on navigations
    },
  },

  // Global middleware for authentication
  routeRules: {
    // Auth domain rules
    "/auth/**": {
      ssr: true,
    },
    // Console domain rules - protected by superadmin role
    "/console/**": {
      ssr: true,
      appMiddleware: ["auth"],
      // @todo: meta isn't available. to fix later
      // meta: {
      //   requireRole: "superadmin",
      // },
    },
    // Margin calculator domain - protected by whitelist
    "/margin-calculator/**": {
      ssr: true,
      appMiddleware: ["auth"],
      // @todo: meta isn't available. to fix later
      // meta: {
      //   requireWhitelist: true,
      // },
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
    // Sitemap configuration
    urls: async () => {
      const baseURL =
        process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
      // Default URLs
      const urls = ["/", "/projects", "/blog"].map((url) => `${baseURL}${url}`);
      return urls;
    },
    // Enable sitemap.xml generation
    enabled: true,
  },

  // Configure robots.txt
  robots: {
    groups: [
      {
        userAgent: "*",
        allow: ["/"],
      },
      // Auth domain should never be indexed
      {
        userAgent: "*",
        disallow: ["/auth/**"],
      },
      // Console domain should never be indexed
      {
        userAgent: "*",
        disallow: ["/console/**"],
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
