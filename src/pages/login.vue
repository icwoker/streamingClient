<template>
  <div class="background">
    <Login v-if="isLogin" @register="isLogin = false" />
    <Register v-else @login="isLogin = true" />
  </div>
</template>

<script setup lang="ts">
import Login from "@/components/login/login.vue";
import Register from "@/components/login/register.vue";

import { ref } from "vue";
const isLogin = ref(true);
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 背景容器 */
.background {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(270deg, #ff6f61, #6f61ff, #72b069);
  background-size: 600% 600%;
  animation: gradientAnimation 15s ease infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* 渐变动画 */
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
