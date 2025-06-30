import { io, Socket } from "socket.io-client";
import { RedPacketType } from "./redPacket/type";

class SocketService {
  private socket: Socket | null = null;

  // 初始化 WebSocket 连接
  connect(userId: string, roomId: string): void {
    if (!this.socket) {
      this.socket = io("http://localhost:5000", {
        query: {
          userId,
          roomId,
        },
      });

      console.log("WebSocket connected");
    }
  }

  // 断开 WebSocket 连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("WebSocket disconnected");
    }
  }

  // 发送弹幕消息
  sendDanmu(message: string, timestamp: string): void {
    if (this.socket) {
      this.socket.emit("send_danmu", { message, timestamp });
    }
  }

  // 监听接收弹幕消息
  onReceiveDanmu(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("receive_danmu", callback);
    }
  }

  //发送礼物
  sendGift_Socket(gift: { giftName: string; giftCount: number }): void {
    if (this.socket) {
      this.socket.emit("send_gift", gift);
    }
  }

  // 监听接收礼物消息
  onReceiveGift(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("receive_gift", callback);
    }
  }

  //主播发送红包
  sendRedPacket(packetInfo: RedPacketType): void {
    if (this.socket) {
      this.socket.emit("send_redPackage", packetInfo);
    }
  }

  //接收到主播发送的消息
  onReceiveRedPacket(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("receive_redPackage", callback);
    }
  }

  //处理红包开奖结果
  onReceiveRedResult(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("redpacket_result", callback);
    }
  }

  //发送主播的拉黑操作
  sendBannedMessage(banned_info: { banned_user: number }) {
    if (this.socket) {
      this.socket.emit("send_BanMessage", banned_info);
    }
  }

  //处理主播拉黑操作
  onReceiveBanned(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("ban_notification", callback);
    }
  }

  //通知直播间所有人有人被赶出直播间
  onReceiveBNotify(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("room_notification", callback);
    }
  }
}

export const socketService = new SocketService();
