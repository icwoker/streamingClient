<template>
  <div class="watch-history-container p-6 max-w-5xl mx-auto">
    <!-- Header with title and clear all button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">观看历史</h1>
      <button 
        @click="confirmClearAll" 
        class="text-red-500 hover:text-red-700 transition flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        清空历史
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="historyItems.length === 0" class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-xl text-gray-600">暂无观看历史</p>
      <p class="text-gray-500 mt-2">观看直播后将会显示在这里</p>
    </div>

    <!-- History content -->
    <div v-else>
      <!-- Date sections -->
      <div v-for="(group, date) in groupedHistory" :key="date" class="mb-8">
        <div class="text-lg font-bold mb-4 text-gray-700">{{ formatDate(date) }}</div>

        <!-- History items grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="item in group" 
            :key="item.id" 
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden relative group"
          >
            <!-- Delete button -->
            <button 
              @click="confirmDelete(item.id)"
              class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="删除此条历史"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Stream content -->
            <div class="flex p-4 items-start">
              <!-- Streamer avatar -->
              <div class="relative mr-4">
                <img 
                  :src="`${apiBaseUrl}/${item.live_info.avatar_url}`" 
                  alt="主播头像" 
                  class="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                  @error="handleImageError"
                >
                <!-- Live indicator -->
                <div 
                  v-if="item.live_info.status === 'Live'" 
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                >
                  直播中
                </div>
              </div>

              <!-- Stream info -->
              <div class="flex-1">
                <div class="font-semibold text-lg line-clamp-1">{{ item.live_info.title }}</div>
                <div class="text-sm text-blue-600 mb-1">{{ item.live_info.liver_name }}</div>
                
                <!-- Watch time info -->
                <div class="text-xs text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  观看时间: {{ formatWatchDuration(item.watch_duration) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <div class="flex space-x-2">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
            :class="currentPage === 1 ? 'text-gray-400 border-gray-200' : 'hover:bg-gray-100'"
          >
            上一页
          </button>
          
          <span class="px-4 py-2 rounded-md bg-blue-500 text-white">
            {{ currentPage }}
          </span>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
            :class="currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'hover:bg-gray-100'"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div 
      v-if="showConfirmModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">确认删除</h3>
        <p>{{ confirmModalMessage }}</p>
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="cancelDelete" 
            class="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            取消
          </button>
          <button 
            @click="executeDelete" 
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getWatchHistory, deleteWatchHistory, deleteAllWatchHistory } from '@/API/watchHistory';
import { apiBaseUrl } from '@/env/ApiConfig';

// Types
interface LiveInfo {
  liver_name: string;
  title: string;
  avatar_url: string;
  status: string;
}

interface HistoryItem {
  id: string;
  user_id: string;
  live_id: string;
  watched_at: string;
  watch_duration: number;
  live_info: LiveInfo;
}

// State
const historyItems = ref<HistoryItem[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const pageSize = ref(12);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

// Delete confirmation
const showConfirmModal = ref(false);
const confirmModalMessage = ref('');
const deleteItemId = ref<string | null>(null);
const deleteAllFlag = ref(false);

// Group history by date
const groupedHistory = computed(() => {
  const groups: Record<string, HistoryItem[]> = {};
  
  historyItems.value.forEach(item => {
    const date = new Date(item.watched_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  
  return groups;
});

// Load watch history
const loadHistory = async () => {
  loading.value = true;
  try {
    const response = await getWatchHistory({page:currentPage.value,page_size:pageSize.value});
    historyItems.value = response.data.items;
    totalItems.value = response.data.total;
  } catch (error) {
    console.error('Failed to load watch history:', error);
  } finally {
    loading.value = false;
  }
};

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadHistory();
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// Format watch duration
const formatWatchDuration = (seconds: number) => {
  if (!seconds) return '未记录';
  
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes > 0 ? ` ${minutes}分钟` : ''}`;
  }
};

// Handle image load error
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = '/default-avatar.png'; // Replace with your default avatar
};

// Delete confirmation
const confirmDelete = (id: string) => {
  deleteItemId.value = id;
  deleteAllFlag.value = false;
  confirmModalMessage.value = '确定要删除这条观看历史记录吗？';
  showConfirmModal.value = true;
};

const confirmClearAll = () => {
  deleteAllFlag.value = true;
  deleteItemId.value = null;
  confirmModalMessage.value = '确定要清空所有观看历史记录吗？此操作不可恢复。';
  showConfirmModal.value = true;
};

const executeDelete = async () => {
  try {
    if (deleteAllFlag.value) {
      await deleteAllWatchHistory();
      historyItems.value = [];
      totalItems.value = 0;
    } else if (deleteItemId.value) {
      await deleteWatchHistory(deleteItemId.value);
      historyItems.value = historyItems.value.filter(item => item.id !== deleteItemId.value);
      totalItems.value--;
      
      // If current page becomes empty and it's not the first page, go to previous page
      if (historyItems.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
        await loadHistory();
      }
    }
  } catch (error) {
    console.error('Delete operation failed:', error);
    // You could add a toast notification here
  } finally {
    showConfirmModal.value = false;
  }
};

const cancelDelete = () => {
  showConfirmModal.value = false;
  deleteItemId.value = null;
  deleteAllFlag.value = false;
};

// Load data on mount
onMounted(() => {
  loadHistory();
});
</script>

<style scoped>
.watch-history-container {
  min-height: calc(100vh - 80px); /* Adjust based on your header/footer */
}

/* Line clamp for text overflow */
.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>