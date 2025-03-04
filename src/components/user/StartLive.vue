<template>
  <div class="flex flex-col items-center bg-gray-100 min-h-screen py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">{{liveStart?'开始直播':'准备直播'}}</h1>

    <div v-if="!liveStart" class="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <!-- 直播标题 -->
      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-700">直播标题</label>
        <input
          type="text"
          id="title"
          class="mt-1 block w-full h-12 rounded-md indent-2 outline-none border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="请输入直播标题"
          v-model="liveStore.title"
        />
      </div>

      <!-- 直播封面 -->
      <div class="mb-4">
        <label for="cover" class="block text-sm font-medium text-gray-700">直播封面</label>
        <input
          type="file"
          id="cover"
          class="mt-1 block w-full"
          @change="handleCoverChange"
        />
        <!-- 图片预览 -->
        <img
          v-if="coverPreview"
          :src="coverPreview"
          alt="直播封面预览"
          class="mt-2 h-full w-full object-cover rounded-md border"
        />
      </div>

      <!-- 直播分区 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">直播分区</label>
        <div class="mt-1 space-x-4">
          <label class="inline-flex items-center" v-for="category in categories" :key="category">
            <input type="radio" class="form-radio" :name="category" :value="category" v-model="liveStore.category" />
            <span class="ml-2">{{ category }}</span>
          </label>
        </div>
      </div>

      <!-- 开始直播按钮 -->
      <button
        class="w-full bg-blue-500 hover:bg-blue-700 text-white cursor-pointer font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        @click="startLive"
        >
        开始直播
      </button>
    </div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <p>推流服务器地址: rtmp://localhost:1935/live</p>
      <p>房间码:{{ liveStore.roomId }}</p>
      <p>使用教程：打开obs->点击右下角的设置->在新出现的页面选择‘直播’->将上面的信息填入其中</p>
      <button class="w-full mt-4 bg-blue-500 hover:bg-blue-700 text-white cursor-pointer font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" @click="goLive">进入自己的直播间</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLiveStore } from '@/store/live';
import axios from '@/API/axios'

const liveStore = useLiveStore();

const categories = ref(['网游','手游','单机游戏','虚拟主播','娱乐','电台','赛事','聊天室','生活','知识','其他'])
const liveStart = ref(false);
const coverPreview = ref('')
const ImageFile = ref<File | null>(null)
const liveId = ref('');

const handleCoverChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  ImageFile.value = file
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      coverPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const startLive = () => {
  const formData = new FormData()
  formData.append('title', liveStore.title)
  formData.append('cover', ImageFile.value as File)
  formData.append('category', liveStore.category)
  console.log(formData)
    axios.post('/livehome/create_room',formData).then(res => {
    console.log(res)
    const data = res.data;
    liveStore.roomId = data.stream_key;
    liveStart.value = true;
    liveId.value = data.live_id;
  })
}

const goLive = () => {
  window.open(`http://localhost:5173/live/${liveId.value}`)
}
</script>

<style scoped></style>
