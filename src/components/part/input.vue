<template>
  <div class="flex items-center space-x-2">
    <span v-if="!isEditing" @click="enableEditing" class="cursor-pointer">{{
      text
    }}</span>
    <input
      v-else
      v-model="newText"
      @blur="disableEditing"
      @keyup.enter="disableEditing"
      class="border rounded px-2 py-1"
    />
    <i
      v-if="!isEditing"
      class="pi pi-pencil cursor-pointer"
      @click="enableEditing"
    ></i>
    <i v-else class="pi pi-times cursor-pointer" @click="disableEditing"></i>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
// 定义响应式变量
const isEditing = ref(false);
const text = ref("Click to edit");
const newText = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
// 启用编辑模式的函数
const enableEditing = () => {
  isEditing.value = true;
  newText.value = text.value;
  // 聚焦到输入框
  if (inputRef.value) {
    inputRef.value.focus();
  }
};
// 禁用编辑模式的函数
const disableEditing = () => {
  if (isEditing.value) {
    text.value = newText.value;
    isEditing.value = false;
  }
};
</script>

<style scoped>
/* Add any additional styles here */
</style>
