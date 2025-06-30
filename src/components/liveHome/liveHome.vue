<template>
  <div>
    <Nav />
    <div class="content">
      <div
        class="effect-container"
        v-if="isEffect"
        :style="{ justifyContent: startPosition }"
      >
        <Effect
          :style="{ width: giftWidth + '%' }"
          :animationPath="animationPath"
          :loop="true"
          :autoplay="true"
          :moveMode="moveMode"
        />
      </div>
      <div class="live-content">
        <liveContent
          @sendLiverId="sendLiverId"
          :user_permission="user_permission"
          :RedPacketData="RedPacketData"
          @join-success="handlerJoin"
          :winnerContent="winnerContent"
        />
        <div class="live-danmaku">
          <danmaku :danmakuNewMessage="danmakuNewMessage" />
        </div>

        <GiftController
          @sendGift="sendGifts"
          @RechargeDialogShow="RechargeDialogShow"
          ref="giftController"
        />
        <!-- 充值对话框组件 -->
        <RechargeDialog
          v-model:visible="isRechargeDialogVisible"
          @recharge-success="handleRechargeSuccess"
          @recharge-error="handleRechargeError"
        />
      </div>
      <div class="live-sider">
        <liveSider
          :userInfo="userInfo"
          @sendMessage="sendMessage"
          :socketService="socketService"
          :messages="messages"
          :giftRank="giftRank"
          :user_permission="user_permission"
          :room-id="id"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import {
  defineComponent,
  ref,
  Ref,
  onMounted,
  onUnmounted,
  computed,
} from "vue";
import Nav from "../nav/nav.vue";
import liveContent from "./liveContent.vue";
import liveSider from "./liveSider.vue";
import danmaku from "./danmaku.vue";
import { socketService } from "@/API/socket";
import axios from "@/API/axios";
import GiftController from "./giftController.vue";
import Effect from "./effect.vue";
import RechargeDialog from "./RechargeDialog.vue";
import type { RechargeResult } from "@/API/transaction/types";
import { useUserStore } from "@/store/user";
import { sendGift } from "@/API/transaction";
import { getChatMessage } from "@/API/chatMessage";
import { getGiftRank } from "@/API/transaction";
import { apiBaseUrl } from "@/env/ApiConfig";
import { meType } from "@/types/user";
import { getFollowStats } from "@/API/follow";
import {
  JoinRedPacket,
  checkRedPacket,
  rpIsExpired,
  getRedPakcetResult,
} from "@/API/redPacket";
import { RedPacketType, RedPacketViewType } from "@/API/redPacket/type";
import { createPreciseCountdown } from "@/woker/redpacket";
const userStore = useUserStore();

const userInfo: Ref<meType> = ref({
  user_id: 0,
  user_name: "",
  bio: "",
  avatar_url: "",
});
const messages = ref([]);
const route = useRoute();
const id = route.params.id as string;
const liverId = ref("");
const danmakuNewMessage = ref("");
const giftController = ref(null);
const giftRank = ref([]);

const sendMessage = (message: string) => {
  socketService.sendDanmu(message, new Date().toISOString());
};
const sendLiverId = (liver_id: string) => {
  liverId.value = liver_id;
};
onUnmounted(() => {
  socketService.disconnect();
});

interface Gift {
  id: number;
  title: string;
  money: number;
  animationPath: string;
  move_mode: number;
  width: number;
  time: number;
  start_position: string;
}

interface BannedMessageType {
  type: string;
  message: string;
  banned_user_id: number;
  anchor_id: number;
  room_id: string;
}

const animationPath = ref("");
const moveMode = ref(0);
const isEffect = ref(false);
const giftWidth = ref(50);
const giftTime = ref(10);
const startPosition = ref("left");

// 当前礼物信息
const currentGift = ref<Gift | null>(null);

// 发送礼物逻辑
const sendGifts = async (gift: Gift) => {
  // 检查余额
  if (userStore.balance < gift.money) {
    isRechargeDialogVisible.value = true;
    alert("余额不足，请充值");
    return;
  }

  console.log("发送礼物：", gift);

  // 如果当前没有特效在播放
  if (!isEffect.value) {
    // 调用后端接口发送礼物
    const result = await sendGift(gift.id, 1, +liverId.value, id);
    if (result.status === 200) {
      // 通知后端礼物发送成功
      try {
        socketService.sendGift_Socket({ giftName: gift.title, giftCount: 1 });
        currentGift.value = gift; // 更新当前礼物信息
      } catch (error) {
        console.log("发送礼物失败", error);
      }
      console.log("老子要发送礼物了！！！");
      //更新余额
      userStore.setBalance(userStore.balance - gift.money);
    } else {
      alert("送礼物失败，请重试");
    }
  }
};

// 充值对话框组件
const isRechargeDialogVisible = ref(false);
const RechargeDialogShow = () => {
  isRechargeDialogVisible.value = true;
};
const handleRechargeSuccess = (result: RechargeResult) => {
  console.log("充值成功", result);
  userStore.setBalance(result.balance);
};
const handleRechargeError = (result: RechargeResult) => {
  console.log("充值失败", result);
};

const user_permission = ref(1);

onMounted(async () => {
  //获取用户信息
  const response = await axios.get("/auth/me");
  userInfo.value = response.data;
  const userId = response.data.user_id;
  //   const avatar = `${apiBaseUrl}/${userInfo.value.avatar_url}`;
  const balance = await axios.get("/transaction/balance");
  userStore.setBalance(balance.data.balance);
  userStore.setUserId(userId);
  userStore.setUsername(userInfo.value.user_name);
  userStore.setAvatar(userInfo.value.avatar_url);
  //   userStore.setAvatar(avatar);
  const follow_stats = await getFollowStats();
  userStore.setFollowersCount(follow_stats.data.follows_count);
  userStore.setFollowingCount(follow_stats.data.fans_count);
  console.log(userId);
  socketService.connect(userId, id);
  const old_messages = await getChatMessage(id);
  //检查用户的权限
  const permissionResponse = await axios.post(
    "/livehome/check_live_permission",
    {
      live_id: id,
    }
  );
  console.log(permissionResponse.data);
  user_permission.value = permissionResponse.data.permission;
  messages.value = old_messages.data.data;
  //获取礼物的排行榜
  const giftRankResponse = await getGiftRank(id);
  giftRank.value = giftRankResponse.data;
  //监听接收到的弹幕消息
  socketService.onReceiveDanmu((data) => {
    const newMessage = data.message;
    messages.value.push(newMessage);
    danmakuNewMessage.value = newMessage.content;
  });
  // 接收礼物的 socket 回调
  socketService.onReceiveGift(async (data) => {
    console.log("收到礼物：", data);
    const gift = giftController.value.getGifByTitle(data.giftName);
    if (data.giftName === gift.title) {
      isEffect.value = true;
      animationPath.value = gift.animationPath;
      moveMode.value = gift.move_mode;
      giftWidth.value = gift.width;
      giftTime.value = gift.time;
      startPosition.value = gift.start_position;

      //收到礼物回调后再获取一次礼物排行榜
      const giftRankResponse = await getGiftRank(id);
      giftRank.value = giftRankResponse.data;
      // 设置定时器，控制特效结束
      setTimeout(() => {
        isEffect.value = false;
      }, gift.time * 1000);
    }
  });

  //处理红包相关的事件

  //1、先查询一下直播间有没有红包，如果有填充信息
  const RedPacketStatus = await checkRedPacket(id);
  if (RedPacketStatus.data) {
    const RedPacket_Data = RedPacketStatus.data;
    console.log(RedPacket_Data);
    const ch_time = new Date(RedPacket_Data?.expire_time);
    ch_time.setHours(ch_time.getHours() - 8);
    RedPacketData.value.id = RedPacket_Data.red_packet_id;
    RedPacketData.value.title = RedPacket_Data.title;
    RedPacketData.value.amount = RedPacket_Data.amount;
    RedPacketData.value.winnerNum = RedPacket_Data.winner_num;
    RedPacketData.value.expireTime = ch_time as any;
    RedPacketData.value.has_join = RedPacket_Data.has_join;
    winners.value = [];
    //尝试创建一个worker在时间结束后获取中奖名单
    createPreciseCountdown(
      ch_time,
      async () => {
        setTimeout(async () => {
          const response_1 = await getRedPakcetResult(
            RedPacket_Data.red_packet_id
          );
          winners.value = response_1.data;
          const balance = await axios.get("/transaction/balance");
          userStore.setBalance(balance.data.balance);
        }, 2000);
      },
      null
    );
  }

  //2、监听红包发送的信息
  socketService.onReceiveRedPacket((data: RedPacketViewType) => {
    console.log(data);
    const time = data.expireTime.split(".")[0];
    console.log(time);
    RedPacketData.value.id = data.id;
    RedPacketData.value.title = data.title;
    RedPacketData.value.amount = data.amount;
    RedPacketData.value.winnerNum = data.winnerNum;
    RedPacketData.value.expireTime = time;
    RedPacketData.value.has_join = data.has_join;
    winners.value = [];
    //尝试创建一个worker来监听红包的中奖信息
    createPreciseCountdown(
      time,
      async () => {
        setTimeout(async () => {
          const response_1 = await getRedPakcetResult(data.id);
          winners.value = response_1.data;
          const balance = await axios.get("/transaction/balance");
          userStore.setBalance(balance.data.balance);
        }, 2000);
      },
      null
    );
  });

  //监听主播拉黑事件
  socketService.onReceiveBanned((data: BannedMessageType) => {
    console.log(data);
    if (data.banned_user_id == userId) {
      alert(data.message);
      window.location.href = "/";
    }
  });
});

const RedPacketData: Ref<RedPacketViewType> = ref({
  id: "",
  anchorId: "",
  liveId: "",
  title: "",
  amount: 0,
  winnerNum: 0,
  expireTime: "",
  has_join: false,
});

const handlerJoin = () => {
  RedPacketData.value.has_join = true;
};

const winners: Ref<String[]> = ref([]);

const winnerContent = computed(() => {
  return winners.value.join(",");
});
</script>

<style scoped>
.content {
  display: flex;
  width: 100%;
  min-height: 90vh;
  background-image: url("@/assets/defaultbg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  justify-content: space-around;
  align-items: center;
}

.live-content {
  width: 60%;
  min-height: 80vh;
  /* background-color: #fff; */
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.live-danmaku {
  position: absolute;
  width: 100%;
  min-height: 60vh;
  border-radius: 10px;
  z-index: 10;
  top: 15vh;
  left: 0;
}

.live-sider {
  width: 20%;
  min-height: 80vh;
  overflow: hidden;
  border-radius: 10px;
}

.effect-container {
  position: absolute;
  width: 100%;
  min-height: 65vh;
  z-index: 100;
  top: 30vh;
  left: 0;
  display: flex;
  /* background-color: rgba(0, 0, 0, 0.5); */
}
</style>
