<template>
    <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
      <div class="recharge-dialog">
        <div class="dialog-header">
          <h3>账户充值</h3>
          <button class="close-btn" @click="handleClose">&times;</button>
        </div>
        
        <div class="dialog-body">
          <div class="amount-options">
            <div 
              v-for="amount in predefinedAmounts" 
              :key="amount"
              :class="['amount-option', { active: selectedAmount === amount }]"
              @click="selectAmount(amount)"
            >
              {{ amount }}元
            </div>
            
            <div :class="['amount-option custom', { active: isCustomAmount }]" @click="enableCustomAmount">
              <span v-if="!isCustomAmount">任意金额</span>
              <input
                v-else
                ref="customAmountInput"
                v-model="customAmount"
                type="number"
                min="1"
                placeholder="输入金额"
                @click.stop
                @input="validateCustomAmount"
              />
            </div>
          </div>
          
          <div class="selected-amount">
            <p>充值金额: <span>{{ finalAmount }}元</span></p>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button 
            class="cancel-btn" 
            @click="handleClose"
          >
            取消
          </button>
          <button 
            class="confirm-btn" 
            :disabled="!finalAmount || isLoading" 
            @click="confirmRecharge"
          >
            {{ isLoading ? '处理中...' : '确认支付' }}
          </button>
        </div>
        
        <!-- 充值结果提示 -->
        <div v-if="rechargeStatus" :class="['recharge-status', rechargeStatus]">
          <div v-if="rechargeStatus === 'success'" class="status-icon success">✓</div>
          <div v-else-if="rechargeStatus === 'error'" class="status-icon error">✗</div>
          <p>{{ rechargeMessage }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, nextTick, watch } from 'vue';
  import type { RechargeResult } from '@/API/transaction/types';
  import { recharge } from '@/API/transaction';


  // 定义组件属性
  const props = defineProps<{
    visible: boolean;
  }>();
  
  // 定义组件事件
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'recharge-success', result: RechargeResult): void;
    (e: 'recharge-error', error: any): void;
    (e: 'close'): void;
  }>();
  
  // 金额选择
  const predefinedAmounts = [10, 20, 50, 100, 200, 500];
  const selectedAmount = ref<number | null>(null);
  const isCustomAmount = ref(false);
  const customAmount = ref<string>('');
  const customAmountInput = ref<HTMLInputElement | null>(null);
  const isLoading = ref(false);
  const rechargeStatus = ref<'success' | 'error' | null>(null);
  const rechargeMessage = ref('');
  
  // 计算最终选择的金额
  const finalAmount = computed(() => {
    if (isCustomAmount.value && customAmount.value) {
      return parseFloat(customAmount.value);
    }
    return selectedAmount.value;
  });
  
  // 监听对话框显示状态，重置表单
  watch(() => props.visible, (newValue) => {
    if (newValue) {
      resetForm();
    }
  });
  
  // 重置表单状态
  const resetForm = () => {
    selectedAmount.value = null;
    isCustomAmount.value = false;
    customAmount.value = '';
    rechargeStatus.value = null;
    rechargeMessage.value = '';
    isLoading.value = false;
  };
  
  // 关闭对话框
  const handleClose = () => {
    emit('update:visible', false);
    emit('close');
  };
  
  // 选择预定义金额
  const selectAmount = (amount: number) => {
    selectedAmount.value = amount;
    isCustomAmount.value = false;
    customAmount.value = '';
  };
  
  // 启用自定义金额输入
  const enableCustomAmount = () => {
    isCustomAmount.value = true;
    selectedAmount.value = null;
    
    // 自动聚焦输入框
    nextTick(() => {
      if (customAmountInput.value) {
        customAmountInput.value.focus();
      }
    });
  };
  
  // 验证自定义金额
  const validateCustomAmount = () => {
    if (customAmount.value) {
      const amount = parseFloat(customAmount.value);
      if (isNaN(amount) || amount <= 0) {
        customAmount.value = '';
      }
    }
  };
  // 确认充值
  const confirmRecharge = async () => {
    if (!finalAmount.value) return;
    
    try {
      isLoading.value = true;
      rechargeStatus.value = null;
      
      // 调用充值接口
      const data = await recharge(finalAmount.value);
      // 显示成功消息
      rechargeStatus.value = 'success';
      rechargeMessage.value = `充值成功！已成功充值 ${finalAmount.value} 元`;
      
      // 触发成功事件
      const result: RechargeResult = {
        message: data.message,
        balance: data.balance
      };
      emit('recharge-success', result);
      
      // 3秒后自动关闭对话框
      setTimeout(() => {
        if (rechargeStatus.value === 'success') {
          handleClose();
        }
      }, 3000);
    
    } catch (error) {
      // 显示错误消息
      rechargeStatus.value = 'error';
      rechargeMessage.value = '充值失败，请稍后再试';
      
      // 触发失败事件
      emit('recharge-error', error);
      
      console.error('充值失败:', error);
    } finally {
      isLoading.value = false;
    }
  };
  

  </script>
  
  <style scoped>
  /* 对话框样式 */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .recharge-dialog {
    width: 400px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  
  .dialog-header {
    background-color: #f8f9fa;
    padding: 15px 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .dialog-header h3 {
    margin: 0;
    color: #212529;
    font-weight: 600;
    font-size: 18px;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6c757d;
    padding: 0;
    line-height: 1;
  }
  
  .dialog-body {
    padding: 20px;
  }
  
  .amount-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .amount-option {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .amount-option:hover {
    background-color: #f0f7ff;
    border-color: #90c8ff;
  }
  
  .amount-option.active {
    background-color: #e6f4ff;
    border-color: #1890ff;
    color: #1890ff;
  }
  
  .amount-option.custom {
    position: relative;
  }
  
  .amount-option.custom input {
    width: 80%;
    height: 30px;
    padding: 0 8px;
    border: none;
    background: transparent;
    text-align: center;
    font-size: 14px;
    outline: none;
  }
  
  .selected-amount {
    margin-top: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    text-align: center;
  }
  
  .selected-amount p {
    margin: 0;
    font-size: 16px;
    color: #495057;
  }
  
  .selected-amount span {
    font-weight: bold;
    color: #1890ff;
    font-size: 18px;
  }
  
  .dialog-footer {
    padding: 15px 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .cancel-btn, .confirm-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .cancel-btn {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
  }
  
  .cancel-btn:hover {
    background-color: #e9ecef;
  }
  
  .confirm-btn {
    background-color: #1890ff;
    border: 1px solid #1890ff;
    color: white;
  }
  
  .confirm-btn:hover:not(:disabled) {
    background-color: #096dd9;
    border-color: #096dd9;
  }
  
  .confirm-btn:disabled {
    background-color: #bae0ff;
    border-color: #bae0ff;
    cursor: not-allowed;
  }
  
  /* 充值状态提示 */
  .recharge-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }
  
  .recharge-status.success {
    color: #52c41a;
  }
  
  .recharge-status.error {
    color: #f5222d;
  }
  
  .status-icon {
    font-size: 40px;
    margin-bottom: 10px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .status-icon.success {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
  }
  
  .status-icon.error {
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
  }
  
  .recharge-status p {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
  </style>