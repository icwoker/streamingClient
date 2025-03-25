// src/services/notificationService.ts
import { apiBaseUrl } from "@/env/ApiConfig";
export interface Notification {
  type: string;
  // 添加其他你的消息可能包含的字段
  [key: string]: any;
}

export class NotificationService {
  private eventSource: EventSource | null = null;

  connect(userId: string, onMessage: (data: Notification) => void) {
    // 确保有有效的userId
    if (!userId) {
      console.warn("Cannot connect to notification service without a user ID");
      return;
    }

    // 关闭之前可能存在的连接
    this.disconnect();
    // 创建新的 EventSource 连接
    const url = `${apiBaseUrl}/api/livehome/notifications/${userId}`;
    this.eventSource = new EventSource(url);

    // 监听消息事件
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 不处理心跳消息
        if (data.type !== "heartbeat") {
          onMessage(data);
        }else{
            console.log('收到心跳消息');
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    // 错误处理
    this.eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      this.disconnect();

      // 可以在这里添加重连逻辑
      setTimeout(() => this.connect(userId, onMessage), 5000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export default new NotificationService();
