import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/auth/login",
    name: "login",
    component: () => import("~/pages/auth/login.vue"),
    meta: {
      title: "Login",
      middleware: [],
    },
    alias: "/login", // Add this alias for better compatibility
  },
  {
    path: "/auth/callback",
    name: "callback",
    component: () => import("~/pages/auth/callback.vue"),
    meta: {
      title: "Callback",
      middleware: [],
    },
    alias: "/callback", // Add this alias for better compatibility
  },
  {
    path: "/auth/not-authorized",
    name: "not-authorized",
    component: () => import("~/pages/auth/not-authorized.vue"),
    meta: {
      title: "Not Authorized",
      middleware: [],
    },
    alias: "/not-authorized", // Add this alias for better compatibility
  },
];

export default routes;
