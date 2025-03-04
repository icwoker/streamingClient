<template>
  <div class="flex justify-center flex-col gap-8">
    <div class="flex flex-wrap">
    <userShow v-for="i in 10" ></userShow>
  </div>
  <Pagination :total="100" :per-page="10" :max-visible-buttons="5" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import userShow from '../part/userShow.vue';
import Pagination from '@/components/part/Pagination.vue'
</script>

<style scoped></style>
