export default defineNuxtPlugin(() => {
  let subdomain = "";
  if (import.meta.client) {
    const hostname = window.location.hostname.split(":")[0]; // Remove port number if exists
    subdomain = hostname === "localhost" ? "" : hostname.split(".")[0];
  }
  return {
    provide: {
      subdomain,
    },
  };
});
