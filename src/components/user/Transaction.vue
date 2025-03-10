<template>
    <div class="p-6">
      <!-- 页面标题 -->
      <h1 class="text-2xl font-bold mb-6 text-gray-800">交易记录</h1>
  
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2b7fff] mx-auto"></div>
        <p class="mt-3 text-gray-500">加载中...</p>
      </div>
  
      <!-- 无数据提示 -->
      <div v-else-if="transactions.length === 0" class="text-center py-16 bg-white rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-3 text-gray-500">暂无交易记录</p>
      </div>
  
      <!-- 交易记录列表 -->
      <div v-else>
        <div class="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">余额</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="transaction in transactions" 
                :key="transaction.id"
                class="hover:bg-gray-50 transition-colors duration-150"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(transaction.created_at) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ transaction.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                    :class="getTransactionTypeClass(transaction.transaction_type)"
                  >
                    {{ transaction.transaction_type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium" :class="getAmountColor(transaction.transaction_type)">
                  {{ getAmountPrefix(transaction.transaction_type) }}{{ transaction.amount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 font-medium">{{ transaction.balance_after.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- 分页 -->
        <div class="flex justify-between items-center mt-6">
          <button
            class="px-5 py-2 bg-[#2b7fff] text-white rounded-md hover:bg-[#1a6ae6] transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            :disabled="page === 1"
            @click="changePage(page - 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>上一页</span>
          </button>
          <p class="text-gray-600">第 {{ page }} 页，共 {{ totalPages }} 页</p>
          <button
            class="px-5 py-2 bg-[#2b7fff] text-white rounded-md hover:bg-[#1a6ae6] transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            :disabled="page === totalPages"
            @click="changePage(page + 1)"
          >
            <span>下一页</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from "vue";
  import { getTransactionList } from "@/API/transaction";
  import { TransactionType } from "@/API/transaction/types";
  
  // 状态变量
  const transactions = ref<TransactionType[]>([]);
  const loading = ref(false);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  
  // 计算总页数
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value));
  
  // 加载交易记录
  const loadTransactions = async () => {
    loading.value = true;
    try {
      const data = await getTransactionList(page.value, pageSize.value);
      transactions.value = data.transactions;
      total.value = data.total;
    } catch (error) {
      console.error("加载交易记录失败", error);
    } finally {
      loading.value = false;
    }
  };
  
  // 切换分页
  const changePage = (newPage: number) => {
    page.value = newPage;
    loadTransactions();
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 根据交易类型获取金额颜色
  const getAmountColor = (type: string) => {
    switch(type) {
      case '充值':
        return 'text-[#00c950]';
      case '送礼物':
        return 'text-[#fb2c36]';
      case '收到礼物':
        return 'text-[#00c950]';
      default:
        return 'text-gray-700';
    }
  };
  
  // 根据交易类型获取金额前缀
  const getAmountPrefix = (type: string) => {
    switch(type) {
      case '充值':
        return '+';
      case '送礼物':
        return '-';
      case '收到礼物':
        return '+';
      default:
        return '';
    }
  };
  
  // 获取交易类型的样式类
  const getTransactionTypeClass = (type: string) => {
    switch(type) {
      case '充值':
        return 'bg-blue-100 text-blue-800';
      case '送礼物':
        return 'bg-red-100 text-red-800';
      case '收到礼物':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 页面加载时初始化数据
  onMounted(() => {
    loadTransactions();
  });
  </script>