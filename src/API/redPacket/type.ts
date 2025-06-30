export interface RedPacketType {
  title: string;
  amount: number;
  winnerNum: number;
  expireTime: number;
}

export interface RedPacketViewType {
  id: string;
  anchorId: string;
  liveId: string;
  title: string;
  amount: number;
  winnerNum: number;
  expireTime: string;
  has_join: boolean;
}
