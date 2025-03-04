<template>
  <div class="w-full h-full flex justify-around items-center">
    <div
      v-for="(item, index) in dataValue"
      :key="index"
      class="min-w-16 p-6 cursor-pointer hover-blue"
    >
      <p class="font-bold text-2xl">{{ item.content }}</p>
      <p class="text-gray-500">{{ item.label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/store/user";

interface dataType {
  label: string;
  content: any;
}

const userStore = useUserStore();

const dataValue = computed<dataType[]>(() => [
  {
    label: "粉丝",
    content: userStore.followingCount,
  },
  {
    label: "关注",
    content: userStore.followersCount,
  },
  {
    label: "余额",
    content: "￥" + userStore.balance,
  },
]);
</script>

<style scoped>
.hover-blue:hover p {
  color: #1483d7 !important;
}
</style>
