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

      <!-- 搜索框 -->
      <div
        class="flex items-center bg-[#f1f2f3] text-[#898d93] hover:bg-white transition-colors duration-200 rounded-xl overflow-hidden"
      >
        <input
          type="text"
          placeholder="搜索..."
          class="px-4 py-2 rounded-l-lg bg-[transparent] focus:bg-[#f1f2f3] focus:text-[#898d93] focus:outline-none transition-colors duration-200"
        />
        <button
          class="bg-[transparent] px-4 py-2 rounded-r-lg hover:bg-[#f1f2f3] focus:outline-none transition-colors duration-200"
        >
          <i
            class="pi pi-search text-[#898d93] hover:text-[#898d93] transition-colors duration-200 cursor-pointer"
          ></i>
        </button>
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
            <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-200">
              <i class="pi pi-video mr-2"></i>直播中心
            </a>
            <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-200">
              <i class="pi pi-user mr-2"></i>粉丝中心
            </a>
            <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-200">
              <i class="pi pi-trophy mr-2"></i>我的关注
            </a>
            <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-200">
              <i class="pi pi-envelope mr-2"></i>我的消息
            </a>
            <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-200">
              <i class="pi pi-home mr-2"></i>小黑屋
            </a>
            <a href="#" @click="logout" class="block px-4 py-2 hover:bg-gray-200 text-red-500">
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
import { ref, onMounted,computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { apiBaseUrl } from "@/env/ApiConfig";

const userStore = useUserStore();

const balance = computed(()=>{
  return userStore.balance;
})

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
function routeTo(path:string){
  if(path === "home"){
    router.push("/");
  }else{
    router.push(`/home?tag=${path}`);
  }
}

function logout(){
  router.push("/login");
}
</script>

<style scoped>
/* 你可以在这里添加一些自定义样式 */

.avatar-container:hover .avatar-menu{
  opacity: 1;
  display: block;
}
</style>
