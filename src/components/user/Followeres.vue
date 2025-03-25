<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 标题 -->
      <h1 class="text-2xl font-bold text-gray-800 mb-6">我的关注</h1>
      
      <!-- 加载中状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2b7fff]"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="follows.length === 0" class="text-center py-16">
        <p class="text-gray-500 text-lg">暂无关注的用户</p>
      </div>
      
      <!-- 关注列表 -->
      <div v-else>
        <!-- 关注用户卡片列表 -->
        <div class="space-y-4">
          <div v-for="user in follows" :key="user.id" 
               class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <!-- 用户信息 -->
            <div class="flex items-center space-x-4">
              <!-- 头像 -->
              <div class="relative">
                <img :src="`${apiBaseUrl}/${user.avatar_url}`" 
                     :alt="user.name"
                     class="w-14 h-14 rounded-full object-cover border-2 border-gray-200">
                <!-- 直播状态标记 -->
                <span v-if="user.is_live" 
                      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  直播中
                </span>
              </div>
              
              <!-- 用户详情 -->
              <div>
                <h3 class="font-medium text-lg">{{ user.name }}</h3>
                <p class="text-gray-500 text-sm line-clamp-1">{{ user.bio || '这个人很懒，什么都没留下' }}</p>
                <p class="text-gray-400 text-xs mt-1">关注时间: {{ formatDate(user.follow_time) }}</p>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex items-center gap-3">
              <!-- 进入直播间按钮 -->
              <router-link 
                v-if="user.is_live" 
                :to="`/live/${user.live_id}`"
                class="px-4 py-2 bg-[#2b7fff] hover:bg-blue-600 text-white rounded-md text-sm transition-colors">
                进入直播间
              </router-link>
              
              <!-- 取消关注按钮 -->
              <button 
                @click="handleUnfollow(user.id)" 
                :disabled="unfollowingId === user.id"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition-colors flex items-center">
                <span v-if="unfollowingId === user.id" class="inline-block animate-spin mr-1">↻</span>
                {{ unfollowingId === user.id ? '取消中...' : '取消关注' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="flex justify-between items-center mt-8">
          <!-- 总计信息 -->
          <div class="text-sm text-gray-500">
            共 {{ totalItems }} 个关注，第 {{ currentPage }}/{{ totalPages }} 页
          </div>
          
          <!-- 分页控件 -->
          <div class="flex items-center space-x-1">
            <!-- 首页按钮 -->
            <button 
              @click="changePage(1)" 
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-md text-sm"
              :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#2b7fff] hover:bg-blue-50'">
              首页
            </button>
            
            <!-- 上一页按钮 -->
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-md text-sm"
              :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#2b7fff] hover:bg-blue-50'">
              上一页
            </button>
            
            <!-- 页码按钮 -->
            <template v-for="page in displayedPages" :key="page">
              <button 
                @click="changePage(page)" 
                class="px-3 py-1 rounded-md text-sm"
                :class="currentPage === page ? 'bg-[#2b7fff] text-white' : 'text-gray-700 hover:bg-blue-50'">
                {{ page }}
              </button>
            </template>
            
            <!-- 下一页按钮 -->
            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded-md text-sm"
              :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-[#2b7fff] hover:bg-blue-50'">
              下一页
            </button>
            
            <!-- 末页按钮 -->
            <button 
              @click="changePage(totalPages)" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded-md text-sm"
              :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-[#2b7fff] hover:bg-blue-50'">
              末页
            </button>
          </div>
        </div>
      </div>
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