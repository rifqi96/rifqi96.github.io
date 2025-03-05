import type { RouteRecordRaw } from "vue-router";
import { UserRole } from "@/domains/auth/types";

const routes: RouteRecordRaw[] = [
  {
    path: "/console",
    name: "console",
    component: () => import("~/pages/console/index.vue"),
    meta: {
      layout: "console", // Add this line
      title: "Console",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
  {
    path: "/console/settings",
    name: "console-settings",
    component: () => import("~/pages/console/settings.vue"),
    meta: {
      layout: "console", // Add this line
      title: "Settings",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
  {
    path: "/console/users",
    name: "console-users",
    component: () => import("~/pages/console/users/index.vue"),
    meta: {
      layout: "console", // Add this line
      title: "Users",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
];

export default routes;
