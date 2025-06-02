import { createRouter, createWebHistory } from "vue-router";
import Layout from "../layout/Layout.vue";
import AuthenticationLayout from "../layout/AuthenticationLayout.vue";
import Authentication from "../pages/Authentication/index.vue";
import Board from "../components/features/Board/Board.vue";
import History from "../components/features/History/History.vue";
import RoomList from "../components/features/Room/Room.vue";

const routes = [
  {
    path: "/",
    component: Layout,
    children: [
      { path: "", component: RoomList },
      { path: "game", component: Board },
      { path: "history", component: History },
    ],
  },
  {
    path: "/authentication",
    component: AuthenticationLayout,
    children: [{ path: "", component: Authentication }],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
