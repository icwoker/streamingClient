import { defineStore } from "pinia";

export const useLiveStore = defineStore('live',{
    state:() => ({
        roomId:'',
        title: '', // 直播间标题
        coverPath: '', // 直播间封面路径
        category: '' // 直播间分区
    })
})