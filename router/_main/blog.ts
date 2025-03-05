import type { RouteRecordRaw } from "vue-router";
import { UserRole } from "@/domains/auth/types";

const routes: RouteRecordRaw[] = [
  {
    path: "/_main",
    name: "blog",
    component: () => import("~/pages/_main/blog/index.vue"),
    meta: {
      title: "Blog",
      middleware: [],
    },
  },
  {
    path: "/_main/blog/:slug",
    name: "blog-post",
    component: () => import("~/pages/_main/blog/[slug].vue"),
    meta: {
      title: "Blog Post",
      middleware: [],
    },
  },
];

export default routes;
