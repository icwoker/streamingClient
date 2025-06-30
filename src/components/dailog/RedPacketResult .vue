<template>
  <div class="container">
    <div class="upper_part">
      <h2>中奖用户：李四，张三，麦克,萨迪克</h2>
    </div>
    <div class="lower_part"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.upper_part {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80%;
  color: #fee3b0;
  background-color: #f25f4d;
  border-bottom-left-radius: 50% 80px; /* 左下角弧形 */
  border-bottom-right-radius: 50% 80px; /* 右下角弧形 */
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  z-index: 1;
}
.upper_part h2 {
  padding: 0px 12px;
}
.lower_part {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background-color: #f25542;
  z-index: 0;
}
</style>
