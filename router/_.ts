/** =============================================================================
 * This is the routes file that imports all the routes from the different modules
 * and will be used to register all the routes in the app/router.options.ts file
 ============================================================================= */

import type { RouteRecordRaw } from "vue-router";

import consoleRoutes from "./console/_";
import authRoutes from "./auth/_";
import mainRoutes from "./_main/_";

const routes: RouteRecordRaw[] = [
  ...mainRoutes,
  ...authRoutes,
  ...consoleRoutes,
];

export default routes;
