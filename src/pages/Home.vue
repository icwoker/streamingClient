<template>
  <div>
    <Nav @search="Handlersearch" @show-all="handlerAll" />
  </div>
  <div class="home">
    <div class="stream-grid">
      <StreamCard
        v-for="stream in show_streams"
        :key="stream.id"
        :stream="stream"
        @click="handleStreamClick(stream.id)"
      />
    </div>
    <!-- <button
      class="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-sm cursor-pointer hover:scale-105 transition-all duration-300"
      @click="dailog1_visable = !dailog1_visable"
    >
      尝试控制弹窗
    </button>
    <button
      class="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-sm cursor-pointer hover:scale-105 transition-all duration-300"
      @click="dailog2_visable = !dailog2_visable"
    >
      尝试控制显示弹窗
    </button>
    <button
      class="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-sm cursor-pointer hover:scale-105 transition-all duration-300"
      @click="dailog3_visable = !dailog3_visable"
    >
      尝试控制显示弹窗
    </button>
    <Dailog :visible="dailog1_visable" @closeDialog="handlerClose">
      <Redbag></Redbag
    ></Dailog>
    <Dailog :visible="dailog2_visable" @closeDialog="handlerClose2">
      <RedbagShow :endTime="endTime_1" />
    </Dailog>
    <Dailog :visible="dailog3_visable" @close-dialog="handlerClose3">
      <RedPacketResult></RedPacketResult>
    </Dailog> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import StreamCard from "@/components/part/StreamCard.vue";
import Nav from "@/components/nav/nav.vue";
import { useUserStore } from "@/store/user";
import axios from "@/API/axios";
import { apiBaseUrl } from "@/env/ApiConfig";
import { useRouter, useRoute } from "vue-router";
import { all } from "axios";
// import Dailog from "@/components/dailog/dialog.vue";
// import Redbag from "@/components/dailog/RedPacketHost .vue";
// import RedbagShow from "@/components/dailog/RedPacketViewer.vue";
// import RedPacketResult from "@/components/dailog/RedPacketResult .vue";

const router = useRouter();
const route = useRoute();
// 示例直播数据
const streams = ref([]);
const show_streams = ref([]);

// //控制弹窗的变量
// const dailog1_visable = ref(false);
// const dailog2_visable = ref(false);
// const dailog3_visable = ref(false);
// const endTime_1 = new Date("2025-05-04T18:44:00");
// function handlerClose() {
//   console.log("接受到消息了！！！");
//   dailog1_visable.value = false;
// }
// function handlerClose2() {
//   dailog2_visable.value = false;
// }
// function handlerClose3() {
//   dailog3_visable.value = false;
// }
interface live {
  id: string;
  streamer: string;
  tags: string;
  thumbnail: string;
  title: string;
}
const userStore = useUserStore();
const urlToTag = (tag: string) => {
  const tags = {
    online: "网游",
    mobile: "手游",
    single: "单机游戏",
    virtual: "虚拟主播",
    entertainment: "娱乐",
    radio: "电台",
    match: "赛事",
    chat: "聊天室",
    life: "生活",
    knowledge: "知识",
    more: "更多",
  };
  return tags[tag] || null;
};
onMounted(async () => {
  //获取用户信息
  const response = await axios.get("/auth/me");
  const userInfo = response.data;
  userStore.setUserId(userInfo.user_id);
  userStore.setUsername(userInfo.user_name);
  userStore.setAvatar(userInfo.avatar_url);
  console.log(userStore.getAvatar());
  //获取用户余额
  const balance = await axios.get("/transaction/balance");
  userStore.setBalance(balance.data.balance);
  //获取直播列表
  const lives_response = await axios.get("/livehome/get_live_list");
  const lives = lives_response.data;
  console.log(lives);
  lives.data.forEach((live: live) => {
    streams.value.push({
      id: live.id,
      title: live.title,
      tags: live.tags,
      thumbnail: `${apiBaseUrl}/${live.thumbnail}`,
      streamer: live.streamer,
    });
  });
  // console.log(streams.value);
  show_streams.value = streams.value;
});
const handleStreamClick = (id: string) => {
  router.push(`/live/${id}`);
};

watch(
  () => route.query.tag,
  (newTag) => {
    console.log(newTag);
    if (newTag) {
      const tag = urlToTag(newTag as string);
      if (tag) {
        show_streams.value = streams.value.filter((stream: live) =>
          stream.tags.includes(tag)
        );
      }
    } else {
      show_streams.value = streams.value;
    }
  }
);

const Handlersearch = (search: any) => {
  console.log(search);
  const ids = search?.map((element: any) => {
    return element.id;
  });
  if (search) {
    show_streams.value = streams.value.filter((stream: live) =>
      stream.id.includes(ids)
    );
  } else {
    show_streams.value = streams.value;
  }
};

const handlerAll = () => {
  show_streams.value = streams.value;
};
</script>

<style scoped>
.home {
  padding: 20px;
}

.stream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.trigger-button {
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.trigger-button:hover {
  background-color: #45a049;
}

.trigger-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
