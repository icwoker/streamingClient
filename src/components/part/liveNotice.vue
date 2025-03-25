<!-- src/components/NotificationListener.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import notificationService, { Notification } from'@/API/sse';

const props = defineProps<{
  userId: string;
}>();

const notifications = ref<Notification[]>([]);
const isConnected = ref(false);

// 处理收到的消息
const handleNotification = (notification: Notification) => {
  notifications.value.push(notification);
  // 你可以根据不同的notification.type执行不同的操作
};

onMounted(() => {
  // 组件挂载时连接SSE
  console.log('触发多少次');
  if(props.userId !== null){
    notificationService.connect(props.userId, handleNotification);
    isConnected.value = true;
  }
});

onBeforeUnmount(() => {
  // 组件卸载时断开SSE连接
  notificationService.disconnect();
  isConnected.value = false;
});
</script>

<template>
  <div class="notification-container">
    <div v-if="isConnected" class="connection-status connected">
      已连接到通知服务
    </div>
    <div v-else class="connection-status disconnected">
      未连接到通知服务
    </div>
    
    <div class="notifications-list">
      <div v-if="notifications.length === 0" class="no-notifications">
        暂无通知
      </div>
      <div 
        v-for="(notification, index) in notifications" 
        :key="index"
        class="notification-item"
      >
        <!-- 根据你的通知结构来渲染通知内容 -->
        <div>{{ notification.type }}</div>
        <!-- 其他通知内容... -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-container {
  padding: 1rem;
}

.connection-status {
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.connected {
  background-color: #e6f7e6;
  color: #28a745;
}

.disconnected {
  background-color: #f8d7da;
  color: #dc3545;
}

.notifications-list {
  margin-top: 1rem;
}

.notification-item {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.no-notifications {
  color: #6c757d;
  font-style: italic;
}
</style>