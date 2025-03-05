import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/_main",
    name: "index",
    component: () => import("~/pages/_main/index.vue"),
    meta: {
      title: "Home",
      middleware: [],
      layout: "default",
    },
  },
];

export default routes;
