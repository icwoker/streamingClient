<template>
    <div class="gif-controller mb-10 rounded-b-lg flex ">
        <Gift v-for="gif in gifList" :key="gif.title" :title="gif.title" :money="gif.money"
            :animationPath="gif.animationPath" @click="sendGifts(gif)" />
        <div class="balance" @click="RechargeDialogShow">
            <div class="balance_image">
                <img src="@/assets/balance.svg" alt="余额">
            </div>
            <div class="text">余额: {{ balance }}元</div>
            <div class="recharge">立刻充值</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Gift from '@/components/part/gift.vue';
import { ref,defineEmits,computed,defineExpose } from 'vue';
import { useUserStore } from '@/store/user';


const emit = defineEmits(['sendGift','RechargeDialogShow'])

const userStore = useUserStore();

const balance = computed(()=>{
    return userStore.balance;
})

const gifList = ref([
    {
        id:1,
        title: '豪华超跑',
        money: 200,
        animationPath: '/public/lottie/car.json',
        move_mode: 0,
        width:50,
        time:10,
        start_position:'left',
    },
    {
        id:2,
        title: '告白气球', 
        money: 300,
        animationPath: '/public/lottie/hotAirBalloon.json',
        move_mode: 0,
        width:50,   
        time:10,
        start_position:'left',
    },
    {
        id:3,
        title: '冲天火箭', 
        money: 300,
        animationPath: '/public/lottie/rocket.json',
        move_mode:2,
        width:100,
        time:3,
        start_position:'center',
    },
    {
        id:4,
        title: '七彩彩虹', 
        money: 200,
        animationPath: '/public/lottie/rainbow.json',
        move_mode:0,
        width:50,
        time:10,
        start_position:'left',
    },
    {
        id:5,
        title: '绚丽烟花', 
        money: 300,
        animationPath: '/public/lottie/firework.json',
        move_mode:0,
        width:50,
        time:10,
        start_position:'left',
    },
    {
        id:6,
        title: '星耀王冠', 
        money: 100,
        animationPath: '/public/lottie/king.json',
        move_mode:0,
        width:50,
        time:10,
        start_position:'left',
    },
    {
        id:7,
        title: '牛气冲天', 
        money: 30,
        animationPath: '/public/lottie/cow.json',
        move_mode:0,
        width:50,
        time:10,
        start_position:'left',
    },
    {
        id:8,
        title: '浪漫玫瑰', 
        money: 10,
        animationPath: '/public/lottie/rose.json',
        move_mode:2,
        width:50,
        time:4,
        start_position:'center',
    },
    {
        id:9,
        title: '甜蜜情书',
        money: 20,
        animationPath: '/public/lottie/love-message.json',
        move_mode:2,
        width:50,
        time:4,
        start_position:'center',
    },
    {
        id:10,
        title: '比心爱你', 
        money: 50,
        animationPath: '/public/lottie/hand-love.json',
        move_mode:2,
        width:50,
        time:7,
        start_position:'center',
    }
])

const sendGifts = (gif: any) => {
    console.log('发送礼物', gif)
    emit('sendGift', gif)
}
const RechargeDialogShow = ()=>{
    emit('RechargeDialogShow',true)
}

const getGifByTitle = (title: string) => {
    return gifList.value.find(gif => gif.title === title)
}

defineExpose({
    getGifByTitle
})
</script>

<style scoped>
.gif-controller {
    min-height: 100px;
    width: 100%;
    background-color: #ffffff;
}

.balance {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin: 10px 20px;
    padding: 10px;
    background-color: #f9f9f9;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.balance:hover {
    background-color: #4f7e92;
    color: #ffffff;
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.balance_image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #475851;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
}

.balance:hover .balance_image {
    background-color: #ffffff;
}

.balance img {
    width: 30px;
    height: 30px;
}

.balance .text {
    font-size: 14px;
    color: #6c757d;
    font-weight: 500;
    text-align: center;
}

.balance .recharge {
    font-size: 16px;
    font-weight: bold;
    color: #007bff;
    text-align: center;
    transition: color 0.3s ease;
}

.balance:hover .recharge {
    color: #ffffff;
}
</style>