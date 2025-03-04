import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  // 初始化 WebSocket 连接
  connect(userId: string, roomId: string): void {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', {
        query: {
          userId,
          roomId
        }
      });

      console.log('WebSocket connected');
    }
  }

  // 断开 WebSocket 连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }

  // 发送弹幕消息
  sendDanmu(message: string, timestamp: string): void {
    if (this.socket) {
      this.socket.emit('send_danmu', { message, timestamp });
    }
  }

  // 监听接收弹幕消息
  onReceiveDanmu(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('receive_danmu', callback);
    }
  }

  //发送礼物
  sendGift_Socket(gift: {giftName:string,giftCount:number}): void {
    if(this.socket){
      this.socket.emit('send_gift',gift);
    }
  }

  // 监听接收礼物消息
  onReceiveGift(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('receive_gift', callback);
    }
  }
}

export const socketService = new SocketService();