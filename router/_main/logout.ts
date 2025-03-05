import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/_main",
    name: "logout",
    component: () => import("~/pages/_main/logout.vue"),
    meta: {
      title: "Logging out",
    },
  },
];

export default routes;
