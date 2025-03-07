<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6 text-[#2b7fff]">我的关注</h1>
    
    <!-- 关注列表 -->
    <div v-if="loading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2b7fff]"></div>
    </div>
    
    <div v-else-if="follows.length === 0" class="text-center py-10 text-gray-500">
      您还没有关注任何用户
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="user in follows" :key="user.id" class="bg-white border-none rounded-lg p-4 flex items-start gap-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <img :src="`${apiBaseUrl}/${user.avatar_url}`" :alt="user.name" class="w-16 h-16 rounded-full object-cover border-2 border-[#2b7fff] hover:scale-105 transition-transform duration-200">
        
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h3 class="font-semibold text-lg text-[#2b7fff]">{{ user.name }}</h3>
            <button 
              @click="handleUnfollow(user.id)" 
              class="text-sm px-2 py-1.5 rounded-full bg-white border-1 border-[#2b7fff] text-[#2b7fff]  hover:bg-[#2b7fff] hover:text-white transition-all duration-300"
              :disabled="unfollowingId === user.id"
            >
              {{ unfollowingId === user.id ? '处理中...' : '取消关注' }}
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-2 line-clamp-2">{{ user.bio || '这个人很懒，什么都没留下' }}</p>
          <p class="text-xs text-gray-400 mt-2">关注于: {{ formatDate(user.follow_time) }}</p>
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div v-if="totalPages > 0" class="flex justify-center mt-8 gap-3">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="px-4 py-2 rounded-full border-2 border-[#2b7fff] text-[#2b7fff] hover:bg-[#2b7fff] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>
      
      <button 
        v-for="page in displayedPages" 
        :key="page" 
        @click="changePage(page)"
        :class="[
          'px-4 py-2 rounded-full border-2 transition-all duration-300', 
          currentPage === page 
            ? 'bg-[#2b7fff] text-white border-[#2b7fff]' 
            : 'border-[#2b7fff] text-[#2b7fff] hover:bg-[#2b7fff] hover:text-white'
        ]"
      >
        {{ page }}
      </button>
      
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="px-4 py-2 rounded-full border-2 border-[#2b7fff] text-[#2b7fff] hover:bg-[#2b7fff] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getFollowList, unfollowUser } from '@/API/follow';
import { followerType } from '@/API/follow/types'; // 导入类型
import { apiBaseUrl } from '@/env/ApiConfig';

// 状态变量
const follows = ref<followerType[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(0);
const totalItems = ref(0);
const perPage = ref(10); // 每页显示10条
const unfollowingId = ref<number | null>(null);

// 获取关注列表数据
const fetchFollowList = async (page: number) => {
  loading.value = true;
  try {
    const response = await getFollowList({
      page: page,
      per_page: perPage.value
    });
    follows.value = response.data.follows;
    totalPages.value = response.data.pages;
    totalItems.value = response.data.total;
    currentPage.value = response.data.current_page;
  } catch (error) {
    console.error('获取关注列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理取消关注
const handleUnfollow = async (userId: number) => {
  unfollowingId.value = userId;
  try {
    await unfollowUser(userId);
    // 更新列表（直接从当前列表中移除）
    follows.value = follows.value.filter(user => user.id !== userId);
    
    // 如果当前页没有数据了并且不是第一页，则返回上一页
    if (follows.value.length === 0 && currentPage.value > 1) {
      changePage(currentPage.value - 1);
    } else if (totalItems.value > 0) {
      // 更新总数
      totalItems.value -= 1;
      // 可能需要重新计算总页数
      totalPages.value = Math.ceil(totalItems.value / perPage.value);
      
      // 如果当前页为空且不是第一页，则获取前一页的数据
      if (follows.value.length === 0 && currentPage.value > 1) {
        fetchFollowList(currentPage.value - 1);
      } else if (
        follows.value.length < perPage.value && 
        currentPage.value * perPage.value < totalItems.value
      ) {
        // 如果当前页数据不足且还有更多数据，重新加载当前页
        fetchFollowList(currentPage.value);
      }
    }
  } catch (error) {
    console.error('取消关注失败:', error);
  } finally {
    unfollowingId.value = null;
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 换页
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  fetchFollowList(page);
};

// 计算要显示的页码（显示当前页附近的5个页码）
const displayedPages = computed(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }
  
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + 4);
  
  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// 组件挂载时获取第一页数据
onMounted(() => {
  fetchFollowList(1);
});
</script>