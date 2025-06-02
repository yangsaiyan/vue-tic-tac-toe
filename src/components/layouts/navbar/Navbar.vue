<script setup lang="ts">
import { onMounted } from "vue";
import { auth } from "../../../utils/gunjs";
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  auth.logout();
  router.push("/authentication");
};

onMounted(async () => {
  await checkAuthStatus();
});

const checkAuthStatus = async () => {
  const hasSession = (await auth.checkSession()) as boolean;
  if (!hasSession && localStorage.getItem('userEmail')) {
    localStorage.removeItem('userEmail');
    router.push("/authentication");
  }
};

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="navbar-container">
    <div class="navbar-selection-container">
      <div
        class="navbar-selection"
        :class="{
          selected:
            router.currentRoute.value.path === '/' ||
            router.currentRoute.value.path === '/game',
        }"
        @click="navigateTo('/game')"
      >
        <p>Game</p>
      </div>
      <div
        class="navbar-selection"
        :class="{ selected: router.currentRoute.value.path === '/history' }"
        @click="navigateTo('/history')"
      >
        <p>History</p>
      </div>
    </div>
    <button class="logout-button" @click="logout">Logout</button>
  </div>
</template>

<style scoped>
.navbar-container {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: fit-content;
  padding-top: 20px;
}

.navbar-selection-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-content: center;

  width: fit-content;
  background-color: #000000;
  border-radius: 32px;
}

.navbar-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 20px;
  border-radius: 32px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

.navbar-selection.selected {
  background-color: #32323280;
}

.navbar-selection:hover {
  background-color: #28282880;
}

.logout-button {
  position: absolute;
  right: 0;
  margin-right: 20px;
  background-color: #1818188e;
  border-radius: 32px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
</style>
