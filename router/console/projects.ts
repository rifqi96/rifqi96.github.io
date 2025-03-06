import { UserRole } from "@/types/User";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/console/projects",
    name: "console-projects",
    component: () => import("~/pages/console/projects/index.vue"),
    meta: {
      layout: "console",
      title: "Projects",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requiredWhitelist: true,
    },
  },
  {
    path: "/console/projects/new",
    name: "console-projects-new",
    component: () => import("~/pages/console/projects/new.vue"),
    meta: {
      layout: "console",
      title: "New Project",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requiredWhitelist: true,
    },
  },
  {
    path: "/console/projects/:id",
    name: "console-projects-edit",
    component: () => import("~/pages/console/projects/[id].vue"),
    meta: {
      layout: "console",
      title: "Edit Project",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requiredWhitelist: true,
    },
  },
];

export default routes;
