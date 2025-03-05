import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/_main",
    name: "sync-session",
    component: () => import("~/pages/_main/sync-session.vue"),
    meta: {
      title: "Syncing Session",
    },
  },
];

export default routes;
