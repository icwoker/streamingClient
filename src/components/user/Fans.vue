<template>
  <div class="flex justify-center flex-col gap-8">
    <div class="flex flex-wrap">
      <!-- 头部标题 -->
      <div class="w-full text-2xl font-bold mb-4">我的粉丝</div>

      <!-- 粉丝列表 -->
      <div class="w-full">
        <div v-if="loading" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          ></div>
        </div>

        <div
          v-else-if="fansList.length === 0"
          class="text-center py-12 text-gray-500"
        >
          暂无粉丝
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <!-- 粉丝卡片 -->
          <div
            v-for="fan in fansList"
            :key="fan.id"
            class="border-none rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <!-- 粉丝基本信息 -->
            <div class="flex items-center mb-3">
              <img
                :src="`${apiBaseUrl}/${fan.avatar_url}`"
                alt="头像"
                class="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div class="flex flex-col flex-1">
                <div class="font-bold text-lg">{{ fan.name }}</div>
                <div class="text-xs text-gray-500">
                  关注时间: {{ formatDate(fan.follow_time) }}
                </div>
              </div>
            </div>

            <!-- 粉丝简介 -->
            <div class="text-sm text-gray-700 mb-4 line-clamp-2">
              {{ fan.bio || "这个人很懒，什么也没留下" }}
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-between items-center">
              <div>
                <button
                  v-if="!fan.is_following"
                  @click="followFan(fan)"
                  class="px-4 py-1.5 bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors rounded-sm cursor-pointer"
                >
                  关注
                </button>
                <span
                  v-else
                  class="px-2 py-2 bg-gray-100 text-gray-700 rounded-sm text-xs"
                >
                  已互相关注
                </span>
              </div>

              <div class="flex gap-2">
                <!-- 预留功能按钮 -->
                <button
                  @click="setAsModerator(fan)"
                  v-if="!fan.is_live_moderator"
                  :disabled="fan.is_live_banned"
                  class="px-3 py-1.5 border cursor-pointer border-green-500 text-green-500 rounded text-sm hover:bg-green-50 transition-colors"
                  title="设为房管"
                >
                  设为房管
                </button>
                <button
                  @click="DeleteLiveModerator(fan)"
                  v-if="fan.is_live_moderator"
                  class="px-3 py-1.5 border cursor-pointer border-green-500 text-green-500 rounded text-sm hover:bg-green-50 transition-colors"
                  title="取消房管"
                >
                  取消房管
                </button>
                <button
                  @click="blockFan(fan)"
                  class="px-3 py-1.5 border cursor-pointer border-red-500 text-red-500 rounded text-sm hover:bg-red-50 transition-colors"
                  title="拉黑"
                  v-if="!fan.is_live_banned"
                  :disabled="fan.is_live_moderator"
                >
                  拉黑
                </button>
                <button
                  v-else
                  @click="unblockFan(fan)"
                  class="px-3 py-1.5 border cursor-pointer border-green-500 text-green-500 rounded text-sm hover:bg-green-50 transition-colors"
                  title="取消拉黑"
                >
                  原谅
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >
            上一页
          </button>

          <button
            v-for="page in displayedPages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-1 border rounded',
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getFollowerList, followUser } from "@/API/follow";
import type { fanType, fanData } from "@/API/follow/types";
import { apiBaseUrl } from "@/env/ApiConfig";
import { createLiveModerator, deleteLiveModerator } from "@/API/liveModerator";
import {
  addUserToLiveBanner,
  removeUserFromLiveBanner,
  GetHoomIdByMine,
} from "@/API/liveBanner";

// 定义状态变量
const fansList = ref<fanType[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(0);
const perPage = ref(12);

// 计算显示的页码
const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5; // 最多显示5个页码

  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxPages - 1);

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// 加载粉丝列表
const loadFans = async () => {
  loading.value = true;
  try {
    const response = await getFollowerList({
      page: currentPage.value,
      per_page: perPage.value,
    });
    console.log(response.data);
    fansList.value = response.data.fans;
    totalPages.value = response.data.pages;
  } catch (error) {
    console.error("加载粉丝列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 切换页码
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    loadFans();
  }
};

// 关注粉丝
const followFan = async (fan: fanType) => {
  // 这里将来需要调用关注接口
  console.log("关注粉丝:", fan.name);
  // 临时模拟关注成功
  const response = await followUser(fan.id);
  if (response) {
    console.log(response);
  }
  fan.is_following = true;
};

// 预留功能：设为房管
const setAsModerator = async (fan: fanType) => {
  console.log("设置房管:", fan.name);
  // alert(`功能开发中：将 ${fan.name} 设为房管`);
  try {
    const response = await createLiveModerator(fan.id);
    if (response.status === 200) {
      alert(`${fan.name} 设为房管成功`);
      fan.is_live_moderator = true;
      loadFans();
    }
  } catch (error) {
    console.error("设置房管失败:", error);
  }
};

const DeleteLiveModerator = async (fan: fanType) => {
  console.log("取消房管:", fan.name);
  // alert(`功能开发中：将 ${fan.name} 取消房管`);
  try {
    const response = await deleteLiveModerator(fan.id);
    if (response.status === 200) {
      alert(`${fan.name} 取消房管成功`);
      fan.is_live_moderator = false;
      loadFans();
    }
  } catch (error) {
    console.error("取消房管失败:", error);
  }
};
// 预留功能：拉黑粉丝
const blockFan = async (fan: fanType) => {
  console.log("拉黑粉丝:", fan.name);
  // alert(`功能开发中：将 ${fan.name} 拉入小黑屋`);
  try {
    const live_response = await GetHoomIdByMine();
    console.log(fan.id);
    const response = await addUserToLiveBanner(fan.id, live_response.data);
    alert(`${fan.name} 拉入小黑屋成功`);
    fan.is_live_banned = true;
    loadFans();
  } catch (error) {
    console.error("拉黑失败:", error);
  }
};

const unblockFan = async (fan: fanType) => {
  console.log("取消拉黑:", fan.name);
  // alert(`功能开发中：将 ${fan.name} 从小黑屋中移除`);
  try {
    const response = await removeUserFromLiveBanner(fan.id);
    if (response) {
      alert(`${fan.name} 从小黑屋中移除成功`);
      fan.is_live_banned = false;
      loadFans();
    } else {
      alert(`${fan.name} 从小黑屋中移除失败`);
    }
  } catch (error) {
    console.error("取消拉黑失败:", error);
  }
};
// 格式化日期显示
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 如果是今天，显示具体时间
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return `今天 ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  // 如果是昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "昨天";
  }

  // 其他情况显示完整日期
  return dateStr.split(" ")[0];
};

// 组件挂载后加载数据
onMounted(() => {
  loadFans();
});
</script>

<style scoped>
/* 可以根据需要添加额外样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
