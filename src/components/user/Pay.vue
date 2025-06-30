<template>
  <div class="flex flex-col items-center p-8 space-y-8">
    <!-- 上层余额显示 -->
    <div class="text-2xl font-bold">
      当前余额: <span class="text-[#2b7fff]">¥{{ balance }}</span>
    </div>

    <!-- 中层充值选项 -->
    <div class="grid grid-cols-3 gap-4 w-full max-w-2xl">
      <div
        v-for="amount in amounts"
        :key="amount"
        :class="[
          'border rounded-lg p-4 text-center cursor-pointer transition-all duration-300',
          selectedAmount === amount
            ? 'border-[#2b7fff] text-[#2b7fff] scale-105'
            : 'border-gray-300 hover:border-gray-400',
        ]"
        @click="selectedAmount = amount"
      >
        ¥{{ amount }}
      </div>
    </div>

    <!-- 下层自定义金额和确认按钮 -->
    <div class="w-full max-w-2xl flex flex-col space-y-4">
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          >¥</span
        >
        <input
          type="number"
          v-model="customAmount"
          placeholder="请输入充值金额"
          class="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:border-transparent"
        />
      </div>

      <button
        @click="handleRecharge"
        class="self-end px-8 py-3 bg-[#2b7fff] text-white rounded-lg hover:bg-[#1a6eee] transition-colors duration-300"
      >
        确认充值
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "@/API/axios";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const balance = ref(userStore.balance);
const amounts = [10, 20, 50, 100, 200, 500];
const selectedAmount = ref(0);
const customAmount = ref("");

const handleRecharge = async () => {
  const amount = Number(customAmount.value) || selectedAmount.value;
  if (!amount) {
    alert("请选择或输入充值金额");
    return;
  }
  // TODO: 实现充值逻辑
  console.log("充值金额:", amount);
  if (amount > 50000) {
    alert("充值金额不能超过50000");
    return;
  }
  if (amount <= 0) {
    alert("充值金额不能小于0");
    return;
  }
  try {
    const response = await axios.post("/transaction/recharge", {
      amount: amount,
    });
    if (response.status === 200) {
      userStore.balance += amount;
      balance.value = userStore.balance;
      alert("充值成功");
    }
  } catch (error) {
    alert("充值失败,原因:" + error);
  } finally {
    customAmount.value = "";
  }
};
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
