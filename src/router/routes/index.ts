import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/domains/home/views/HomeView.vue"),
    meta: {
      title: "Rifqi Ruhyattamam | Software Engineer",
    },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("@/domains/home/views/ProjectsView.vue"),
    meta: {
      title: "Projects | Rifqi Ruhyattamam",
    },
  },
  {
    path: "/margin-calculator",
    name: "MarginCalculator",
    component: () =>
      import("@/domains/margin-calculator/views/MarginCalculatorView.vue"),
    meta: {
      title: "Margin Calculator | Rifqi Ruhyattamam",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Update page title based on route meta
router.beforeEach((to, from, next) => {
  const title = to.meta.title as string;
  if (title) {
    document.title = title;
  }
  next();
});

export default router;
