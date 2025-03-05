import type { RouteRecordRaw } from "vue-router";

// Assuming these imports contain the route definitions
import index from "./index";
import projects from "./projects";
import marginCalculator from "./margin-calculator";
import blog from "./blog";
import syncSession from "./sync-session";
import logout from "./logout";

// Ensure each route has a unique path
const routes: RouteRecordRaw[] = [
  ...index.map((route) => ({
    ...route,
    path: route.path === "/_main" ? "/" : route.path,
    meta: { ...route.meta, subdomain: "main" },
  })),
  ...projects.map((route) => ({
    ...route,
    path: route.path === "/_main" ? "/projects" : route.path,
    meta: { ...route.meta, subdomain: "main" },
  })),
  ...marginCalculator.map((route) => ({
    ...route,
    path: route.path === "/_main" ? "/margin-calculator" : route.path,
    meta: { ...route.meta, subdomain: "main" },
  })),
  ...blog.map((route) => ({
    ...route,
    path: route.path === "/_main" ? "/blog" : route.path.replace("/_main", ""),
    meta: { ...route.meta, subdomain: "main" },
  })),
  ...syncSession.map((route) => ({
    ...route,
    path: route.path === "/_main" ? "/sync-session" : route.path,
    meta: { ...route.meta, subdomain: "main" },
  })),
  ...logout.map((route) => ({
    ...route,
    path: route.path === "/_main" ? "/logout" : route.path,
    meta: { ...route.meta, subdomain: "main" },
  })),
];

export default routes;
