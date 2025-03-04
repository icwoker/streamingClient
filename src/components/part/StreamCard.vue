<template>
    <div class="stream-card">
      <img :src="stream.thumbnail" alt="直播缩略图" class="thumbnail" />
      <div class="stream-info">
        <h3>{{ stream.title }}</h3>
        <p>{{ stream.streamer }}</p>
        <span class="viewer-count">{{ stream.tags }}</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue';
  
  const props = defineProps({
    stream: {
      type: Object,
      required: true
    }
  });
  </script>
  
  <style scoped>
  .stream-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.3s;
    cursor: pointer;
  }
  
  .stream-card:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }
  
  .thumbnail {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
  
  .stream-info {
    padding: 10px;
  }
  
  .stream-info h3 {
    margin: 0;
    font-size: 1.2em;
    color: #333;
  }
  
  .stream-info p {
    margin: 5px 0;
    color: #777;
  }
  
  .viewer-count {
    display: inline-block;
    padding: 2px 6px;
    background-color: #f1f1f1;
    border-radius: 4px;
    font-size: 0.9em;
    color: #555;
  }
  </style>