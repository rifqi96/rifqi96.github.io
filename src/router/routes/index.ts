import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/margin-calc",
    name: "MarginCalc",
    component: () => import("../views/MarginCalc.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
