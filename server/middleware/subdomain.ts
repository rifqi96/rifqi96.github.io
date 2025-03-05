import { defineEventHandler, getRequestHeader } from "h3";

export default defineEventHandler((event) => {
  const host = getRequestHeader(event, "host") || "";
  // Fix: properly extract subdomain by handling port number
  const hostname = host.split(":")[0]; // Remove port number if exists
  const subdomain = hostname.split(".")[0] || "";

  // Don't set subdomain if it's just localhost
  event.context.subdomain = subdomain === "localhost" ? "" : subdomain;
});
