<script setup lang="ts">
import { onMounted, ref } from "vue";
import { auth } from "../../../utils/gunjs";
import { useRouter } from "vue-router";

const router = useRouter();

const logout = async () => {
  try {
    await auth.logout();
    router.push("/authentication");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

onMounted(async () => {
  if (!localStorage.getItem("username")) {
    await auth.logout();
    router.push("/authentication");
  }

  try {
    await checkAuthStatus();
  } catch (error) {
    console.error("Auth check failed:", error);
    await auth.logout();
    router.push("/authentication");
  }
});

const isExpanded = ref(true);

const checkAuthStatus = async () => {
  const hasSession = await auth.checkSession();
  if (!hasSession || !localStorage.getItem("userEmail")) {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    await router.push("/authentication");
  }
};

const navigateTo = (path: string) => {
  router.push(path);
};

const handleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="navbar-container">
    <img
      :class="{ 'arrow-icon': isExpanded, 'arrow-icon-shrinked': !isExpanded }"
      src="../../../assets/arrow.svg"
      alt="arrow"
      @click="handleExpand"
    />
    <div :class="{ 'navbar-cta': isExpanded, 'navbar-cta-off': !isExpanded }">
      <div class="navbar-selection-container">
        <div
          class="navbar-selection"
          :class="{
            selected:
              router.currentRoute.value.path === '/' ||
              router.currentRoute.value.path === '/game',
          }"
          @click="navigateTo('/')"
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
  </div>
</template>

<style scoped>
.navbar-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: fit-content;
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
  margin-right: 20px;
  background-color: #1818188e;
  border-radius: 32px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.arrow-icon {
  position: absolute;
  left: 0;
  margin-left: 20px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}

.arrow-icon-shrinked {
  position: absolute;
  left: 0;
  margin-left: 20px;
  width: 20px;
  transform: rotate(-90deg);
  transition: transform 0.2s ease;

  cursor: pointer;
}

.navbar-cta {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  padding-left: 60px;
  overflow: scroll;

  transition: transform 0.5s ease;
  overflow: hidden;
}

.navbar-cta-off {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  padding-left: 60px;

  transform: translateX(-200%);
  transition: transform 0.5s ease;
}
</style>
