<template>
    <div class="w-full bg-gray-900/95 h-full  min-h-80vh flex flex-col border-l border-gray-700">
      <!-- 礼物展示区域 -->
      <div 
        class="transition-all duration-300 overflow-hidden border-b border-gray-700"
        :class="isGiftExpanded ? 'h-64' : 'h-20'"
        @mouseenter="isGiftExpanded = true"
        @mouseleave="isGiftExpanded = false"
      >
        <div class="p-3 flex items-center justify-between text-gray-300">
          <h3 class="font-semibold">礼物榜</h3>
          <span
            class="pi pi-chevron-down w-4 h-4 transition-transform"
            :class="isGiftExpanded ? 'rotate-180' : ''"
          />
        </div>
        <div class="px-3 pb-3 space-y-3">
          <div v-for="gift in gifts" :key="gift.id" class="flex items-center gap-3">
            <img :src="gift.avatar" alt="用户头像" class="w-8 h-8 rounded-full" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm text-white">{{ gift.username }}</span>
                <span class="text-xs text-pink-500">{{ gift.giftName }}</span>
              </div>
              <div class="text-xs text-gray-400">贡献值: {{ gift.contribution }}</div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 聊天消息区域 -->
      <div class="flex-1 overflow-y-auto" ref="chatContainer">
        <div class="p-3 space-y-4 max-h-[450px] overflow-y-auto">
          <div v-for="message in props.messages as any[]" :key="message.id" class="flex gap-2">
            <img :src="checkAvatar(message.avatar)" alt="用户头像" class="w-8 h-8 rounded-full flex-shrink-0" />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm" :class="message.isAdmin ? 'text-pink-500' : 'text-white'">
                  {{ message.username }}
                </span>
                <span v-if="message.badge" 
                  class="px-1.5 py-0.5 rounded text-xs bg-pink-500/20 text-pink-500">
                  {{ message.badge }}
                </span>
              </div>
              <p class="text-sm text-gray-300">{{ message.content }}</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 输入框区域 -->
      <div class="p-3 border-t border-gray-700">
        <div class="flex gap-2 mb-2">
          <button 
            v-for="emoji in emojis" 
            :key="emoji"
            @click="insertEmoji(emoji)"
            class="text-gray-400 hover:text-white transition-colors"
          >
            {{ emoji }}
          </button>
        </div>
        <div class="flex gap-2">
          <input
            v-model="messageInput"
            type="text"
            placeholder="发送弹幕..."
            class="flex-1 bg-gray-800 rounded px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-pink-500"
            @keyup.enter="sendMessage"
          />
          <button 
            @click="sendMessage"
            class="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded text-sm text-white transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted,defineEmits,watch } from 'vue'
  const emit = defineEmits(['sendMessage'])

  interface Gift {
    id: number
    username: string
    avatar: string
    giftName: string
    contribution: number
  }
  
  interface ChatMessage {
    id: number
    username: string
    avatar: string
    content: string
    isAdmin: boolean
    badge?: string
  }
  
  // 状态管理
  const isGiftExpanded = ref(false)
  const messageInput = ref('')
  const chatContainer = ref<HTMLElement | null>(null)
  const props = defineProps({
    userInfo:Object,
    socketService:Object,
    messages:{
      type:Array,
      default:()=>[]
    }
  })
  import { apiBaseUrl } from '@/env/ApiConfig'
import { socketService } from '@/API/socket'
  // 模拟数据
  const gifts = ref<Gift[]>([
    {
      id: 1,
      username: "星空守护者",
      avatar: "/placeholder.svg?height=32&width=32",
      giftName: "超级火箭",
      contribution: 1000
    },
    {
      id: 2,
      username: "梦想追逐者",
      avatar: "/placeholder.svg?height=32&width=32",
      giftName: "爱心",
      contribution: 500
    },
    {
      id: 3,
      username: "夜色行者",
      avatar: "/placeholder.svg?height=32&width=32",
      giftName: "小星星",
      contribution: 200
    }
  ])
  
  // const messages = ref<ChatMessage[]>([
  //   {
  //     id: 1,
  //     username: "房管小明",
  //     avatar: "/placeholder.svg?height=32&width=32",
  //     content: "欢迎来到直播间！",
  //     isAdmin: true,
  //     badge: "房管"
  //   },
  //   {
  //     id: 2,
  //     username: "用户A",
  //     avatar: "/placeholder.svg?height=32&width=32",
  //     content: "主播好厉害！",
  //     isAdmin: false
  //   },
  //   {
  //     id: 3,
  //     username: "用户B",
  //     avatar: "/placeholder.svg?height=32&width=32",
  //     content: "666666",
  //     isAdmin: false
  //   }
  // ])
  
watch(()=>props.messages,()=>{
  setTimeout(()=>{
    if(chatContainer.value){
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  },0)
},{deep:true})

  const emojis = ['😊', '👍', '❤️', '🎉', '666']
  
  // 方法
  const sendMessage = () => {
    if (!messageInput.value.trim()) return
    
    const newMessage: ChatMessage = {
      id: props.userInfo.user_id,
      username: props.userInfo.user_name,
      avatar: `${apiBaseUrl}/${props.userInfo.avatar_url}`,
      content: messageInput.value,
      isAdmin: false
    }
    emit('sendMessage',newMessage)
    messageInput.value = ''
    
    // 滚动到底部
    setTimeout(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    }, 0)
  }
  
  const insertEmoji = (emoji: string) => {
    messageInput.value += emoji
  }
  
  // 生命周期钩子
  onMounted(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })

  const checkAvatar = (avatar:string)=>{
    //检查有没有携带apiBaseUrl
    if(avatar.includes(apiBaseUrl)){
      return avatar
    }else{
      return `${apiBaseUrl}/${avatar}`
    }
  }
 
  </script>
  
  <style scoped>
  /* 自定义滚动条样式 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  </style>