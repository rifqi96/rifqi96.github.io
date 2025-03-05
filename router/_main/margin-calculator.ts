import type { RouteRecordRaw } from "vue-router";
import { UserRole } from "@/domains/auth/types";

const routes: RouteRecordRaw[] = [
  {
    path: "/_main",
    name: "margin-calculator",
    component: () => import("~/pages/_main/margin-calculator/index.vue"),
    meta: {
      title: "Margin Calculator",
      middleware: ["auth"],
      requiredRole: UserRole.SUPERADMIN,
      requireWhitelist: true,
    },
  },
];

export default routes;
