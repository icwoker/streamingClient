<template>
  <div class="bg-white rounded-lg shadow-xl p-6 w-96 animate-fade-in-up">
    <h2 class="text-2xl font-bold text-red-700 mb-4 text-center">发送红包</h2>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >红包名称</label
        >
        <input
          type="text"
          placeholder="请输入红包的名称"
          class="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ease-in-out"
          v-model="redPacketData.title"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >红包金额</label
        >
        <input
          type="number"
          min="0"
          placeholder="请输入红包的金额"
          class="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ease-in-out"
          v-model="redPacketData.amount"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >中奖人数</label
        >
        <input
          type="number"
          min="0"
          placeholder="设置中奖人数"
          class="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ease-in-out"
          v-model="redPacketData.winnerNum"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >倒计时（分钟）</label
        >
        <input
          type="number"
          min="0"
          placeholder="倒计时（分钟）"
          class="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ease-in-out"
          v-model="redPacketData.expireTime"
        />
      </div>

      <button
        class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 cursor-pointer"
        @click="collectData"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, defineEmits } from "vue";
import { RedPacketType } from "@/API/redPacket/type";
import { socketService } from "@/API/socket";
import { JoinRedPacket, checkRedPacket, rpIsExpired } from "@/API/redPacket";
// 可以根据需要扩展更多功能，比如表单验证、数据绑定等
const redPacketData: Ref<RedPacketType> = ref({
  title: "",
  amount: 0,
  winnerNum: 0,
  expireTime: 0,
});
const emit = defineEmits(["sendSuccess"]);
const collectData = async () => {
  // console.log(redPacketData.value);
  // 获取当前页面的URL
  const url = new URL(window.location.href);

  // 提取路径部分
  const path = url.pathname;

  // 分割路径并提取liveid
  const segments = path.split("/");
  const liveId = segments[segments.length - 1];
  const data = await rpIsExpired(liveId);
  if (data.status) {
    alert(data.message);
    return;
  } else {
    if (socketService) {
      socketService.sendRedPacket(redPacketData.value);
      emit("sendSuccess", true);
    }
  }
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
