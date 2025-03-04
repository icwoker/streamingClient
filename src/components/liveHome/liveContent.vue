<template>
    <div class="h-full bg-gray-900 text-white mt-10 rounded-t-lg">
      <!-- Stream Info Section -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-start justify-between">
          <!-- Left: Streamer Info -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <img 
                :src="`${apiBaseUrl}/${liveInfo.liver_avatar}`" 
                alt="Streamer Avatar" 
                class="w-16 h-16 rounded-full object-cover"
              />
              <div class="absolute -bottom-1 -right-1 bg-red-500 text-xs px-2 py-0.5 rounded-full">
                LIVE
              </div>
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-xl font-bold">{{ liveInfo.liver_name }}</h1>
                <button class="bg-pink-500 hover:bg-pink-600 px-4 py-1 rounded-full text-sm">
                  关注
                </button>
              </div>
                <p class="text-gray-400 mt-1">{{ liveInfo.title }}</p>
            </div>
          </div>
  
          <!-- Right: Stream Stats -->
          <div class="flex items-center gap-6 text-gray-300">
            <div class="flex items-center gap-2">
              <span class="pi pi-eye w-5 h-5" />
              <span>5642人看过</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="pi pi-thumbs-up w-5 h-5" />
              <span>2204点赞</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="pi pi-flag w-5 h-5" />
              <span>举报</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="pi pi-ellipsis-h w-5 h-5" />
              <span>更多</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Video Player Section -->
      <div class="relative aspect-video bg-black">
        <!-- Placeholder video player -->
        <video 
          class="w-full h-full object-contain"
          :poster="`${apiBaseUrl}/${liveInfo.cover_url}`"
          controls
          id="videoElement"
        >
          <source src="#" type="video/mp4">
          Your browser does not support the video tag.
        </video>
  
        <!-- Video Controls Overlay -->
        <div class=" absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div class="flex items-center gap-4">
            
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import mpegts from 'mpegts.js';
  import { ref, onMounted, defineEmits } from 'vue';
  import { useRoute } from 'vue-router';
  import { useLiveStore } from '@/store/live';
  import { useUserStore } from '@/store/user';
  import axios from '@/API/axios';
  import { apiBaseUrl } from '@/env/ApiConfig';
  
  const route = useRoute();
  const liveStore = useLiveStore();
  const userStore = useUserStore();
  const emit = defineEmits(['sendLiverId']);  

  
  interface LiveInfo {
    liver_id:string;
    cover_url: string;
    liver_avatar: string;
    liver_name: string;
    pull_url: string;
    start_time: string;
    status: string;
    tags: string;
    title: string;
  }
  
  const liveInfo = ref<LiveInfo>({
    liver_id:'',
    cover_url: '',
    liver_avatar: '',
    liver_name: '',
    pull_url: '',
    start_time: '',
    status: '',
    tags: '',
    title: '',
  });
  
  onMounted(async () => {
    try {
      const roomId = route.params.id;
      console.log(`直播的房间id:${roomId}`);
  
      const res = await axios.get(`/livehome/get_live_by_id/${roomId}`);
      const data = res.data;
      liveInfo.value = data.data as LiveInfo;
      console.log(liveInfo.value);
      emit('sendLiverId',liveInfo.value.liver_id);
      // 确保在获取到直播信息后再初始化播放器
      if (mpegts.getFeatureList().mseLivePlayback) {
        const videoElement = document.getElementById('videoElement') as HTMLMediaElement;
        if (videoElement && liveInfo.value.pull_url) {
          const player = mpegts.createPlayer({
            type: 'mse', // could also be mpegts, m2ts, flv
            isLive: true,
            url: liveInfo.value.pull_url,
          });
  
          // 绑定播放器到视频元素
          player.attachMediaElement(videoElement);
          player.load();
  
          // 监听 error 事件
          player.on(mpegts.Events.ERROR, (error: any) => {
            console.error('播放器错误:', error);
            axios.get(`/livehome/close_live/${roomId}`).then((res)=>{
              console.log(res.data);
              alert('直播已中断，请稍后重试！');
            });
          });
  
          // 开始播放
          player.play();
        }
      }
    } catch (error) {
      console.error('获取直播信息失败:', error);
    }
  });
  </script>
  
  <style scoped>
  /* Add any additional custom styles here if needed */
  </style>