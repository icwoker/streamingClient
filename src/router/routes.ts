export const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/Home.vue"),
  },
  {
    path:"/home",
    redirect:"/"
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/login.vue"),
  },
  {
    path: "/userinfo",
    redirect: "/userinfo/info",
  },
  {
    path: "/userinfo/:tab",
    name: "userInfo",
    component: () => import("@/pages/userInfo.vue"),
  },
  {
    path: "/live/:id",
    name: "live",
    component: () => import("@/components/liveHome/liveHome.vue"),
  },
  {
    path: "/live",
    redirect: "/live/1",
  },
];
