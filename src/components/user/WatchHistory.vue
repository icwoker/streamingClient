<template>
  <div class="p-4">
    <div class="text-lg font-bold mb-4">2025年2月8日</div>
    <div class="flex  gap-4 flex-wrap">
      <div v-for="(stream, index) in streams" :key="index" class="flex items-center mb-4">
      <img :src="stream.avatar" alt="主播头像" class="w-12 h-12 rounded-full mr-4">
      <div>
        <div class="font-semibold">{{ stream.name }}</div>
        <div class="text-sm text-gray-600">{{ stream.title }}</div>
        <div class="text-sm text-gray-500">{{ stream.type }}</div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stream {
  avatar: string;
  name: string;
  title: string;
  type: string;
}

const streams: Stream[] = [
  {
      avatar: 'https://huyaimg.msstatic.com/avatar/1061/88/cf28d56553add73e202b71bdb61991_180_135.jpg?1689109985',
    name: 'Karsamzing苏弟',
    title: 'VCT 亚太 败决 GENG-T1',
    type: '无畏契约'
  },
  {
    avatar: 'https://huyaimg.msstatic.com/avatar/1032/48/ee64ceeeff354e0e7b8e2d69bde43b_180_135.jpg?1720862483',
    name: '狂鸟-无双66',
    title: '世界领主全职业最高伤害80亿',
    type: 'DNF手游'
  },
  {
    avatar: 'https://huyaimg.msstatic.com/avatar/1018/62/554ba02614d6d2fd35ec01b0beecd1_180_135.jpg?1736434349',
    name: 'HY-001',
    title: '欢迎来盘，虎牙第一嘴硬密码UP',
    type: '星秀'
  }
];
</script>