<template>
  <nav class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex items-center justify-between">
      <!-- 网站 Logo -->
      <div class="flex items-center">
        <img src="@/assets/default.jpg" alt="Logo" class="h-8" />
      </div>

      <!-- 类别 -->
      <div class="flex space-x-6">
        <a
          v-for="category in categories"
          :key="category.value"
          @click="routeTo(category.value)"
          class="hover:text-gray-400"
        >
          {{ category.label }}
        </a>
      </div>

      <!-- 搜索组件 -->
      <div class="relative">
        <!-- 搜索框 -->
        <div
          class="flex items-center bg-[#f1f2f3] text-[#898d93] hover:bg-white transition-colors duration-200 rounded-xl overflow-hidden"
        >
          <input
            type="text"
            placeholder="搜索..."
            v-model="searchQuery"
            class="px-4 py-2 rounded-l-lg bg-[transparent] focus:bg-[#f1f2f3] focus:text-[#898d93] focus:outline-none transition-colors duration-200"
          />
          <button
            class="bg-[transparent] px-4 py-2 rounded-r-lg hover:bg-[#f1f2f3] focus:outline-none transition-colors duration-200"
            @click="HandleSearch"
          >
            <i
              class="pi pi-search text-[#898d93] hover:text-[#898d93] transition-colors duration-200 cursor-pointer"
            ></i>
          </button>
        </div>

        <!-- 自动补全框 -->
        <div
          v-if="isAutocompleteVisible && autoCompleteSuggestions.length > 0"
          class="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <div
            v-for="(suggestion, index) in autoCompleteSuggestions"
            :key="index"
            class="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
            @click="
              searchQuery = suggestion;
              isAutocompleteVisible = false;
            "
          >
            <i class="mr-2 text-[#898d93]">
              <span>{{ suggestion }}</span>
            </i>
          </div>
        </div>
      </div>

      <!-- 个人信息框 -->
      <div class="flex items-center">
        <div class="relative avatar-container">
          <img
            :src="`${apiBaseUrl}/${userStore.avatar}`"
            alt="Avatar"
            class="h-10 w-10 rounded-full cursor-pointer transform transition-all duration-300 hover:scale-110 hover:translate-y-1"
            @click="router.push('/userinfo')"
          />
          <div
            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg text-black opacity-0 hidden avatar-menu"
          >
            <div class="flex items-center p-4 border-b">
              <img
                :src="`${apiBaseUrl}/${userStore.avatar}`"
                alt="Avatar"
                class="h-12 w-12 rounded-full mr-3"
              />
              <div>
                <p class="font-bold">{{ userStore.username }}</p>
                <div class="flex">
                  <span>余额:{{ balance }}</span>
                  <button
                    class="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded cursor-pointer"
                    @click="router.push('/userinfo/pay')"
                  >
                    充值
                  </button>
                </div>
              </div>
            </div>
            <a
              href="#"
              class="flex items-center px-4 py-2 hover:bg-gray-200"
              @click="router.push('/userinfo/start-live')"
            >
              <i class="pi pi-video mr-2"></i>直播中心
            </a>
            <a
              href="#"
              class="flex items-center px-4 py-2 hover:bg-gray-200"
              @click="router.push('/userinfo/fans')"
            >
              <i class="pi pi-user mr-2"></i>粉丝中心
            </a>
            <a
              href="#"
              class="flex items-center px-4 py-2 hover:bg-gray-200"
              @click="router.push('/userinfo/follower')"
            >
              <i class="pi pi-trophy mr-2"></i>我的关注
            </a>
            <a
              href="#"
              class="flex items-center px-4 py-2 hover:bg-gray-200"
              @click="router.push('/userinfo/watch-history')"
            >
              <i class="pi pi-clock mr-2"></i>观看历史
            </a>
            <a
              href="#"
              class="flex items-center px-4 py-2 hover:bg-gray-200"
              @click="router.push('/userinfo/live-banner')"
            >
              <i class="pi pi-home mr-2"></i>小黑屋
            </a>
            <a
              href="#"
              @click="logout"
              class="block px-4 py-2 hover:bg-gray-200 text-red-500"
            >
              <i class="pi pi-sign-out mr-2"></i>
              退出登录
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { apiBaseUrl } from "@/env/ApiConfig";
import axios from "@/API/axios";
import { debounce } from "@/tools/main";

const emit = defineEmits(["search", "showAll"]);
const userStore = useUserStore();

const balance = computed(() => {
  return userStore.balance;
});

const categories = ref([
  { label: "首页", value: "home" },
  { label: "网游", value: "online" },
  { label: "手游", value: "mobile" },
  { label: "单机游戏", value: "single" },
  { label: "虚拟主播", value: "virtual" },
  { label: "娱乐", value: "entertainment" },
  { label: "电台", value: "radio" },
  { label: "赛事", value: "match" },
  { label: "聊天室", value: "chat" },
  { label: "生活", value: "life" },
  { label: "知识", value: "knowledge" },
  { label: "更多", value: "more" },
]);

const router = useRouter();
function routeTo(path: string) {
  if (path === "home") {
    router.push("/");
  } else {
    router.push(`/home?tag=${path}`);
  }
}

function logout() {
  router.push("/login");
}

// 自动补全框和搜索功能
const isAutocompleteVisible = ref(false);
const searchQuery = ref("");
const autoCompleteSuggestions = ref([]); // 新增：存储建议列表的响应式数据

const getAutoCompleteList = debounce(async (query) => {
  console.log("Fetching autocomplete for:", query); // 调试日志

  if (query.length >= 2) {
    try {
      const response = await axios.get("/livehome/search_autocomplete", {
        params: { q: query },
      });

      console.log("Response data:", response.data); // 调试日志

      if (response.data && response.data.suggestions) {
        autoCompleteSuggestions.value = response.data.suggestions;
        isAutocompleteVisible.value = autoCompleteSuggestions.value.length > 0;
      } else {
        autoCompleteSuggestions.value = [];
        isAutocompleteVisible.value = false;
      }
    } catch (error) {
      console.error("获取自动补全数据失败:", error);
      autoCompleteSuggestions.value = [];
      isAutocompleteVisible.value = false;
    }
  } else {
    autoCompleteSuggestions.value = [];
    isAutocompleteVisible.value = false;
  }
}, 300);

// 监听搜索词变化
watch(searchQuery, (newQuery) => {
  // console.log("Search query changed:", newQuery); // 调试日志
  getAutoCompleteList(newQuery);
});

//搜索api
const getSearchList = debounce(async (query) => {
  console.log("Fetching search results for:", query);
  const response = await axios.get("/livehome/search", {
    params: { q: query },
  });
  if (response.data && response.data.data) {
    emit("search", response.data.data);
  }
}, 300);
//搜索功能
const HandleSearch = () => {
  const query = searchQuery.value;
  if (query) {
    getSearchList(query);
  } else {
    //如果搜索框内容为空，则默认返回全部直播
    emit("showAll");
  }
};
</script>

<style scoped>
/* 你可以在这里添加一些自定义样式 */

.avatar-container:hover .avatar-menu {
  opacity: 1;
  display: block;
}
</style>
