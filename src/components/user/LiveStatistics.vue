<template>
    <Nav/>
    <div class="statistics-container">
      <div class="header">
        <h2>直播数据统计</h2>
      </div>
  
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-value">{{ formatNumber(liveStats.peak_viewers) }}</div>
          <div class="stat-label">最高同时观看人数</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ formatNumber(liveStats.total_viewers) }}</div>
          <div class="stat-label">总观看人数</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatDuration(liveStats.total_duration) }}</div>
          <div class="stat-label">直播时长</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-value">{{ formatNumber(liveStats.total_messages) }}</div>
          <div class="stat-label">弹幕总数</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-icon">🎁</div>
          <div class="stat-value">{{ formatNumber(liveStats.total_gifts) }}</div>
          <div class="stat-label">总收益</div>
        </div>
      </div>
  
      <!-- 图表容器 -->
      <div class="charts-container">
        <div ref="viewerChart" class="chart"></div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { getLiveStatistics } from '@/API/LiveStatistics';
  import { onMounted, ref, nextTick } from 'vue';
  import { LiveStatistics } from '@/API/LiveStatistics/types';
  import * as echarts from 'echarts';
  import { useRoute } from 'vue-router';
  import Nav from '../nav/nav.vue';
  const route = useRoute();
  
  const liveStats = ref<LiveStatistics>({
    peak_viewers: 0,
    total_duration: 0,
    total_gifts: 0,
    total_messages: 0,
    total_viewers: 0
  });
  
  const viewerChart = ref<HTMLElement | null>(null);
  let chart: echarts.ECharts | null = null;
  
  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // 格式化时长（秒转为时:分:秒）
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 模拟观众数量随时间变化的数据
  // 实际项目中，您可能需要从API获取这些数据
  const generateViewerData = (peakViewers: number, duration: number) => {
    const data = [];
    const intervalMinutes = 5; // 每5分钟一个数据点
    const totalPoints = Math.ceil(duration / 60 / intervalMinutes);
    
    let currentViewers = Math.floor(peakViewers * 0.2); // 开始时约为峰值的20%
    
    for (let i = 0; i < totalPoints; i++) {
      const timePoint = i * intervalMinutes * 60; // 转换为秒
      
      // 随机波动，但保证峰值在中间偏后的位置
      if (i < totalPoints * 0.4) {
        // 上升阶段
        currentViewers += Math.floor(Math.random() * peakViewers * 0.1);
      } else if (i === Math.floor(totalPoints * 0.6)) {
        // 峰值点
        currentViewers = peakViewers;
      } else if (i > totalPoints * 0.6) {
        // 下降阶段
        currentViewers -= Math.floor(Math.random() * peakViewers * 0.08);
      }
      
      // 确保不会低于初始值的一半
      currentViewers = Math.max(currentViewers, Math.floor(peakViewers * 0.1));
      
      data.push([timePoint, currentViewers]);
    }
    
    return data;
  };
  
  // 初始化图表
  const initChart = () => {
    if (viewerChart.value) {
      chart = echarts.init(viewerChart.value);
      
      const viewerData = generateViewerData(liveStats.value.peak_viewers, liveStats.value.total_duration);
      
      const option = {
        title: {
          text: '直播观看人数变化',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            const time = formatDuration(params[0].value[0]);
            const viewers = formatNumber(params[0].value[1]);
            return `时间: ${time}<br/>观看人数: ${viewers}`;
          }
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => formatDuration(value)
          },
          name: '直播时间'
        },
        yAxis: {
          type: 'value',
          name: '观看人数'
        },
        series: [{
          name: '观看人数',
          type: 'line',
          data: viewerData,
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(58, 71, 212, 0.6)' },
              { offset: 1, color: 'rgba(58, 71, 212, 0.1)' }
            ])
          },
          itemStyle: {
            color: '#3a47d4'
          },
          markPoint: {
            data: [
              { type: 'max', name: '最高值' }
            ]
          }
        }]
      };
      
      chart.setOption(option);
      
      // 响应窗口大小变化
      window.addEventListener('resize', () => {
        chart?.resize();
      });
    }
  };
  
  // 获取数据
  const fetchData = async (liveId: string) => {
    try {
      const data = await getLiveStatistics(liveId);
      liveStats.value = (data as any).data;
      console.log(liveStats.value);
      
      // 确保DOM已更新再初始化图表
      nextTick(() => {
        initChart();
      });
    } catch (error) {
      console.error('获取直播统计数据失败:', error);
    }
  };
  
  onMounted(() => {
    // 假设从URL参数或其他地方获取直播ID
    const liveId = route.params.live_id as string; // 替换为实际的ID获取逻辑
    fetchData(liveId);
  });
  </script>
  
  <style scoped>
  .statistics-container {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    margin-bottom: 20px;
    text-align: center;
  }
  
  .stats-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    width: 180px;
    text-align: center;
    transition: transform 0.2s;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
  }
  
  .stat-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
    color: #333;
  }
  
  .stat-label {
    font-size: 14px;
    color: #666;
  }
  
  .highlight {
    border: 2px solid #3a47d4;
  }
  
  .highlight .stat-value {
    color: #3a47d4;
  }
  
  .charts-container {
    margin-top: 30px;
  }
  
  .chart {
    height: 400px;
    width: 100%;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  </style>