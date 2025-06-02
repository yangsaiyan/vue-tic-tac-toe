<script setup lang="ts">
import Navbar from '../components/layouts/navbar/Navbar.vue';
</script>

<template>
  <div class="layout-root">
    <Navbar />
    <div class="layout-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.layout-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-content {
  width: 100%;
  height: 100%;
  flex: 1;
}
</style>
