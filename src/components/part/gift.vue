<template>
    <div class="gif-container">
        <div class="gif-content" ref="gifContent">
        </div>
        <div class="gif-title">
            {{ props.title }}
        </div>
        <div class="gif-money">
            {{ props.money }}元
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref , onMounted,defineProps } from 'vue';
import lottie from "lottie-web";

const gifContent = ref<HTMLDivElement>();

const props = defineProps({
    title:String,
    money:Number,
    animationPath:String
})

onMounted(() => {
    lottie.loadAnimation({
        container: gifContent.value,
        renderer: "svg",
        loop:true,
        autoplay:true,
        path:props.animationPath
    });
});
</script>

<style scoped>
.gif-container {
    width: 100px;
    height: 130px;
    border-radius: 12px;
    background-color: #f9f9f9;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.gif-container:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    background-color: #e6f7ff;
}

.gif-content {
    width: 100%;
    height: 60%;
    background-color: #d9d9d9;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    transition: all 0.3s ease;
}

.gif-container:hover .gif-content {
    background-color: #b3e5fc;
}

.gif-title {
    width: 100%;
    height: 20%;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    color: #333333;
    margin-top: 5px;
    transition: color 0.3s ease;
}

.gif-container:hover .gif-title {
    color: #007bff;
}

.gif-money {
    width: 100%;
    height: 20%;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    color: #666666;
    margin-top: 5px;
    transition: color 0.3s ease;
}

.gif-container:hover .gif-money {
    color: #ff5722;
}
</style>