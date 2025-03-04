<template>
  <div class="login-container">
    <h2>登录</h2>

    <input type="text" placeholder="用户名" v-model="username" />
    <input type="password" placeholder="密码" v-model="password" />
    <button type="submit" @click="NewLogin">登录</button>
    <p>没有账号？<a href="#" @click="register">注册</a></p>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加登录逻辑
import { ref, defineEmits } from "vue";
import { apiBaseUrl } from "@/env/ApiConfig";
import axios from "@/API/axios";
import { useRouter } from "vue-router";

const router = useRouter();

const emit = defineEmits(["register"]);
function register() {
  emit("register");
}
const username = ref("");
const password = ref("");
async function login() {
  console.log(username.value, password.value);

  const loginURL = `${apiBaseUrl}/api/auth/login`;
  const res = await fetch(loginURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value,
    }),
  });
  const resJson = await res.json();
  console.log(resJson);
}

async function NewLogin(){
  try{
    const res_1 = await axios.post('/auth/login',{
      username:username.value,
      password:password.value,
    });
    const reJson = res_1.data;
    console.log(reJson);
    router.push("/userinfo");
  } catch (error) {
    console.log("登录失败了",error);
  }
}
</script>

<style scoped>
/* 登录框容器 */
.login-container {
  position: relative;
  width: 350px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-align: center;
  color: black;
}

.login-container h2 {
  margin-bottom: 25px;
  font-size: 28px;
}

/* 表单输入框样式 */
.login-container input {
  width: calc(100% - 24px);
  padding: 12px;
  margin: 15px 0;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.login-container input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.login-container button {
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background-color: #6a11cb;
  border: none;
  border-radius: 5px;
  color: black;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-container button:hover {
  background-color: #2575fc;
}

.login-container p {
  margin-top: 20px;
}

/* 链接样式 */
.login-container a {
  color: #ff6f61;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.login-container a:hover {
  color: #2575fc;
}
</style>
