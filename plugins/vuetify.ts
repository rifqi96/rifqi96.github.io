// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";

export const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#4A4A4A",
          secondary: "#1E1E1E",
          accent: "#6C63FF",
          error: "#E63946",
          info: "#3A86FF",
          success: "#00B488",
          warning: "#F4A261",

          white: "#FFFFFF",
          "surface-light": "#f9f9f9", // surface base
          "surface-dark": "#212529", // primary-base
          "text-muted": "#666666",
          "text-primary": "#495057",

          // Additional Colors
          "neutral-darkest": "#333333",
          "neutral-dark": "#444444",
          "neutral-light": "#888888",

          link: "#646cff",
          "link-hover": "#535bf2",
          "link-alt": "#5a54ff",

          "accent-alt": "#747bff",
          "blue-dark": "#213547",

          "bg-alt": "#f5f5f5",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#EEEEEE", // Brighter text for better contrast
          secondary: "#CCCCCC", // Softer gray for secondary elements
          accent: "#7A72FF", // Balanced blue-violet, still vibrant but easier on the eyes
          error: "#FF6B6B", // Adjusted for better visibility in dark mode
          info: "#64A8F6", // Slightly deeper blue for better contrast
          success: "#22B573", // Bright green with good readability
          warning: "#F4A261", // Warm and modern orange tone

          white: "#0A0A0A", // Swapped to a near-black contrast color
          "surface-light": "#121212", // True dark mode background
          "surface-dark": "#1E1E1E", // Slightly lighter dark surface (cards, containers)
          "text-muted": "#A0A0A0", // Muted text in dark mode
          "text-primary": "#E0E0E0", // Primary text color in dark mode

          // Additional Colors
          "neutral-darkest": "#EEEEEE",
          "neutral-dark": "#CCCCCC",
          "neutral-light": "#AAAAAA",

          link: "#8C99FF",
          "link-hover": "#7A72FF",
          "link-alt": "#6974FF",

          "accent-alt": "#7B82FF",
          "blue-dark": "#394B66",

          "bg-alt": "#1A1A1A",
        },
      },
    },
  },
  defaults: {
    global: {
      font: {
        family: "Poppins, system-ui, Avenir, Helvetica, Arial, sans-serif",
      },
    },
  },
});

export default defineNuxtPlugin((app) => {
  app.vueApp.use(vuetify);
});
