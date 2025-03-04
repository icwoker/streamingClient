<template>
    <div>
        <Nav />
        <div class="content">
            <div class="effect-container" :style="{ justifyContent: startPosition }">
                <Effect v-if="isEffect" :style="{ width: giftWidth + '%' }" :animationPath="animationPath" :loop="true"
                    :autoplay="true" :moveMode="moveMode" />
            </div>
            <div class="live-content">
                <liveContent @sendLiverId="sendLiverId" />
                <div class="live-danmaku">
                    <danmaku :danmakuNewMessage="danmakuNewMessage" />
                </div>

                <GiftController @sendGift="sendGifts" @RechargeDialogShow="RechargeDialogShow" ref="giftController"/>
                <!-- 充值对话框组件 -->
                <RechargeDialog v-model:visible="isRechargeDialogVisible" @recharge-success="handleRechargeSuccess"
                    @recharge-error="handleRechargeError" />
            </div>
            <div class="live-sider">
                <liveSider :userInfo="userInfo" @sendMessage="sendMessage" :socketService="socketService"
                    :messages="messages" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import Nav from "../nav/nav.vue";
import liveContent from "./liveContent.vue";
import liveSider from "./liveSider.vue";
import danmaku from "./danmaku.vue";
import { socketService } from '@/API/socket';
import axios from "@/API/axios";
import GiftController from "./giftController.vue";
import Effect from "./effect.vue";
import RechargeDialog from "./RechargeDialog.vue";
import type { RechargeResult } from '@/API/transaction/types';
import { useUserStore } from '@/store/user'
import { sendGift } from '@/API/transaction';

const userStore = useUserStore();

const userInfo = ref({});
const messages = ref([]);
const route = useRoute();
const id = route.params.id as string;
const liverId = ref('');
const danmakuNewMessage = ref('');
const giftController = ref(null);


const sendMessage = (message: string) => {
    socketService.sendDanmu(message, new Date().toISOString())
}
const sendLiverId = (liver_id: string) => {
    liverId.value = liver_id;
}
onUnmounted(() => {
    socketService.disconnect()
})

interface Gift {
    title: string;
    money: number;
    animationPath: string;
    move_mode: number;
    width: number;
    time: number;
    start_position: string;
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
        const result = await sendGift(gift.money, gift.title, liverId.value);
        if (result.status === 200) {
            // 通知后端礼物发送成功
            try {
                socketService.sendGift_Socket({ giftName: gift.title, giftCount: 1 });
                currentGift.value = gift; // 更新当前礼物信息

            } catch (error) {
                console.log('发送礼物失败', error);
            }
            console.log('老子要发送礼物了！！！');
        } else {
            alert("送礼物失败，请重试");
        }
    }
};



// 充值对话框组件
const isRechargeDialogVisible = ref(false);
const RechargeDialogShow = () => {
    isRechargeDialogVisible.value = true;
}
const handleRechargeSuccess = (result: RechargeResult) => {
    console.log('充值成功', result);
    userStore.setBalance(result.balance);

}
const handleRechargeError = (result: RechargeResult) => {
    console.log('充值失败', result);
}


onMounted(async () => {
    //获取用户信息
    const response = await axios.get('/auth/me');
    userInfo.value = response.data;
    const userId = response.data.user_id;
    console.log(userId);
    socketService.connect(userId, id)
    //监听接收到的弹幕消息
    socketService.onReceiveDanmu((data) => {
        const newMessage = data.message;
        messages.value.push(newMessage);
        danmakuNewMessage.value = newMessage.content;
    });
    // 接收礼物的 socket 回调
    socketService.onReceiveGift((data) => {
                    console.log("收到礼物：", data);
                    const gift = giftController.value.getGifByTitle(data.giftName);
                    if (data.giftName === gift.title) {
                        isEffect.value = true;
                        animationPath.value = gift.animationPath;
                        moveMode.value = gift.move_mode;
                        giftWidth.value = gift.width;
                        giftTime.value = gift.time;
                        startPosition.value = gift.start_position;
                        
                        // 设置定时器，控制特效结束
                        setTimeout(() => {
                            isEffect.value = false;
                        }, gift.time * 1000);
                    }
                });
})
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
    min-height: 80vh;
    z-index: 100;
    top: 12vh;
    left: 0;
    display: flex;
    /* background-color: rgba(0, 0, 0, 0.5); */
}
</style>