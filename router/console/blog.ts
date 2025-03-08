import { UserRole } from "@/types/User";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/console/blog",
    name: "console-blog",
    component: () => import("~/pages/console/blog/index.vue"),
    meta: {
      title: "Blog Management",
      middleware: ["auth"],
      requireRole: UserRole.SUPERADMIN,
    },
  },
  {
    path: "/console/blog/new",
    name: "console-blog-new",
    component: () => import("~/pages/console/blog/new.vue"),
    meta: {
      title: "New Blog Post",
      middleware: ["auth"],
      requireRole: UserRole.SUPERADMIN,
    },
  },
  {
    path: "/console/blog/:id",
    name: "console-blog-edit",
    component: () => import("~/pages/console/blog/[id].vue"),
    meta: {
      title: "Edit Blog Post",
      middleware: ["auth"],
      requireRole: UserRole.SUPERADMIN,
    },
  },
];

export default routes;
