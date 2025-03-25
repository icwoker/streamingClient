<template>
  <div>
    <Nav />
  </div>
  <div class="home">
    <div class="stream-grid">
      <StreamCard v-for="stream in show_streams" :key="stream.id" :stream="stream" @click="handleStreamClick(stream.id)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted,watch } from 'vue';
import StreamCard from '@/components/part/StreamCard.vue';
import Nav from '@/components/nav/nav.vue';
import { useUserStore } from '@/store/user';
import axios from '@/API/axios';
import { apiBaseUrl } from '@/env/ApiConfig';
import { useRouter,useRoute } from 'vue-router';
import { all } from 'axios';

const router = useRouter();
const route = useRoute();
// 示例直播数据
const streams = ref([
]);
const show_streams = ref([]);

interface live {
  id: string,
  streamer: string,
  tags: string,
  thumbnail: string,
  title: string,
}
const userStore = useUserStore();
const urlToTag = (tag:string)=>{
  const tags= {
    'online':'网游',
    'mobile':'手游',
    'single':'单机游戏',
    'virtual':'虚拟主播',
    'entertainment':'娱乐',
    'radio':'电台',
    'match':'赛事',
    'chat':'聊天室',
    'life':'生活',
    'knowledge':'知识',
    'more':'更多',
  }
  return tags[tag] || null;
}
onMounted(async () => {
  //获取用户信息
  const response = await axios.get('/auth/me');
  const userInfo = response.data;
  userStore.setUserId(userInfo.user_id);
  userStore.setUsername(userInfo.user_name);
  userStore.setAvatar(userInfo.avatar_url);
  console.log(userStore.getAvatar());
  //获取直播列表
  const lives_response = await axios.get('/livehome/get_live_list');
  const lives = lives_response.data;
  console.log(lives);
  lives.data.forEach((live: live) => {
    streams.value.push({
      id: live.id,
      title: live.title,
      tags: live.tags,
      thumbnail: `${apiBaseUrl}/${live.thumbnail}`,
      streamer: live.streamer
    })
  })
  // console.log(streams.value);
  show_streams.value = streams.value;
})
const handleStreamClick = (id: string) => {
  router.push(`/live/${id}`);
}

watch(()=>route.query.tag,(newTag)=>{
  console.log(newTag);
  if(newTag){
   const tag = urlToTag(newTag as string);
   if(tag){
     show_streams.value = streams.value.filter((stream: live) => stream.tags.includes(tag));
   }
  }else{
    show_streams.value = streams.value;
   }
})

</script>

<style scoped>
.home {
  padding: 20px;
}

.stream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.trigger-button {

  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.trigger-button:hover {
  background-color: #45a049;
}

.trigger-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>