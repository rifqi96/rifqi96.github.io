// app/router.options.ts
import type { RouterConfig } from "@nuxt/schema";
import type { RouteRecordRaw } from "vue-router";
import routes from "~/router/_";
import subdomainConfig from "~/config/subdomain.config";

export default <RouterConfig>{
  routes: (_routes) => {
    let currentSubdomain = "";

    if (import.meta.server) {
      const event = useRequestEvent();
      currentSubdomain = event?.context.subdomain || "";
    }
    if (import.meta.client) {
      const hostname = window.location.hostname.split(":")[0];
      currentSubdomain = hostname === "localhost" ? "" : hostname.split(".")[0];
    }

    const directory = subdomainConfig[currentSubdomain] || subdomainConfig.main;

    function isUnderDirectory(route: RouteRecordRaw, dir: string) {
      const path = route.path;
      // For main routes that are already transformed, check their meta
      if (dir === subdomainConfig.main && route.meta?.subdomain === "main") {
        return true;
      }
      return path === `/${dir}` || path.startsWith(`/${dir}/`);
    }

    // Uncomment out for debugging purposes
    // console.log(
    //   "Initial routes:",
    //   routes.map((r) => ({ path: r.path, name: r.name })),
    // );

    const newRoutes = routes
      .filter((route: RouteRecordRaw) => {
        if (directory === subdomainConfig.main) {
          // For main domain, include both main routes and routes without other subdomains
          return (
            route.meta?.subdomain === "main" ||
            !Object.values(subdomainConfig)
              .filter((d) => d !== subdomainConfig.main)
              .some((d) => isUnderDirectory(route, d))
          );
        }
        return isUnderDirectory(route, directory);
      })
      .map((route: RouteRecordRaw) => {
        // If it's a main route that's already transformed, return it as is
        if (
          directory === subdomainConfig.main &&
          route.meta?.subdomain === "main"
        ) {
          return route;
        }

        if (isUnderDirectory(route, directory)) {
          const newPath = route.path.replace(`/${directory}`, "") || "/";
          const newName =
            directory === subdomainConfig.main
              ? route.name
              : `${directory}-${route.name
                  ?.toString()
                  .replace(`${directory}-`, "")}`;

          const newRoute = {
            ...route,
            path: newPath,
            name: newName,
            meta: {
              ...route.meta,
              originalPath: route.path,
              subdomain: directory,
            },
          };

          // Uncomment out for debugging purposes
          // console.log("Transformed route:", {
          //   from: { path: route.path, name: route.name },
          //   to: { path: newRoute.path, name: newRoute.name },
          // });

          return newRoute;
        }
        return route;
      });

    // Add a catch-all route for the root path in subdomains
    if (directory !== subdomainConfig.main) {
      newRoutes.push({
        path: "/",
        name: `${directory}-index`,
        redirect: `/${newRoutes[0]?.path.replace(/^\//, "") || ""}`,
      });
    }

    // Uncomment out for debugging purposes
    // console.log(
    //   "Final routes:",
    //   newRoutes.map((r) => ({ path: r.path, name: r.name })),
    // );
    return newRoutes;
  },
};
