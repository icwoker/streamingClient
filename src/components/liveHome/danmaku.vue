<template>
    <div class="danmaku-container" ref="danmakuContainer">
        <div class="test-danmaku" v-for="message in danmakuMessages" :key="message.message" :style="{top:message.top+'%'}">
            {{ message.message   }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const props = defineProps({
    danmakuNewMessage: {
        type: String,
        default: ''
    },
});

interface DanmakuMessage {  
    message: string;
    top: number;
}

//弹幕消息队列
const danmakuMessages = ref<DanmakuMessage[]>([]);
const danmakuContainer = ref<HTMLDivElement>();
//监听danmakuNewMessage的变化
watch(() => props.danmakuNewMessage, (newMessage) => {
    if (newMessage) {
        console.log('正在接受弹幕消息：', newMessage);
        renderDanmaku(newMessage);
    }
})

//渲染弹幕
const renderDanmaku = (message: string) => {
    const obj = {
        message: message,
        top: Math.random() * 80,
    }
    danmakuMessages.value.push(obj);
}

watch(danmakuMessages,()=>{
    if(danmakuMessages.value.length>10){
        danmakuMessages.value.shift();
    }
})
</script>

<style scoped>
.danmaku-container {
    width: 100%;
    height: 100%;
    min-height: 60vh;
    position: relative;
    overflow: hidden;
    /* 防止弹幕溢出容器 */
    pointer-events: none;
    /* 允许点击穿透弹幕 */
}

.danmaku {
    position: absolute;
    white-space: nowrap;
    color: white;
    font-size: 20px;
    text-shadow: 1px 1px 2px #000;
}

@keyframes moveLeft {
    from {
        left: 100%;
    }

    to {
        left: -100%;
    }
}

.test-danmaku {
    position: absolute;
    top: 10%;
    left: 0;
    white-space: nowrap;
    color: white;
    font-size: 20px;
    text-shadow: 1px 1px 2px #000;
    animation: moveRight 10s linear forwards;
}

@keyframes moveRight {
    from {
        left: 0;
    }

    to {
        left: 100%;
    }
}
</style>