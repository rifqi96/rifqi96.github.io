import type { RouteRecordRaw } from "vue-router";
import { UserRole } from "@/types/User";

const routes: RouteRecordRaw[] = [
  {
    path: "/_main",
    name: "margin-calculator",
    component: () => import("~/pages/_main/margin-calculator/index.vue"),
    meta: {
      title: "Margin Calculator",
      middleware: ["auth"],
      requireWhitelist: true,
    },
  },
];

export default routes;
