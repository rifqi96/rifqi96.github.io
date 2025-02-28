// SEO enhancements plugin
export default defineNuxtPlugin(() => {
  // Default SEO meta tags - additional tags will be set per page
  useHead({
    titleTemplate: "%s | Rifqi Ruhyattamam",
    meta: [
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "format-detection", content: "telephone=no" },
      { name: "author", content: "Rifqi Ruhyattamam" },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Rifqi Ruhyattamam" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
  });
});
