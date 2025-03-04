<template>


    <div class="flex justify-center items-center space-x-2">
      <!-- 上一页按钮 -->
      <button
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        上一页
      </button>
  
      <!-- 页码 -->
      <div v-for="page in displayedPages" :key="page" class="flex items-center">
        <button
          class="px-4 py-2 rounded-md"
          :class="{
            'bg-blue-500 text-white': currentPage === page,
            'bg-gray-200 text-gray-700 hover:bg-gray-300': currentPage !== page,
          }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
  
      <!-- 下一页按钮 -->
      <button
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        下一页
      </button>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed } from 'vue';
  
  // 定义 props
  const props = defineProps({
    total: {
      type: Number,
      required: true,
    },
    perPage: {
      type: Number,
      default: 10,
    },
    maxVisibleButtons: {
      type: Number,
      default: 5,
    },
  });
  
  // 当前页码
  const currentPage = ref(1);
  
  // 计算总页数
  const totalPages = computed(() => Math.ceil(props.total / props.perPage));
  
  // 计算显示的页码范围
  const displayedPages = computed(() => {
    const pages: number[] = [];
    const halfVisible = Math.floor(props.maxVisibleButtons / 2);
  
    let startPage = Math.max(currentPage.value - halfVisible, 1);
    let endPage = Math.min(startPage + props.maxVisibleButtons - 1, totalPages.value);
  
    // 如果页码范围超出最大页数，则调整起始页
    if (endPage - startPage < props.maxVisibleButtons - 1) {
      startPage = Math.max(endPage - props.maxVisibleButtons + 1, 1);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  
    return pages;
  });
  
  // 切换到指定页码
  const changePage = (page: number) => {
    currentPage.value = page;
  };
  
  // 上一页
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  // 下一页
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  </script>
  
  <style scoped>
  /* 可以在这里添加一些自定义样式 */
  </style>