<template>
  <div class="h-full bg-gray-900 text-white mt-10 rounded-t-lg">
    <!-- Stream Info Section -->
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-start justify-between">
        <!-- Left: Streamer Info -->
        <div class="flex items-center gap-4">
          <div class="relative">
            <img
              :src="`${apiBaseUrl}/${liveInfo.liver_avatar}`"
              alt="Streamer Avatar"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div
              class="absolute -bottom-1 -right-1 bg-red-500 text-xs px-2 py-0.5 rounded-full"
            >
              LIVE
            </div>
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold">{{ liveInfo.liver_name }}</h1>
              <button
                class="bg-pink-500 hover:bg-pink-600 px-4 py-1 rounded-full text-sm cursor-pointer hover:scale-105 transition-all duration-300"
                @click="handleFollow"
              >
                {{ isFollow ? "取关" : "关注" }}
              </button>
            </div>
            <p class="text-gray-400 mt-1">{{ liveInfo.title }}</p>
          </div>
        </div>

        <!-- Right: Stream Stats -->
        <div class="flex items-center gap-6 text-gray-300">
          <div v-if="user_permission > 2">
            <button
              class="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-sm cursor-pointer hover:scale-105 transition-all duration-300"
              @click="host_visiable = !host_visiable"
            >
              发福袋
            </button>
            <!-- <button
              class="bg-yellow-500 hover:bg-yellow-600 px-4 py-1 rounded-full text-sm cursor-pointer hover:scale-105 transition-all duration-300"
            >
              为小黄车添加商品
            </button> -->
          </div>
          <div v-else>
            <button
              class="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-sm cursor-pointer hover:scale-105 transition-all duration-300"
              @click="getRedPacket"
            >
              主播发的红包！
            </button>
            <!-- <div>主播挂的小黄车！</div> -->
          </div>
        </div>
      </div>
    </div>
    <!-- DaiLog相关 -->
    <Dialog :visible="host_visiable" @closeDialog="handlerClose">
      <RedPacketHost @sendSuccess="handlerSuccess" />
    </Dialog>
    <Dialog
      v-if="viewer_visiable"
      :visible="viewer_visiable"
      @closeDialog="handlerClose_2"
    >
      <RedPacketViewer
        :title="RedPacketData.title"
        :end-time="RedPacketData.expireTime"
        :amount="RedPacketData.amount"
        :winner-count="RedPacketData.winnerNum"
        :join-status="RedPacketData.has_join"
        :red-packet-id="RedPacketData.id"
        @send-join-success="handlerJoin"
        :winnerContent="winnerContent"
      />
    </Dialog>
    <Dialog
      v-if="result_visiable"
      :visible="result_visiable"
      @closeDialog="handlerClose_3"
    >
      <RedPacketResult />
    </Dialog>
    <!-- Video Player Section -->
    <div class="relative aspect-video bg-black">
      <!-- Placeholder video player -->
      <video
        class="w-full h-full object-contain"
        :poster="`${apiBaseUrl}/${liveInfo.cover_url}`"
        controls
        id="videoElement"
      >
        <source src="#" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <!-- Video Controls Overlay -->
      <div
        class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        <div class="flex items-center gap-4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import mpegts from "mpegts.js";
import { ref, onMounted, defineEmits, defineProps, Ref } from "vue";
import { useRoute } from "vue-router";
import { useLiveStore } from "@/store/live";
import { useUserStore } from "@/store/user";
import axios from "@/API/axios";
import { apiBaseUrl } from "@/env/ApiConfig";
import { followUser, checkFollowStatus, unfollowUser } from "@/API/follow";
import Dialog from "../dailog/dialog.vue";
import RedPacketHost from "../dailog/RedPacketHost .vue";
import RedPacketViewer from "../dailog/RedPacketViewer.vue";
import RedPacketResult from "../dailog/RedPacketResult .vue";
import { JoinRedPacket, checkRedPacket, rpIsExpired } from "@/API/redPacket";
import { socketService } from "@/API/socket";
import { RedPacketType, RedPacketViewType } from "@/API/redPacket/type";

const route = useRoute();
const props = defineProps({
  user_permission: {
    type: Number,
    default: 0,
  },
  RedPacketData: {
    type: Object,
    default: {},
  },
  winnerContent: {
    type: String,
    default: "",
  },
});
const liveStore = useLiveStore();
const userStore = useUserStore();
const emit = defineEmits(["sendLiverId", "joinSuccess"]);

interface LiveInfo {
  liver_id: string;
  cover_url: string;
  liver_avatar: string;
  liver_name: string;
  pull_url: string;
  start_time: string;
  status: string;
  tags: string;
  title: string;
}

const liveInfo = ref<LiveInfo>({
  liver_id: "",
  cover_url: "",
  liver_avatar: "",
  liver_name: "",
  pull_url: "",
  start_time: "",
  status: "",
  tags: "",
  title: "",
});

onMounted(async () => {
  try {
    const roomId = route.params.id;
    console.log(`直播的房间id:${roomId}`);
    const res = await axios.get(`/livehome/get_live_by_id/${roomId}`);
    const data = res.data;
    liveInfo.value = data.data as LiveInfo;
    console.log(liveInfo.value);
    await checkStatus();
    emit("sendLiverId", liveInfo.value.liver_id);
    // 确保在获取到直播信息后再初始化播放器
    if (mpegts.getFeatureList().mseLivePlayback) {
      const videoElement = document.getElementById(
        "videoElement"
      ) as HTMLMediaElement;
      if (videoElement && liveInfo.value.pull_url) {
        const player = mpegts.createPlayer({
          type: "mse", // could also be mpegts, m2ts, flv
          isLive: true,
          url: liveInfo.value.pull_url,
        });

        // 绑定播放器到视频元素
        player.attachMediaElement(videoElement);
        player.load();

        // 监听 error 事件
        player.on(mpegts.Events.ERROR, (error: any) => {
          console.error("播放器错误:", error);
          axios.get(`/livehome/close_live/${roomId}`).then((res) => {
            console.log(res.data);
            alert("直播已中断，请稍后重试！");
          });
        });

        // 开始播放
        player.play();
      }
    }
  } catch (error) {
    console.error("获取直播信息失败:", error);
  }
});
const isFollow = ref(false);
const checkStatus = async () => {
  const res = await checkFollowStatus(parseInt(liveInfo.value.liver_id));
  if (res.data.is_following) {
    isFollow.value = true;
  } else {
    isFollow.value = false;
  }
};
const handleFollow = async () => {
  if (isFollow.value) {
    await unfollowUser(parseInt(liveInfo.value.liver_id));
    isFollow.value = false;
    alert("取关成功");
  } else {
    await followUser(parseInt(liveInfo.value.liver_id));
    isFollow.value = true;
    alert("关注成功");
  }
};

//红包相关的逻辑
const host_visiable = ref(false);
const viewer_visiable = ref(false);
const result_visiable = ref(false);

const is_RpVisable = ref(false);

const handlerClose = () => {
  host_visiable.value = false;
};

const handlerClose_2 = () => {
  viewer_visiable.value = false;
};
const handlerClose_3 = () => {
  result_visiable.value = false;
};

const endTime = new Date("2025-05-20T12:00:00");

const getRedPacket = () => {
  viewer_visiable.value = !viewer_visiable.value;
};

const handlerSuccess = () => {
  host_visiable.value = false;
};
const handlerJoin = () => {
  emit("joinSuccess", true);
};
</script>

<style scoped>
/* Add any additional custom styles here if needed */
</style>
