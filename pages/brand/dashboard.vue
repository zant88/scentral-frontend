<template>
  <section class="section">
    <div class="section-header">
      <h1>Brand Dashboard</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Overview</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Welcome back, {{ brandInfo.name }}!</h2>
      <p class="section-lead">
        Monitor your advertisement performance and manage your account.
      </p>

      <!-- Summary Cards -->
      <div class="row">
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary">
              <i class="fas fa-play"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Plays</h4>
              </div>
              <div class="card-body">
                {{ formatNumber(analytics.total_plays) }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Spend</h4>
              </div>
              <div class="card-body">
                {{ formatNumber(analytics.total_spend) }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-video"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Active Videos</h4>
              </div>
              <div class="card-body">
                {{ analytics.active_videos }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div :class="getBalanceCardClass()" class="card-icon">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Current Balance</h4>
              </div>
              <div class="card-body">
                {{ formatNumber(brandInfo.balance) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance Alert -->
      <div v-if="brandInfo.balance < 100000" class="alert alert-warning" role="alert">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <strong>Low Balance Alert:</strong> Your current balance is {{ formatCurrency(brandInfo.balance) }}. 
        Please top up your balance to ensure your advertisements continue running.
        <button @click="navigateTo('/brand/balance')" class="btn btn-sm btn-warning ml-2">
          <i class="fas fa-plus mr-1"></i>Top Up Now
        </button>
      </div>

      <!-- Spend Balance Charts -->
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h4>Spend Balance Overview</h4>
              <div class="card-header-action">
                <select v-model="selectedBalancePeriod" @change="updateBalanceChart" class="form-control form-control-sm">
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                </select>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="balanceChart"></canvas>
              </div>
              <div class="mt-3 text-center">
                <small class="text-muted">Total Spend in Selected Period: </small>
                <strong class="text-primary">{{ formatCurrency(currentPeriodSpend) }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h4>Video Status Distribution</h4>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="videoStatusChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Performance Table -->
      <div class="card">
        <div class="card-header">
          <h4>Your Video Performance</h4>
          <div class="card-header-action">
            <button @click="navigateTo('/brand/videos')" class="btn btn-sm btn-primary">
              <i class="fas fa-video mr-1"></i>View All Videos
            </button>
          </div>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Video</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total Plays</th>
                <th>Total Spend</th>
                <th>Avg. Cost/Play</th>
                <!-- <th>Performance</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="video in videoAnalytics" :key="video.id">
                <td>
                  <div class="video-info d-flex align-items-center">
                    <img
                      :src="video.thumbnail_url || '/assets/img/no-image.jpg'"
                      :alt="video.title"
                      class="video-thumbnail-small mr-3"
                      style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px;"
                    />
                    <div>
                      <strong>{{ video.title }}</strong>
                      <div class="text-muted small">{{ formatDuration(video.duration_seconds) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="getAdTypeBadgeClass(video.ad_type)" class="badge">
                    {{ video.ad_type?.toUpperCase() }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(video.status)" class="badge">
                    {{ video.status?.toUpperCase() }}
                  </span>
                </td>
                <td>{{ formatNumber(video.plays) }}</td>
                <td>{{ formatNumber(video.total_cost) }}</td>
                <td>{{ video.plays > 0 ? formatNumber(video.total_cost / video.plays) : 'N/A' }}</td>
                <!-- <td>
                  <div class="performance-indicator">
                    <div class="progress" style="height: 20px;">
                      <div 
                        class="progress-bar" 
                        :class="getPerformanceClass(video.performance_score)"
                        :style="{ width: Math.min(video.performance_score || 0, 100) + '%' }"
                      >
                        {{ Math.round(video.performance_score || 0) }}%
                      </div>
                    </div>
                  </div>
                </td> -->
              </tr>
            </tbody>
          </table>
          <div v-if="videoAnalytics.length === 0" class="text-center py-4">
            <p class="text-muted">No videos found. Contact admin to upload your advertisement videos.</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h4>Recent Activity</h4>
          <div class="card-header-action">
            <button @click="navigateTo('/brand/reports')" class="btn btn-sm btn-primary">
              <i class="fas fa-chart-bar mr-1"></i>View Detailed Reports
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="timeline">
            <div v-for="activity in recentActivities" :key="activity.id" class="timeline-item">
              <div class="timeline-point" :class="getActivityPointClass(activity.type)"></div>
              <div class="timeline-content">
                <div class="timeline-time">{{ formatDateTime(activity.created_at) }}</div>
                <div class="timeline-title">{{ activity.title }}</div>
                <div class="timeline-body">{{ activity.description }}</div>
              </div>
            </div>
          </div>
          <div v-if="recentActivities.length === 0" class="text-center py-3">
            <p class="text-muted">No recent activity</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="fas fa-video fa-3x text-primary mb-3"></i>
              <h5>My Videos</h5>
              <p class="text-muted">View your advertisement videos</p>
              <button @click="navigateTo('/brand/videos')" class="btn btn-primary">
                View Videos
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="fas fa-clock fa-3x text-warning mb-3"></i>
              <h5>Slot Booking</h5>
              <p class="text-muted">View your booked slots</p>
              <button @click="navigateTo('/brand/slots')" class="btn btn-warning">
                View Slots
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="fas fa-wallet fa-3x text-success mb-3"></i>
              <h5>Balance</h5>
              <p class="text-muted">Manage your account balance</p>
              <button @click="navigateTo('/brand/balance')" class="btn btn-success">
                Manage Balance
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="fas fa-chart-bar fa-3x text-info mb-3"></i>
              <h5>Reports</h5>
              <p class="text-muted">View performance reports</p>
              <button @click="navigateTo('/brand/reports')" class="btn btn-info">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Tooltip -->
  <div v-if="tooltip.visible" class="tooltip" :style="{
    left: tooltip.x + 'px',
    top: tooltip.y + 'px',
    opacity: tooltip.visible ? '1' : '0',
    transition: 'opacity 0.2s ease-in-out'
  }">
    <div class="tooltip-title">{{ tooltip.title }}</div>
    <div class="tooltip-value">{{ tooltip.value }}</div>
    <div v-if="tooltip.date" class="tooltip-date">{{ tooltip.date }}</div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'brand'
})

import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Reactive data
const brandInfo = ref({
  name: '',
  balance: 0,
  email: '',
  logo_url: ''
});

const analytics = ref({
  total_plays: 0,
  total_spend: 0,
  active_videos: 0,
  general_plays: 0,
  perfume_plays: 0
});

const videoAnalytics = ref([]);
const recentActivities = ref([]);
const selectedPeriod = ref('30d');

// Video status distribution for pie chart
const videoStatusDistribution = ref([]);

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  value: '',
  date: ''
});

// Spend balance data
const balanceData = ref({
  current_balance: 0,
  periods: {
    last_7_days: { spend_data: [], balance_data: [], total_spend: 0 },
    last_30_days: { spend_data: [], balance_data: [], total_spend: 0 },
    last_90_days: { spend_data: [], balance_data: [], total_spend: 0 }
  }
});
const selectedBalancePeriod = ref('last_7_days');
const currentPeriodSpend = ref(0);

// Navigation function
const navigateTo = (path) => {
  router.push(path);
};

// Fetch brand information
const fetchBrandInfo = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/profile`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      // Set brand basic info
      brandInfo.value = {
        id: data.data.id,
        name: data.data.name,
        description: data.data.description,
        balance: data.data.balance,
        email: data.data.email,
        logo_url: data.data.logo_url,
        logo: data.data.logo,
        is_active: data.data.is_active,
        contact_info: data.data.contact_info,
        created_at: data.data.created_at,
        updated_at: data.data.updated_at
      };

      // Update analytics with stats from profile response
      if (data.data.stats) {
        analytics.value = {
          total_plays: data.data.stats.total_plays || 0,
          total_spend: data.data.stats.total_spend || 0,
          active_videos: data.data.stats.active_videos || 0,
          total_videos: data.data.stats.total_videos || 0,
          general_plays: 0, // These need separate API call
          perfume_plays: 0  // These need separate API call
        };
      }

      // Update recent activities from profile response
      if (data.recent_activities && data.recent_activities.length > 0) {
        recentActivities.value = data.recent_activities.map(activity => ({
          id: activity.type + '_' + activity.created_at,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          created_at: activity.created_at
        }));
      }

      // Update video status distribution for pie chart
      if (data.video_status_distribution && data.video_status_distribution.length > 0) {
        videoStatusDistribution.value = data.video_status_distribution;
        console.log('Video status distribution loaded:', videoStatusDistribution.value);
      } else {
        console.log('No video status distribution data found');
      }
    }
  } catch (error) {
    console.error('Error fetching brand info:', error);
  }
};

// Fetch analytics data (ad type breakdown - general_plays and perfume_plays)
const fetchAnalytics = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      // Merge the ad type breakdown data with existing analytics
      analytics.value = {
        ...analytics.value,
        general_plays: data.data.general_plays || 0,
        perfume_plays: data.data.perfume_plays || 0
      };
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};

// Fetch video analytics
const fetchVideoAnalytics = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/videos`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      videoAnalytics.value = data.data || [];
    }
  } catch (error) {
    console.error('Error fetching video analytics:', error);
  }
};

// Fetch additional recent activities (if needed beyond profile activities)
const fetchRecentActivities = async () => {
  try {
    // Only fetch additional activities if we don't already have them from profile
    if (recentActivities.value.length > 0) {
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/activities`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      recentActivities.value = data.data || [];
    }
  } catch (error) {
    console.error('Error fetching recent activities:', error);
  }
};

// Fetch spend balance analytics
const fetchSpendBalanceAnalytics = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/spend-balance`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      balanceData.value = data.data;
      updateCurrentPeriodSpend();
    }
  } catch (error) {
    console.error('Error fetching spend balance analytics:', error);
  }
};

// Update current period spend
const updateCurrentPeriodSpend = () => {
  if (balanceData.value.periods && balanceData.value.periods[selectedBalancePeriod.value]) {
    currentPeriodSpend.value = balanceData.value.periods[selectedBalancePeriod.value].total_spend;
  }
};

// Watch for changes in video status distribution and re-render chart
watch(videoStatusDistribution, () => {
  nextTick(() => {
    renderVideoStatusChart();
  });
}, { deep: true });

// Watch for changes in balance data and re-render chart
watch(balanceData, () => {
  nextTick(() => {
    renderBalanceChart();
  });
}, { deep: true });

// Update balance chart when period changes
const updateBalanceChart = async () => {
  updateCurrentPeriodSpend();
  await nextTick();
  renderBalanceChart();
};

// Handle window resize
const handleResize = () => {
  renderCharts();
};

// Update all analytics
const updateAnalytics = async () => {
  await fetchAnalytics(); // Only fetches ad type breakdown (general/perfume plays)
  await fetchVideoAnalytics();
  await nextTick();
  renderCharts();
};

// Render charts
const renderCharts = () => {
  renderBalanceChart();
  renderVideoStatusChart();
};

const renderBalanceChart = () => {
  const canvas = document.getElementById('balanceChart');
  if (!canvas) return;
  
  const container = canvas.parentElement;
  const width = container.offsetWidth;
  const height = 300;
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = '100%';
  canvas.style.height = height + 'px';
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Get balance data for selected period
  console.log('Balance data loaded:', balanceData.value);
  const periodData = balanceData.value.periods[selectedBalancePeriod.value];
  console.log('Period data for', selectedBalancePeriod.value, ':', periodData);
  if (!periodData || !periodData.balance_data || periodData.balance_data.length === 0) {
    // Show no data message
    ctx.fillStyle = '#6c757d';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No balance data available for selected period', width / 2, height / 2);
    return;
  }
  
  const balanceDataArray = periodData.balance_data;
  const spendDataArray = periodData.spend_data;
  
  // Find min and max values for scaling
  const allBalances = balanceDataArray.map(d => d.balance);
  const allSpends = spendDataArray.map(d => d.spend);
  const maxBalance = Math.max(...allBalances, 1);
  const maxSpend = Math.max(...allSpends, 1);
  const maxValue = Math.max(maxBalance, maxSpend);
  
  // Draw grid lines
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = (height - 40) * (i / 5) + 20;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 20, y);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    const value = maxValue * (1 - i / 5);
    ctx.fillText(formatCurrency(value), 35, y + 3);
  }
  
  ctx.setLineDash([]);
  
  // Store point positions for tooltip
  const balancePoints = [];
  const spendPoints = [];
  
  // Draw balance line
  if (balanceDataArray.length > 0) {
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    balanceDataArray.forEach((point, index) => {
      const x = 40 + ((width - 60) / (balanceDataArray.length - 1)) * index;
      const y = height - 20 - ((point.balance - 0) / maxValue) * (height - 40);
      
      // Store point position for tooltip
      balancePoints.push({ x, y, data: point });
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw balance points with larger hover area
    ctx.fillStyle = '#007bff';
    balanceDataArray.forEach((point, index) => {
      const x = 40 + ((width - 60) / (balanceDataArray.length - 1)) * index;
      const y = height - 20 - ((point.balance - 0) / maxValue) * (height - 40);
      
      // Draw outer circle for hover area (invisible but larger)
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
      ctx.fill();
      
      // Draw actual point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#007bff';
      ctx.fill();
    });
  }
  
  // Draw spend line
  if (spendDataArray.length > 0) {
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    spendDataArray.forEach((point, index) => {
      const x = 40 + ((width - 60) / (spendDataArray.length - 1)) * index;
      const y = height - 20 - ((point.spend - 0) / maxValue) * (height - 40);
      
      // Store point position for tooltip
      spendPoints.push({ x, y, data: point });
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw spend points with larger hover area
    ctx.fillStyle = '#dc3545';
    spendDataArray.forEach((point, index) => {
      const x = 40 + ((width - 60) / (spendDataArray.length - 1)) * index;
      const y = height - 20 - ((point.spend - 0) / maxValue) * (height - 40);
      
      // Draw outer circle for hover area (invisible but larger)
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(220, 53, 69, 0.1)';
      ctx.fill();
      
      // Draw actual point
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#dc3545';
      ctx.fill();
    });
  }
  
  // Draw X-axis labels (dates)
  ctx.fillStyle = '#6c757d';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  
  const labelCount = Math.min(balanceDataArray.length, 10); // Show max 10 labels
  const step = Math.max(1, Math.floor(balanceDataArray.length / labelCount));
  
  for (let i = 0; i < balanceDataArray.length; i += step) {
    const x = 40 + ((width - 60) / (balanceDataArray.length - 1)) * i;
    const date = new Date(balanceDataArray[i].date);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ctx.fillText(label, x, height - 5);
  }
  
  // Draw legend
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  
  // Balance legend
  ctx.fillStyle = '#007bff';
  ctx.fillRect(width - 150, 10, 15, 3);
  ctx.fillStyle = '#333';
  ctx.fillText('Balance', width - 130, 14);
  
  // Spend legend
  ctx.fillStyle = '#dc3545';
  ctx.fillRect(width - 150, 25, 15, 3);
  ctx.fillStyle = '#333';
  ctx.fillText('Daily Spend', width - 130, 29);
  
  // Add mouse move event for tooltip
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Check if mouse is near any balance point
    let foundPoint = false;
    
    // Check balance points
    for (const point of balancePoints) {
      const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
      if (distance <= 15) { // Increased hover area for better UX
        showTooltip(e.clientX, e.clientY, 'Balance', formatCurrency(point.data.balance), point.data.date);
        foundPoint = true;
        canvas.style.cursor = 'pointer';
        break;
      }
    }
    
    // Check spend points if no balance point found
    if (!foundPoint) {
      for (const point of spendPoints) {
        const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
        if (distance <= 15) { // Increased hover area for better UX
          showTooltip(e.clientX, e.clientY, 'Daily Spend', formatCurrency(point.data.spend), point.data.date);
          foundPoint = true;
          canvas.style.cursor = 'pointer';
          break;
        }
      }
    }
    
    if (!foundPoint) {
      hideTooltip();
      canvas.style.cursor = 'crosshair';
    }
  };
  
  canvas.onmouseleave = () => {
    hideTooltip();
    canvas.style.cursor = 'crosshair';
  };
};

const renderVideoStatusChart = () => {
  const canvas = document.getElementById('videoStatusChart');
  if (!canvas) return;

  const container = canvas.parentElement;
  const width = container.offsetWidth;
  const height = 300;

  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = '100%';
  canvas.style.height = height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  // Check if we have video status distribution data
  console.log('Rendering video status chart with data:', videoStatusDistribution.value);
  if (!videoStatusDistribution.value || videoStatusDistribution.value.length === 0) {
    // Show no data message
    ctx.fillStyle = '#6c757d';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No video status data available', width / 2, height / 2);
    return;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  let currentAngle = -Math.PI / 2; // Start from top

  // Store slice data for tooltip and calculate total
  const slices = [];
  let total = 0;

  // Calculate total
  videoStatusDistribution.value.forEach(status => {
    total += status.count;
  });

  if (total === 0) {
    ctx.fillStyle = '#6c757d';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No videos found', width / 2, height / 2);
    return;
  }

  // Color mapping for different statuses
  const statusColors = {
    'active': '#28a745',     // Green
    'processing': '#ffc107', // Yellow
    'inactive': '#dc3545',   // Red
    'pending': '#17a2b8',    // Cyan
    'rejected': '#6f42c1',   // Purple
    'approved': '#28a745'    // Green (same as active)
  };

  // Create slices for each status
  videoStatusDistribution.value.forEach((status, index) => {
    const color = statusColors[status.status.toLowerCase()] || '#6c757d'; // Default gray
    const angle = (status.count / total) * 2 * Math.PI;

    slices.push({
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: color,
      label: status.status.charAt(0).toUpperCase() + status.status.slice(1),
      value: status.count,
      percentage: ((status.count / total) * 100).toFixed(1)
    });

    // Draw the slice
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = color;
    ctx.fill();

    // Add border between slices
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += angle;
  });

  // Draw legend
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';

  let legendY = 20;

  slices.forEach((slice, index) => {
    ctx.fillStyle = slice.color;
    ctx.fillRect(20, legendY, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText(`${slice.label} (${slice.percentage}%)`, 45, legendY + 12);
    legendY += 25;
  });

  // Add mouse move event for tooltip
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Calculate distance from center
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if mouse is within the pie chart (with small buffer for easier hovering)
    if (distance <= radius + 5) {
      // Calculate angle from center
      let angle = Math.atan2(dy, dx);
      // Adjust angle to match our coordinate system
      if (angle < -Math.PI / 2) angle += 2 * Math.PI;

      // Find which slice the mouse is over
      for (const slice of slices) {
        if (angle >= slice.startAngle && angle <= slice.endAngle) {
          showTooltip(e.clientX, e.clientY, slice.label, `${formatNumber(slice.value)} videos (${slice.percentage}%)`, '');
          canvas.style.cursor = 'pointer';
          return;
        }
      }
    }

    hideTooltip();
    canvas.style.cursor = 'crosshair';
  };

  canvas.onmouseleave = () => {
    hideTooltip();
    canvas.style.cursor = 'crosshair';
  };
};

// Tooltip functions
const showTooltip = (x, y, title, value, date) => {
  // Ensure tooltip stays within viewport
  const tooltipWidth = 250;
  const tooltipHeight = 80;
  const padding = 10;
  
  let adjustedX = x + padding;
  let adjustedY = y - tooltipHeight - padding;
  
  // Adjust if tooltip would go off the right edge
  if (adjustedX + tooltipWidth > window.innerWidth) {
    adjustedX = x - tooltipWidth - padding;
  }
  
  // Adjust if tooltip would go off the top edge
  if (adjustedY < 0) {
    adjustedY = y + padding;
  }
  
  tooltip.value = {
    visible: true,
    x: adjustedX,
    y: adjustedY,
    title: title,
    value: value,
    date: date ? new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : ''
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

// Utility functions
const formatNumber = (num) => {
  return (num || 0).toLocaleString('id-ID');
};

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rp${Math.round(numAmount).toLocaleString('id-ID')}`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const getBalanceCardClass = () => {
  if (brandInfo.value.balance < 10000) return 'bg-danger';
  if (brandInfo.value.balance < 100000) return 'bg-warning';
  return 'bg-info';
};

const getAdTypeBadgeClass = (type) => {
  switch (type) {
    case 'general': return 'badge-primary';
    case 'perfume': return 'badge-success';
    default: return 'badge-secondary';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'rejected': return 'badge-danger';
    default: return 'badge-secondary';
  }
};

const getPerformanceClass = (score) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-danger';
};

const getActivityPointClass = (type) => {
  switch (type) {
    case 'play': return 'bg-primary';
    case 'topup': return 'bg-success';
    case 'video_approved': return 'bg-info';
    case 'video_rejected': return 'bg-danger';
    case 'video_uploaded': return 'bg-info';
    case 'video_updated': return 'bg-warning';
    case 'payment_received': return 'bg-success';
    case 'payment_made': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

// Lifecycle
onMounted(async () => {
  await fetchBrandInfo();
  await fetchAnalytics();
  await fetchVideoAnalytics();
  await fetchRecentActivities();
  await fetchSpendBalanceAnalytics();
  await nextTick();
  renderCharts();
  
  // Add window resize listener
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // Remove window resize listener
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.card-statistic-1 {
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.card-statistic-1 .card-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  border-radius: 0 0 0 100%;
  margin: 0;
}

.card-statistic-1 .card-wrap {
  padding: 1.5rem 1.5rem 1.5rem 1.8rem;
  height: 130px;
  padding-top: 55px;
}

.card-statistic-1 .card-header h4 {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
}

.card-statistic-1 .card-body {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  padding-left: 0;
}

.card-statistic-1 .card-header {
  padding-top: 0;
  padding-left: 0
}

.video-info {
  min-width: 200px;
}

.performance-indicator {
  min-width: 100px;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-point {
  position: absolute;
  left: -22px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.timeline-content {
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 5px;
}

.timeline-time {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.timeline-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.timeline-body {
  font-size: 0.875rem;
  color: #6c757d;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-primary { background-color: #007bff; }
.badge-success { background-color: #28a745; }
.badge-warning { background-color: #ffc107; color: #212529; }
.badge-danger { background-color: #dc3545; }
.badge-info { background-color: #17a2b8; }
.badge-secondary { background-color: #6c757d; }

.bg-primary { background-color: #007bff; }
.bg-success { background-color: #28a745; }
.bg-warning { background-color: #ffc107; }
.bg-danger { background-color: #dc3545; }
.bg-info { background-color: #17a2b8; }
.bg-secondary { background-color: #6c757d; }

.chart-container {
  width: 100%;
  position: relative;
}

canvas {
  background-color: transparent;
  padding: 10px 15px;
  border-radius: 5px;
  width: 100% !important;
  max-width: 100%;
  height: auto;
  cursor: crosshair;
}

.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 9999;
  max-width: 250px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 6px;
  color: #fff;
  font-size: 13px;
}

.tooltip-value {
  font-size: 14px;
  color: #fff;
  margin-bottom: 4px;
}

.tooltip-date {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 4px;
  color: #ccc;
}


.modal {
  z-index: 1050;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 0.75;
}

</style>
