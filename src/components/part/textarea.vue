<template>
  <div class="textarea-container">
    <textarea
      v-model="inputValue"
      :style="{ backgroundColor: bgColor }"
      class="custom-textarea"
      @focus="handleFocus"
      @blur="handleBlur"
      :class="{ 'disabled-textarea': props.disable }"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// 定义 props
const props = defineProps({
  modelValue: {
    type: String,
    default: "在这里输入你的简介吧",
  },
  bgColor: {
    type: String,
    default: "#f0f0f0", // 默认背景颜色
  },
  disable: {
    type: Boolean,
    default: false,
  },
});

// 定义 emits
const emit = defineEmits(["update:modelValue"]);

// 双向绑定的值
const inputValue = ref(props.modelValue);

// 监听输入框内容变化
watch(inputValue, (newValue) => {
  emit("update:modelValue", newValue);
});

//绑定对props.modelValue的监听
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue;
});

// 处理聚焦事件
const handleFocus = () => {
  const textarea = document.querySelector(".custom-textarea");
  if (textarea) {
    textarea.classList.add("focus-animation");
  }
};

// 处理失焦事件
const handleBlur = () => {
  const textarea = document.querySelector(".custom-textarea");
  if (textarea) {
    textarea.classList.remove("focus-animation");
  }
};
</script>

<style scoped>
.textarea-container {
  width: 100%;
}

.custom-textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 8px;
  resize: none; /* 禁止拉伸 */
  outline: none; /* 去掉默认的聚焦边框 */
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
}

.custom-textarea.focus-animation {
  border-color: #5799ff; /* 聚焦时边框颜色 */
  box-shadow: 0 0 8px rgba(81, 38, 167, 0.5); /* 聚焦时阴影效果 */
}
.disabled-textarea {
  background-color: #f0f0f0;
  color: #a0a0a0;
  pointer-events: none;
  user-select: none;
  cursor: not-allowed;
  border: 1px solid #ccc;
}
</style>
