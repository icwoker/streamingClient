import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import type { RouteRecordRaw } from "vue-router";
const router = createRouter({
  history: createWebHistory(),
  routes: routes as RouteRecordRaw[],
});
  
export default router;
