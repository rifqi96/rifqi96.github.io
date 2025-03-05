import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/_main",
    name: "projects",
    component: () => import("~/pages/_main/projects.vue"),
    meta: {
      title: "Projects",
      middleware: [],
      layout: "default",
    },
  },
];

export default routes;
