<template>
  <div class="container">
    <div class="upper_part">
      <h2 class="title">{{ title }}</h2>
      <div class="info-group">
        <p class="info-item">
          金额: <span class="highlight">{{ amount }}</span>
        </p>
        <p class="info-item">
          中奖人数: <span class="highlight">{{ winnerCount }}人</span>
        </p>
        <p class="info-item">
          倒计时: <span class="countdown">{{ formattedCountdown }}</span>
        </p>
      </div>
      <div class="button" @click="handleClick" v-if="!hasParticipated">開</div>
      <div class="participated-message" v-else>
        <p>{{ showContent }}</p>
      </div>
    </div>
    <div class="lower_part"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineEmits } from "vue";
import {
  JoinRedPacket,
  checkRedPacket,
  rpIsExpired,
  getRedPakcetResult,
} from "@/API/redPacket";
// 配置项
const props = defineProps({
  endTime: {
    // 开奖结束时间(时间戳或Date对象)
    type: [Number, Date, String],
    required: true,
  },
  amount: {
    type: Number,
    default: 120,
  },
  winnerCount: {
    type: Number,
    default: 3,
  },
  title: {
    type: String,
    default: "默认标题",
  },
  joinStatus: {
    type: Boolean,
    default: false,
  },
  redPacketId: {
    type: String,
    default: "",
  },
  winnerContent: {
    type: String,
    deafult: "",
  },
});

const emit = defineEmits(["sendJoinSuccess"]);

const hasParticipated = ref(props.joinStatus);
const remainingTime = ref(0); // 剩余时间(秒)
let countdownTimer: number | null = null;
const showContent = computed(() => {
  if (props.winnerContent.length > 1) {
    return `中奖名单:${props.winnerContent}`;
  } else {
    return "你已经参与啦，请静候开奖结果\(≧▽≦)/";
  }
});

// 格式化倒计时显示
const formattedCountdown = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
});

// 计算剩余时间
const updateRemainingTime = async () => {
  const now = Date.now();
  let end = null;
  if (typeof props.endTime == "string") {
    end = new Date(props.endTime);
  } else {
    end =
      props.endTime instanceof Date ? props.endTime.getTime() : props.endTime;
  }
  console.log("---" + props.endTime);
  remainingTime.value = Math.max(0, Math.floor((end - now) / 1000));

  // 如果时间到了，清除定时器
  if (remainingTime.value <= 0 && countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

// 开始倒计时
const startCountdown = () => {
  updateRemainingTime(); // 立即更新一次
  if (!countdownTimer && remainingTime.value > 0) {
    countdownTimer = setInterval(() => {
      remainingTime.value -= 1;
      if (remainingTime.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }, 1000);
  }
};

// 处理点击参与
const handleClick = async () => {
  hasParticipated.value = true;
  // 这里可以添加实际参与逻辑，比如API调用等
  // console.log("1212" + props.redPacketId);
  const response = await JoinRedPacket(props.redPacketId);
  console.log(response);
  if (response) {
    emit("sendJoinSuccess");
  }
};

// 组件挂载时启动倒计时
onMounted(() => {
  startCountdown();
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});
</script>

<style scoped>
/* 容器 */
.container {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif; /* 使用更美观的字体 */
}

/* 上部分背景 */
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
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
  box-sizing: border-box;
}

/* 标题样式 */
.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px; /* 字间距 */
}

/* 信息组样式 */
.info-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

/* 信息项样式 */
.info-item {
  font-size: 18px;
  margin: 0;
  letter-spacing: 1px;
}

/* 高亮文字 */
.highlight {
  font-weight: bold;
  color: #fff;
  font-size: 20px;
}

/* 倒计时特殊样式 */
.countdown {
  font-family: "Courier New", monospace; /* 等宽字体更适合计时器 */
  font-weight: bold;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 下部分背景 */
.lower_part {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background-color: #f25542;
  z-index: 0;
}

/* 圆形按钮 */
.button {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%; /* 圆形 */
  background-color: #ebcd99; /* 金色背景 */
  bottom: 0%;
  margin-bottom: -50px;
  left: 50%;
  margin-left: -50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: bold;
  color: #f25f4d; /* 使用主题色作为按钮文字颜色 */
  cursor: pointer; /* 鼠标指针样式 */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 -3px 6px rgba(0, 0, 0, 0.1); /* 添加内阴影增加立体感 */
  z-index: 1;
}

/* 鼠标悬停效果 */
.button:hover {
  transform: scale(1.1); /* 放大效果 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.2);
}

/* 添加参与后的消息样式 */
.participated-message {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fee3b0;
  font-size: 16px;
  padding: 0 20px;
  box-sizing: border-box;
}

.participated-message p {
  margin: 0;
  line-height: 1.5;
}
</style>
