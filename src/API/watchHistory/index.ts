import axios from "@/API/axios";

interface paramsType{
    page:number,
    page_size:number
}

//获取用户的观看记录,分页
export const getWatchHistory = (params:paramsType)=>{
    console.log("触发了,你收到了吗?")
    return axios.get('/watchHistory/history',{params})
}

//删除特定的观看记录
export const deleteWatchHistory = (histroy_id:string)=>{
    return axios.delete(`/watchHistory/history/${histroy_id}`)
}

//删除所有的观看记录
export const deleteAllWatchHistory = ()=>{
    return axios.post('/watchHistory/history/clear')
}
