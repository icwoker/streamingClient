<template>
  <div class="register-container">
    <h2>注册</h2>
    <input type="text" placeholder="用户名" v-model="username" required />
    <input type="password" placeholder="密码" v-model="password" required />
    <input
      type="password"
      placeholder="确认密码"
      v-model="confirmPassword"
      required
    />
    <!-- 验证码 -->
    <div class="code-container">
      <img :src="imgCode" alt="验证码" @click="getCode" class="code-img" />
      <input type="text" placeholder="验证码" v-model="code" required />
    </div>
    <button @click="register">注册</button>
    <p>已有账号？<a href="#" @click="login">登录</a></p>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted } from "vue";
import { apiBaseUrl } from "@/env/ApiConfig";
import axios from "axios";
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const code = ref("");
const imgCode = ref("");
const emit = defineEmits(["login"]);
function login() {
  emit("login");
}
async function getCode() {
  const baseurl = `${apiBaseUrl}/api/captcha/generate`;
  const res = await fetch(baseurl, {
    method: "GET",
    credentials: "include", // 确保携带和保存 Cookie
  });
  const blob = await res.blob();
  const imageUrl = URL.createObjectURL(blob);
  imgCode.value = imageUrl;
}
onMounted(() => {
  getCode();
});
async function register() {
  const obj = {
    username: username.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    code: code.value,
  };
  if (username.value.length > 20 || password.value.length > 20) {
    alert("用户名或密码长度不能超过20个字符");
    return;
  }

  if (obj.password !== obj.confirmPassword) {
    alert("两次密码不一致");
    return;
  }
  const verifyCodeRes = await fetch(`${apiBaseUrl}/api/captcha/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ captcha: code.value }),
    credentials: "include", // 添加withCredentials功能
  });
  const verifyCodeResJson = await verifyCodeRes.json();
  console.log(obj);
  if (verifyCodeResJson?.success) {
    const registURL = `${apiBaseUrl}/api/auth/register`;
    const res = await fetch(registURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    const resJson = await res.json();
    console.log(resJson);
    if (resJson) {
      alert("注册成功,请切换到登录页面登录");
    }
  } else {
    alert("抱歉，验证码错误");
  }
}
</script>

<style scoped>
.register-container {
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

.register-container h2 {
  margin-bottom: 25px;
  font-size: 28px;
}

/* 表单输入框样式 */
.register-container input {
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

.register-container input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.register-container button {
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

.register-container button:hover {
  background-color: #2575fc;
}

.register-container p {
  margin-top: 20px;
}

/* 链接样式 */
.register-container a {
  color: #ff6f61;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.register-container a:hover {
  color: #2575fc;
}
.code-img {
  cursor: pointer;
  margin: 0 auto;
}
</style>
