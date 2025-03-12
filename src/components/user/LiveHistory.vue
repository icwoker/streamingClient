
<template>
  <div class="w-full bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">直播记录</h2>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2b7fff]"></div>
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{{ error }}</p>
    </div>
    
    <!-- 无数据提示 -->
    <div v-else-if="liveRecords.length === 0" class="text-center py-10 text-gray-500">
      暂无直播记录
    </div>
    
    <!-- 直播记录列表 -->
    <div v-else class="space-y-4">
      <div v-for="record in liveRecords" :key="record.id" 
           class="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" @click="goToLiveStatistics(record.id)">
        <!-- 封面图 -->
        <div class="md:w-48 h-32 overflow-hidden">
            <img :src="`${apiBaseUrl}/${record.cover_url}`" :alt="record.title" class="w-full h-full object-cover">
        </div>
        
        <!-- 内容 -->
        <div class="flex-1 p-4 flex flex-col justify-between" >
          <div>
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-semibold text-gray-800">{{ record.title }}</h3>
              <span :class="`px-2 py-1 text-xs text-white rounded-full ${getStatusClass(record.status)}`">
                {{ getStatusText(record.status) }}
              </span>
            </div>
            
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="tag in record.tags.split(',')" :key="tag" 
                    class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {{ tag.trim() }}
              </span>
            </div>
          </div>
          
          <div class="mt-3 text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between">
            <div>
              <span class="font-medium">开始时间:</span> {{ formatDateTime(record.start_time) }}
            </div>
            <div v-if="record.end_time">
              <span class="font-medium">结束时间:</span> {{ formatDateTime(record.end_time) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="!isLoading && liveRecords.length > 0" class="mt-6 flex justify-center">
      <nav class="flex items-center space-x-1">
        <!-- 上一页 -->
        <button 
          @click="handlePageChange(pagination.currentPage - 1)" 
          :disabled="pagination.currentPage === 1"
          class="px-3 py-1 rounded-md border"
          :class="pagination.currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#2b7fff] border-[#2b7fff] hover:bg-[#2b7fff] hover:text-white'"
        >
          上一页
        </button>
        
        <!-- 页码 -->
        <template v-for="page in paginationArray" :key="page">
          <span v-if="page === -1" class="px-3 py-1">...</span>
          <button 
            v-else
            @click="handlePageChange(page)"
            class="px-3 py-1 rounded-md"
            :class="page === pagination.currentPage ? 'bg-[#2b7fff] text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            {{ page }}
          </button>
        </template>
        
        <!-- 下一页 -->
        <button 
          @click="handlePageChange(pagination.currentPage + 1)" 
          :disabled="pagination.currentPage === pagination.totalPages"
          class="px-3 py-1 rounded-md border"
          :class="pagination.currentPage === pagination.totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#2b7fff] border-[#2b7fff] hover:bg-[#2b7fff] hover:text-white'"
        >
          下一页
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { LiveRecord, PaginationData } from '@/types/live';
import axios from '@/API/axios'
import { apiBaseUrl } from '@/env/ApiConfig';
import { useRouter } from 'vue-router';
const router = useRouter();

// 组件属性
const props = defineProps<{
  userId?: number; // 可选，如果只想显示特定用户的直播
}>();

// 状态
const liveRecords = ref<LiveRecord[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// 分页
const pagination = ref<PaginationData>({
  currentPage: 1,
  totalPages: 1,
  pageSize: 5
});

// 获取直播记录
const fetchLiveRecords = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // 构建API请求URL，包含分页参数
    let url = `/livehome/livehistory?page=${pagination.value.currentPage}&pageSize=${pagination.value.pageSize}`;
  
    
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error('获取直播记录失败');
    }
    
    const data = response.data;
    liveRecords.value = data.records;
    pagination.value.totalPages = data.totalPages;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误';
  } finally {
    isLoading.value = false;
  }
};

// 页码变化处理
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page;
  fetchLiveRecords();
};

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '-';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取状态标签样式
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'live':
      return 'bg-red-500';
    case 'ended':
      return 'bg-gray-500';
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-300';
  }
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'live': '直播中',
    'ended': '已结束',
    'pending': '待开始'
  };
  return statusMap[status] || status;
};

// 计算属性：分页数组
const paginationArray = computed(() => {
  const total = pagination.value.totalPages;
  const current = pagination.value.currentPage;
  
  // 如果总页数小于等于7，显示所有页码
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  // 否则显示当前页附近的页码和首尾页码
  const pages = [1];
  
  if (current > 3) {
    pages.push(-1); // 省略号占位
  }
  
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  if (current < total - 2) {
    pages.push(-1); // 省略号占位
  }
  
  if (total > 1) {
    pages.push(total);
  }
  
  return pages;
});

// 组件挂载时获取数据
onMounted(() => {
  fetchLiveRecords();
});

const goToLiveStatistics = (live_id: string) => {
  router.push(`/liveStatistics/${live_id}`);
}
</script>
