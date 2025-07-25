import { LiveBannerData, LiveBannerType } from "./types";
import axios from "@/API/axios";

//获取自己的直播间id
export const GetHoomIdByMine = async () => {
  const response = await axios.get("/livehome/get_live_id_by_mine");
  return response.data;
};

//主播将用户加入小黑屋
export const addUserToLiveBanner = async (userId: number, room_id: string) => {
  const response = await axios.post("/liveBanned/create", {
    user_id: userId,
    room_id: room_id,
  });
  return response.data;
};

//主播将用户移出小黑屋
export const removeUserFromLiveBanner = async (userId: number) => {
  const response = await axios.post("/liveBanned/delete", {
    user_id: userId,
  });
  return response.data;
};

//获取小黑屋用户列表
export const getLiveBannerList = async (page: number, per_page: number) => {
  const response = await axios.get("/liveBanned/list", {
    params: {
      page,
      per_page,
    },
  });
  return response.data;
};

//判断用户是不是在黑名单中
export const isUserInLiveBanner = async (userId: number) => {
  const response = await axios.get("/liveBanned/check", {
    params: {
      user_id: userId,
    },
  });
  return response.data;
};
