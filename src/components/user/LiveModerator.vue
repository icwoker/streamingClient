<template>
    <div class="moderator-container">
      <div class="moderator-header">
        <h2 class="moderator-title">房管列表</h2>
        <div class="moderator-stats">总计: {{ moderatorList.total }} 名房管</div>
      </div>
  
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
  
      <div v-else-if="moderatorList.moderators && moderatorList.moderators.length > 0" class="moderator-list">
        <div v-for="moderator in moderatorList.moderators" :key="moderator.id" class="moderator-card">
          <div class="moderator-avatar">
            <img :src="`${apiBaseUrl}/${moderator.avatar_url}`" alt="用户头像">
          </div>
          <div class="moderator-info">
            <div class="moderator-name">{{ moderator.name }}</div>
            <div class="moderator-date">
              <span>授权时间: {{ formatDate(moderator.created_at) }}</span>
            </div>
          </div>
          <div class="moderator-actions">
            <button class="delete-btn" @click="confirmDelete(moderator)">
              <i class="delete-icon"></i>
              取消授权
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-list">
        <div class="empty-icon">👥</div>
        <p>暂无房管</p>
      </div>
  
      <!-- 分页组件 -->
      <div class="pagination-container" v-if="moderatorList.pages > 1">
        <button 
          class="pagination-btn" 
          :class="{ disabled: currentPage === 1 }"
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        
        <div class="pagination-info">{{ currentPage }} / {{ moderatorList.pages }}</div>
        
        <button 
          class="pagination-btn" 
          :class="{ disabled: currentPage === moderatorList.pages }"
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === moderatorList.pages"
        >
          下一页
        </button>
      </div>
  
      <!-- 确认删除模态框 -->
      <div class="modal-backdrop" v-if="showDeleteModal" @click="showDeleteModal = false"></div>
      <div class="modal" v-if="showDeleteModal">
        <div class="modal-content">
          <h3>确认取消授权</h3>
          <p>您确定要取消 <strong>{{ selectedModerator?.name }}</strong> 的房管权限吗？</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showDeleteModal = false">取消</button>
            <button class="confirm-btn" @click="handleDelete" :disabled="isDeleting">
              {{ isDeleting ? '处理中...' : '确认' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { getLiveModeratorList, deleteLiveModerator } from '@/API/liveModerator';
  import { LiveModeratorListType, LiveModeratorType } from '@/API/liveModerator/types';
  import { apiBaseUrl } from '@/env/ApiConfig';
  
  // 状态变量
  const moderatorList = ref<LiveModeratorListType>({
    message: '',
    moderators: [],
    total: 0,
    pages: 0,
    current_page: 1
  });
  const loading = ref(true);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const showDeleteModal = ref(false);
  const selectedModerator = ref<LiveModeratorType | null>(null);
  const isDeleting = ref(false);
  
  // 获取房管列表
  const fetchModeratorList = async () => {
    loading.value = true;
    try {
      const response = await getLiveModeratorList(currentPage.value, pageSize.value);
      moderatorList.value = response.data;
    } catch (error) {
      console.error('获取房管列表失败:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // 分页切换
  const changePage = (page: number) => {
    if (page < 1 || page > moderatorList.value.pages) return;
    currentPage.value = page;
    fetchModeratorList();
  };
  
  // 确认删除房管
  const confirmDelete = (moderator: LiveModeratorType) => {
    selectedModerator.value = moderator;
    showDeleteModal.value = true;
  };
  
  // 执行删除操作
  const handleDelete = async () => {
    if (!selectedModerator.value) return;
    
    isDeleting.value = true;
    try {
      await deleteLiveModerator(selectedModerator.value.user_id);
      showDeleteModal.value = false;
      // 重新获取列表数据
      fetchModeratorList();
    } catch (error) {
      console.error('删除房管失败:', error);
    } finally {
      isDeleting.value = false;
    }
  };
  
  // 页面加载时获取房管列表
  onMounted(() => {
    fetchModeratorList();
  });
  </script>
  
  <style scoped>
  .moderator-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 24px;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .moderator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 16px;
  }
  
  .moderator-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  
  .moderator-stats {
    color: #666;
    font-size: 14px;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(43, 127, 255, 0.2);
    border-radius: 50%;
    border-top-color: #2b7fff;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .moderator-list {
    display: grid;
    grid-gap: 16px;
  }
  
  .moderator-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #eaeaea;
    transition: all 0.3s ease;
  }
  
  .moderator-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  .moderator-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;
    border: 2px solid #2b7fff;
  }
  
  .moderator-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .moderator-info {
    flex-grow: 1;
  }
  
  .moderator-name {
    font-weight: 600;
    font-size: 16px;
    color: #333;
    margin-bottom: 4px;
  }
  
  .moderator-date {
    font-size: 13px;
    color: #777;
  }
  
  .moderator-actions {
    margin-left: auto;
  }
  
  .delete-btn {
    background-color: #fff;
    color: #ff4d4f;
    border: 1px solid #ff4d4f;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
  }
  
  .delete-btn:hover {
    background-color: #fff1f0;
  }
  
  .delete-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff4d4f'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
    background-size: contain;
    margin-right: 4px;
  }
  
  .empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
    color: #999;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
  }
  
  .pagination-btn {
    background-color: #fff;
    color: #2b7fff;
    border: 1px solid #2b7fff;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .pagination-btn:hover:not(.disabled) {
    background-color: #2b7fff;
    color: #fff;
  }
  
  .pagination-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-info {
    margin: 0 16px;
    font-size: 14px;
    color: #666;
  }
  
  /* 模态框样式 */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 8px;
    z-index: 1000;
    width: 360px;
  }
  
  .modal-content {
    padding: 24px;
  }
  
  .modal-content h3 {
    margin-top: 0;
    color: #333;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
  
  .cancel-btn, .confirm-btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .cancel-btn {
    background-color: #f0f0f0;
    color: #666;
    margin-right: 8px;
  }
  
  .cancel-btn:hover {
    background-color: #e0e0e0;
  }
  
  .confirm-btn {
    background-color: #2b7fff;
    color: #fff;
  }
  
  .confirm-btn:hover:not(:disabled) {
    background-color: #1a6eee;
  }
  
  .confirm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  </style>