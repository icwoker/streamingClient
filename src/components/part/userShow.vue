<template>
    <div class="flex items-center gap-6 mt-8">
        <div class="w-24 h-24 rounded-full overflow-hidden">
            <img src="@/assets/default.jpg" alt="" class="w-full h-full object-cover">
        </div>
        <div class="flex flex-col gap-2">
            <p class="text-lg font-medium text-[#18191c] hover:text-[#15b5ee] cursor-pointer">用户名</p>
            <p class="max-w-64 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#61666d]">超长简介111111111111111111111111111111111111111111111111111111</p>
            <button class="px-6 py-2 bg-[#f6f7f8] hover:bg-[#e8e9ea] rounded-lg transition-colors max-w-32">
                <span class="font-medium text-center">关注</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>