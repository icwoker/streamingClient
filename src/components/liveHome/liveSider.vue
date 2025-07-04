<template>
  <div
    class="w-full bg-gray-900/95 h-full min-h-80vh flex flex-col border-l border-gray-700"
  >
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
        <div
          v-for="gift in props.giftRank as giftRankType[]"
          :key="gift.username"
          class="flex items-center gap-3"
        >
          <img
            :src="`${apiBaseUrl}/${gift.avatar}`"
            alt="用户头像"
            class="w-8 h-8 rounded-full"
          />
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="text-sm text-white">{{ gift.username }}</span>
              <span class="text-sm text-[#f6339a] font-bold"
                >贡献值：{{ gift.amount }}</span
              >
            </div>
            <!-- <div class="text-xs text-gray-400">贡献值: {{ gift.amount }}</div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="flex-1 overflow-y-auto" ref="chatContainer relative">
      <div class="p-3 space-y-4 max-h-[450px] overflow-y-auto">
        <div
          v-for="message in props.messages as any[]"
          :key="message.id"
          class="flex gap-2"
        >
          <!-- Adding position relative to parent for absolute positioning of menu -->
          <div class="relative">
            <img
              :src="checkAvatar(message.avatar)"
              alt="用户头像"
              class="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer"
              @click="toggleUserMenu(message, $event)"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span
                class="text-sm cursor-pointer"
                :class="message.isAdmin ? 'text-pink-500' : 'text-white'"
                @click="toggleUserMenu(message, $event)"
              >
                {{ message.username }}
              </span>
              <span
                v-if="message.badge"
                class="px-1.5 py-0.5 rounded text-xs bg-pink-500/20 text-pink-500"
              >
                {{ message.badge }}
              </span>
            </div>
            <p class="text-sm text-gray-300">{{ message.content }}</p>
          </div>
          <!-- 如果用户权限大于1，则显示拉黑按钮 -->
          <!-- User menu -->
          <div
            v-if="
              activeMenu &&
              activeMenu.id === message.id &&
              props.user_permission > 1
            "
            class="absolute bg-gray-800 rounded shadow-lg py-2 z-10"
            :style="{
              top: menuPosition.top + 'px',
              left: menuPosition.left + 'px',
            }"
          >
            <div
              class="px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
              @click="blockUser(message)"
            >
              拉黑该用户
            </div>
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
import { ref, onMounted, defineEmits, watch, onBeforeUnmount } from "vue";
import { giftRankType } from "@/API/transaction/types";
import { addUserToLiveBanner } from "@/API/liveBanner";
const emit = defineEmits(["sendMessage"]);

interface Gift {
  id: number;
  username: string;
  avatar: string;
  giftName: string;
  contribution: number;
}

interface ChatMessage {
  id: number;
  username: string;
  avatar: string;
  content: string;
  isAdmin: boolean;
  badge?: string;
}

// 状态管理
const isGiftExpanded = ref(false);
const messageInput = ref("");
const chatContainer = ref<HTMLElement | null>(null);
const props = defineProps({
  userInfo: Object,
  socketService: Object,
  messages: {
    type: Array,
    default: () => [],
  },
  giftRank: {
    type: Array,
    default: () => [],
  },
  user_permission: {
    type: Number,
    default: 0,
  },
  roomId: {
    type: String,
    default: "",
  },
});
import { apiBaseUrl } from "@/env/ApiConfig";
import { socketService } from "@/API/socket";
// 模拟数据
const gifts = ref<Gift[]>([
  {
    id: 1,
    username: "星空守护者",
    avatar: "/placeholder.svg?height=32&width=32",
    giftName: "超级火箭",
    contribution: 1000,
  },
  {
    id: 2,
    username: "梦想追逐者",
    avatar: "/placeholder.svg?height=32&width=32",
    giftName: "爱心",
    contribution: 500,
  },
  {
    id: 3,
    username: "夜色行者",
    avatar: "/placeholder.svg?height=32&width=32",
    giftName: "小星星",
    contribution: 200,
  },
]);

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

watch(
  () => props.messages,
  () => {
    setTimeout(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    }, 0);
  },
  { deep: true }
);

const emojis = ["😊", "👍", "❤️", "🎉", "666"];

// 方法
const sendMessage = () => {
  if (!messageInput.value.trim()) return;

  const newMessage: ChatMessage = {
    id: props.userInfo.user_id,
    username: props.userInfo.user_name,
    avatar: `${apiBaseUrl}/${props.userInfo.avatar_url}`,
    content: messageInput.value,
    isAdmin: false,
  };
  emit("sendMessage", newMessage);
  messageInput.value = "";

  // 滚动到底部
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }, 0);
};

const insertEmoji = (emoji: string) => {
  messageInput.value += emoji;
};

// 生命周期钩子
onMounted(() => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
});

const checkAvatar = (avatar: string) => {
  //检查有没有携带apiBaseUrl
  if (avatar.includes(apiBaseUrl)) {
    return avatar;
  } else {
    return `${apiBaseUrl}/${avatar}`;
  }
};

const activeMenu = ref(null);
const menuPosition = ref({ top: 0, left: 0 });

// Toggle user menu
const toggleUserMenu = (message: any, event: MouseEvent) => {
  event.stopPropagation(); // Prevent event bubbling

  if (activeMenu.value && activeMenu.value.id === message.id) {
    // If clicking the same user again, close the menu
    activeMenu.value = null;
  } else {
    // Open menu for this user
    activeMenu.value = message;

    // Calculate position for the menu
    menuPosition.value = {
      top: event.clientY,
      left: event.clientX,
    };
  }
};

// Block user function
const blockUser = (message: ChatMessage) => {
  // console.log('Blocking user:', message.username)
  console.log(message);
  console.log(props.user_permission);
  if (props.user_permission > 1) {
    // Here you would implement your blocking logic
    // For example: emit('blockUser', message.id)
    addUserToLiveBanner(message.id, props.roomId);
    //同时发送weboscket通知系统拉黑操作
    const banned_user = message.id;
    socketService.sendBannedMessage({ banned_user });
    // Close the menu after action
    activeMenu.value = null;
  }
};

// Close menu when clicking outside
const handleClickOutside = () => {
  activeMenu.value = null;
};

// Add event listener for closing menu when clicking outside
onMounted(() => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }

  document.addEventListener("click", handleClickOutside);
});

// Remove event listener on component unmount
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
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
