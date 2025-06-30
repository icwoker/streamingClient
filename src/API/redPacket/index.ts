import axios from "@/API/axios";

//用户点击参与发送网络请求
export const JoinRedPacket = async (redPacketId: string): Promise<number> => {
  const response = await axios.post("/livehome/join_red_packet", {
    red_packet_id: redPacketId,
  });
  if (response.status == 200) {
    return response.data;
  } else {
    console.log(response);
  }
};

//进入检查这个直播间有没有红包
export const checkRedPacket = async (live_id: string): Promise<any> => {
  const response = await axios.get(`/livehome/check_red_packet`, {
    params: {
      live_id: live_id,
    },
  });
  if (response.status == 200) {
    return response.data;
  } else {
    console.log(response);
  }
};

//检查之前是否已经有红包活动了（针对主播）
export const rpIsExpired = async (live_id: string): Promise<any> => {
  const response = await axios.get("/livehome/rp_is_expired", {
    params: {
      live_id: live_id,
    },
  });
  if (response.status == 200) {
    return response.data;
  } else {
    console.log(response);
  }
};

//获取红包中奖的名单
export const getRedPakcetResult = async (redPaketId: string): Promise<any> => {
  const response = await axios.get("/livehome/get_redpacket_result", {
    params: { red_packet_id: redPaketId },
  });
  if (response.status == 200) {
    return response.data;
  } else {
    console.log(response);
  }
};
