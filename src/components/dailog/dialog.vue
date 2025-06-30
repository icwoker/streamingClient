<template>
  <!-- 使用 fixed 定位覆盖全屏 -->
  <div
    v-show="props.visible"
    @click="closeDialog"
    class="fixed inset-0 bg-[rgba(0,0,0,0.25)] z-50 flex items-center justify-center"
  >
    <!-- 添加 stop 修饰符阻止事件冒泡 -->
    <div
      @click.stop
      class="min-w-[300px] min-h-[500px] bg-white rounded-lg p-4 overflow-hidden relative"
    >
      <!-- 关闭按钮 -->
      <div
        class="absolute text-black right-[1px] top-[1px] w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-full"
        @click="closeDialog"
      >
        ×
      </div>

      <!-- 内容区域 -->
      <div class="h-full overflow-auto">
        <!-- 设置插槽，定义不同的内容 -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["closeDialog"]);

function closeDialog() {
  emit("closeDialog");
}
</script>

<style scoped></style>
