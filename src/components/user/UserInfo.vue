<template>
  <div class="h-full text-right">
    <!-- 上层 -->
    <div class="w-full h-1/2 flex">
      <div class="flex items-center flex-col justify-center gap-y-2">
        <div
          v-if="!changeAble"
          class="size-32 bg-amber-600 rounded-full overflow-hidden"
        >
          <img :src="avatar" alt="" class="w-full h-full" />
        </div>
        <span v-if="!changeAble" class="font-bold">{{ userName }}</span>
        <!-- 文件上传输入框 -->
        <label
          v-if="changeAble"
          for="avatar-upload"
          class="block w-full p-4 bg-gray-100 rounded-lg border border-gray-300 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors duration-300"
          >
          请上传新的头像
        </label>
        <input id="avatar-upload" type="file" name="avatar" class="hidden" @change="handleAvatarChange" />

        <!-- 文本输入框 -->
        <input
          v-if="changeAble"
          type="text"
          v-model="userName"
          placeholder="请输入用户名"
          class="mt-4 w-full p-4 bg-gray-100 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        />
      </div>
      <div class="flex-1 text-center"><InfoShow  /></div>
    </div>
    <div class="w-full flex">
      <Textarea :disable="!changeAble" :modelValue="bio" @update:modelValue="handleBioChange" />
    </div>
    <button
      class="common-button button-change"
      @click="handleChange"
      v-if="!changeAble"
    >
      修改个人信息
    </button>
    <!-- 取消按钮 -->
    <button
      v-if="changeAble"
      class="common-button button-cancel"
      @click="handleCancel"
    >
      取消修改
    </button>

    <!-- 确认按钮 -->
    <button
      v-if="changeAble"
      class="common-button button-save"
      @click="handleSave"
    >
      确认修改
    </button>
  </div>
</template>

<script setup lang="ts">
import Textarea from "@/components/part/textarea.vue";
import InfoShow from "@/components/part/infoshow.vue";
import axios from "@/API/axios";
import { apiBaseUrl } from "@/env/ApiConfig";
import { useUserStore } from "@/store/user";
const userStore = useUserStore();
import { ref, onMounted } from "vue";
const value = ref("");
const changeAble = ref(false);
const userName = ref("孤夜岛");
const avatar = ref("");
const bio = ref("12");

let old_info = ref({
  userName:"",
  bio:""
});
onMounted(async () => {
  try{
    const response = await axios.get('/auth/me');
    const userInfo = response.data;
    userName.value = userInfo.user_name;
    avatar.value = `${apiBaseUrl}/${userInfo.avatar_url}`;  
    bio.value = userInfo.bio;
    const balance = await axios.get('/transaction/balance')
    userStore.setBalance(balance.data.balance);
    userStore.setUserId(userInfo.user_id);
    userStore.setUsername(userInfo.user_name);
    userStore.setAvatar(userInfo.avatar_url);
  }catch(error){
    console.log("获取用户信息失败",error);    
  }
  
})

const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    axios.post('/auth/upload_avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      console.log(response);
      const img_url = `${apiBaseUrl}/${response.data.avatar_url}` 
      avatar.value = img_url;
    }).catch(error => {
      console.log("上传头像失败", error);
    })
  }
};
const handleChange = () =>{
  old_info.value.userName = userName.value;
  old_info.value.bio = bio.value;
  changeAble.value = true;

  console.log(old_info.value);
}
const handleCancel = () =>{
  userName.value = old_info.value.userName;
  bio.value = old_info.value.bio;
  changeAble.value = false;
}
const handleBioChange = (value:string)=>{
  bio.value = value;
}
const handleSave = () =>{
  const new_info = {
    username:userName.value,  // 修改 user_name 为 username 以匹配后端
    bio:bio.value
  }
  
  if(!new_info.username || !new_info.bio) {
    console.log("用户名和简介不能为空");
    return;
  }

  axios.post('/auth/change_me_info',new_info).then(response=>{    
    console.log(response);
    changeAble.value = false;
  }).catch(error=>{
    if(error.response?.status === 401) {
      console.log("未登录或登录已过期");
    } else {
      console.log("修改个人信息失败",error);
    }
  })
}
</script>

<style scoped>
/* 定义单独的样式 */
.button-change {
  background-color: #3b82f6; /* 蓝色 */
}
.button-cancel {
  background-color: #ef4444; /* 红色 */
}
.button-save {
  background-color: #10b981; /* 绿色 */
}

/* 鼠标悬停效果 */
.button-change:hover {
  background-color: #2563eb;
}
.button-cancel:hover {
  background-color: #dc2626;
}
.button-save:hover {
  background-color: #059669;
}

.input_style {
  background-color: #f0f0f0;
  height: 22px;
}
</style>
