import type { RouteRecordRaw } from "vue-router";
import { UserRole } from "@/types/User";

const routes: RouteRecordRaw[] = [
  {
    path: "/console/experience",
    name: "console-experience",
    component: () => import("~/pages/console/experience/index.vue"),
    meta: {
      layout: "console",
      title: "Work Experience",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
  {
    path: "/console/experience/new",
    name: "console-experience-new",
    component: () => import("~/pages/console/experience/new.vue"),
    meta: {
      layout: "console",
      title: "Add Work Experience",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
  {
    path: "/console/experience/:id",
    name: "console-experience-edit",
    component: () => import("~/pages/console/experience/[id].vue"),
    meta: {
      layout: "console",
      title: "Edit Work Experience",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
];

export default routes;
