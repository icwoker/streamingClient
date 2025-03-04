<template>
    <div :id="containerId" :class="`lottie-container ${move_Mode}`" ></div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, computed } from "vue";
import lottie from "lottie-web";

const props = defineProps({
    animationPath: {
        type: String,
        required: true, // 动画 JSON 文件路径
    },
    loop: {
        type: Boolean,
        default: true, // 是否循环播放
    },
    autoplay: {
        type: Boolean,
        default: true, // 是否自动播放
    },
    moveMode: {
        type: Number,
        default: 0
    }
});
const containerId = ref("lottie-container-" + Math.random().toString(36).substring(2));

onMounted(() => {
    lottie.loadAnimation({
        container: document.getElementById(containerId.value) as HTMLElement, // 动画容器
        renderer: "svg", // 渲染方式
        loop: props.loop, // 是否循环
        autoplay: props.autoplay, // 是否自动播放
        path: props.animationPath, // 动画 JSON 文件路径
    });
});

const move_Mode = computed(()=>{
    switch(props.moveMode){
        case 0:
            return 'move-left-to-right';
        case 1:
            return 'move-bottom-to-top';
        case 2:
            return 'move-default';
    }
})
</script>

<style scoped>
.lottie-container {
    width: 60%;
    height: 100%;
    animation: fromLeftToRight 10s linear forwards;
}

.move-left-to-right {
    animation: fromLeftToRight 10s linear forwards;
}

.move-bottom-to-top {
    animation: bottomToTop 10s linear forwards;
}

.move-default {
    animation: default 10s linear forwards;
}

@keyframes default {
    0% {
        display: block;
        transform: translateX(0);
    }

    100% {
        display: none;
        transform: translateX(0);
    }
}

@keyframes bottomToTop {
    0% {
        display: block;
        transform: translateY(100%);
    }

    50% {
        transform: translateY(0);
    }

    100% {
        display: none;
        transform: translateY(-100%);
    }
}

@keyframes fromLeftToRight {
    0% {
        display: block;
        transform: translateX(-100%);
    }

    50% {
        transform: translateX(0);
    }

    100% {
        display: none;
        transform: translateX(100%);
    }
}
</style>