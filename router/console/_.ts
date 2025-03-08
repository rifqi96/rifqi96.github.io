import type { RouteRecordRaw } from "vue-router";
import { UserRole } from "@/types/User";
import experienceRoutes from "./experience";
import projectRoutes from "./projects";
import blogRoutes from "./blog";

const routes: RouteRecordRaw[] = [
  {
    path: "/console",
    name: "console",
    component: () => import("~/pages/console/index.vue"),
    meta: {
      layout: "console",
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
      layout: "console",
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
      layout: "console",
      title: "Users",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
  ...experienceRoutes,
  ...projectRoutes,
  ...blogRoutes,
];

export default routes;
