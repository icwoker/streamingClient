<template>
    <div class="blacklist-container">
        <div class="header">
            <h1>小黑屋</h1>
        </div>
        
        <!-- 用户列表 -->
        <div v-if="bannedUsers.length > 0" class="user-list">
            <div v-for="user in bannedUsers" :key="user.id" class="user-card">
                <div class="card-content">
                    <img :src="`${apiBaseUrl}/${user.avatar_url}`" alt="用户头像" class="avatar" />
                    <div class="user-info">
                        <h3>{{ user.name }}</h3>
                        <p class="bio">{{ user.bio }}</p>
                        <p class="ban-time"><span>拉黑时间：</span>{{ user.ban_time }}</p>
                    </div>
                    <button @click="unbanUser(user.id)" class="unban-button">
                        <span>取消拉黑</span>
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无被拉黑的用户</p>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="totalPages > 1">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="pagination-button prev">
                &lt; 上一页
            </button>
            <div class="page-indicator">
                <span>{{ currentPage }}</span> / {{ totalPages }}
            </div>
            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)" class="pagination-button next">
                下一页 &gt;
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { removeUserFromLiveBanner, getLiveBannerList } from '@/API/liveBanner'
import { LiveBannerData, LiveBannerType } from '@/API/liveBanner/types'
import { apiBaseUrl } from '@/env/ApiConfig'

// 数据状态
const bannedUsers = ref<LiveBannerType[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

// 获取小黑屋用户列表
const fetchBannedUsers = async () => {
    try {
        const response: LiveBannerData = await getLiveBannerList(currentPage.value, perPage)
        bannedUsers.value = response.banned_users
        totalPages.value = response.pages
    } catch (error) {
        console.error('获取小黑屋用户列表失败：', error)
    }
}

// 取消拉黑用户
const unbanUser = async (userId: number) => {
    try {
        await removeUserFromLiveBanner(userId)
        // 使用更友好的通知方式，可以根据实际UI框架替换
        showSuccessMessage('用户已移出小黑屋')
        fetchBannedUsers() // 刷新列表
    } catch (error) {
        console.error('取消拉黑用户失败：', error)
        showErrorMessage('取消拉黑失败，请稍后重试')
    }
}

// 简单的消息显示方法（实际项目中可以替换为UI组件库的消息提示）
const showSuccessMessage = (message: string) => {
    alert(message)
}

const showErrorMessage = (message: string) => {
    alert(message)
}

// 切换分页
const changePage = (page: number) => {
    currentPage.value = page
    fetchBannedUsers()
}

// 页面加载时获取用户列表
onMounted(() => {
    fetchBannedUsers()
})
</script>

<style scoped>
.blacklist-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
}

.header {
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(43, 127, 255, 0.1);
    padding-bottom: 16px;
}

.header h1 {
    color: #2b7fff;
    font-size: 28px;
    font-weight: 600;
    margin: 0;
}

.user-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.user-card {
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(43, 127, 255, 0.1);
    transition: all 0.3s ease;
}

.user-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(43, 127, 255, 0.2);
}

.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #fff;
    box-shadow: 0 4px 12px rgba(43, 127, 255, 0.15);
    margin-bottom: 16px;
    transition: transform 0.3s ease;
}

.user-card:hover .avatar {
    transform: scale(1.05);
}

.user-info {
    text-align: center;
    width: 100%;
}

.user-info h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
}

.user-info .bio {
    font-size: 14px;
    color: #666;
    margin: 0 0 12px 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-info .ban-time {
    font-size: 13px;
    color: #888;
    margin: 0 0 16px 0;
}

.user-info .ban-time span {
    color: #2b7fff;
    font-weight: 500;
}

.unban-button {
    background-color: #2b7fff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 12px rgba(43, 127, 255, 0.2);
}

.unban-button:hover {
    background-color: #1a6ae8;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(43, 127, 255, 0.3);
}

.unban-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(43, 127, 255, 0.25);
}

.empty-state {
    text-align: center;
    padding: 60px 0;
    color: #888;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    gap: 16px;
}

.pagination-button {
    background-color: #fff;
    color: #2b7fff;
    border: 1px solid #2b7fff;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
    background-color: #2b7fff;
    color: white;
}

.pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #ccc;
    color: #ccc;
}

.page-indicator {
    font-size: 14px;
    color: #666;
}

.page-indicator span {
    font-weight: 600;
    color: #2b7fff;
    font-size: 16px;
}

@media (max-width: 768px) {
    .user-list {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }
}
</style>