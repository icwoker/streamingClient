<template>
  <Nav />
  <div class="bg-gray-100 text-gray-800 min-h-screen p-4">
    <div class="max-w-6xl mx-auto flex gap-4">
      <!-- Sidebar -->
      <div class="w-1/4 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <div class="flex flex-col space-y-4">
          <div v-for="nav in navigations" :key="nav.name" @click="navigateTo(nav.route)"
            class="cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition duration-300" :class="{
              'bg-blue-500 text-white': currentTab === nav.route,
            }">
            {{ nav.name }}
          </div>
        </div>
      </div>
      <!-- Content -->
      <div class="w-3/4 p-6 bg-white rounded-lg shadow-lg overflow-hidden">
        <component :is="currentView"></component>
      </div>
    </div>
  </div>
  <Toast />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, markRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import Toast from 'primevue/toast';


// 导入各个内容组件
import UserInfo from "@/components/user/UserInfo.vue";
import WatchHistory from "@/components/user/WatchHistory.vue";
import LiveHistory from "@/components/user/LiveHistory.vue";
import StartLive from "@/components/user/StartLive.vue";
import Fans from "@/components/user/Fans.vue";
import Follower from "@/components/user/Followeres.vue";
import Pay from "@/components/user/Pay.vue";
import Nav from "@/components/nav/nav.vue";
import LiveModerator from "@/components/user/LiveModerator.vue";
import LiveBanner from "@/components/user/LiveBanner.vue";
import { useUserStore } from "@/store/user";
import axios from "@/API/axios";
import Transaction from "@/components/user/Transaction.vue";
import { useToast } from "primevue/usetoast";
const toast = useToast();
// 定义导航项类型
interface Navigation {
  name: string;
  route: string; // 路由路径
  component: any; // 对应的组件
}

// 导航按钮数据
const navigations = ref<Navigation[]>([
  { name: "用户信息", route: "info", component: markRaw(UserInfo) },
  { name: "我的粉丝", route: "fans", component: markRaw(Fans) },
  { name: "我的关注", route: "follower", component: markRaw(Follower) },
  { name: "我要开播", route: "start-live", component: markRaw(StartLive) },
  { name: "直播历史", route: "live-history", component: markRaw(LiveHistory) },
  { name: "房管列表", route: "live-moderator", component: markRaw(LiveModerator) },
  { name: "小黑屋", route: "live-banner", component: markRaw(LiveBanner) },
  { name: "观看历史", route: "watch-history", component: markRaw(WatchHistory) },
  { name: "我的余额", route: "pay", component: markRaw(Pay) },
  { name: "交易记录", route: "transaction", component: markRaw(Transaction) },
]);

// 获取路由和路由器实例
const route = useRoute();
const router = useRouter();

// 当前显示的 tab 和组件
const currentTab = ref(route.params.tab as string);
const currentView = ref<any>(null);
const userStore = useUserStore();
// 根据当前 tab 更新组件
async function updateContent() {
  const nav = navigations.value.find((item) => item.route === currentTab.value);
  if (nav) {
    currentView.value = nav.component;
    //更新组件的时候，确保用户信息是最新的
    userStore.getUserInfo();
  } else {
    console.warn(`Invalid tab: ${currentTab.value}`);
    router.replace("/userinfo/info");
  }
  await get_unread_notice();
}
const noticeAble = ref(false);
// 初始化时加载内容
onMounted(() => {
  updateContent();
});

// 监听路由变化
watch(
  () => route.params.tab,
  (newTab) => {
    currentTab.value = newTab as string;
    updateContent();
  }
);

//尝试读取未读的通知
const notices = ref<any[]>([]);
const get_unread_notice = async () =>{
  const response = await axios.get('/livehome/get_unread_notifications');
  // console.log(response.data);
  notices.value = response.data.data;
  notices.value.forEach((notice:any)=>{
    toast.add({severity:'info', summary: '未读通知', detail: notice.content, life: 3000});
  })
}

// 点击导航时跳转到对应路由
function navigateTo(routeName: string) {
  router.push(`/userinfo/${routeName}`);
}
</script>

<style scoped>
/* 如果需要自定义样式，可以在这里添加 */
</style>
