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
                {{ formatCurrency(analytics.total_spend) }}
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
                {{ formatCurrency(brandInfo.balance) }}
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
        <button @click="showTopUpModal" class="btn btn-sm btn-warning ml-2">
          <i class="fas fa-plus mr-1"></i>Top Up Now
        </button>
      </div>

      <!-- Performance Charts -->
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h4>Performance Overview</h4>
              <div class="card-header-action">
                <select v-model="selectedPeriod" @change="updateAnalytics" class="form-control form-control-sm">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>
            <div class="card-body">
              <canvas id="performanceChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h4>Ad Type Performance</h4>
            </div>
            <div class="card-body">
              <canvas id="adTypeChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Performance Table -->
      <div class="card">
        <div class="card-header">
          <h4>Your Video Performance</h4>
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
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="video in videoAnalytics" :key="video.id">
                <td>
                  <div class="video-info">
                    <strong>{{ video.title }}</strong>
                    <div class="text-muted small">{{ formatDuration(video.duration_seconds) }}</div>
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
                <td>{{ formatNumber(video.total_plays) }}</td>
                <td>{{ formatCurrency(video.total_spend) }}</td>
                <td>{{ video.total_plays > 0 ? formatCurrency(video.total_spend / video.total_plays) : 'N/A' }}</td>
                <td>
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
                </td>
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

      <!-- Top Up Modal -->
      <div v-if="isTopUpModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeTopUpModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Top Up Balance</h5>
              <button type="button" class="btn-close" @click="closeTopUpModal"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-4">
                <h4>Current Balance</h4>
                <h2 class="text-primary">{{ formatCurrency(brandInfo.balance) }}</h2>
              </div>
              <form @submit.prevent="submitTopUp">
                <div class="form-group">
                  <label>Top Up Amount</label>
                  <div class="input-group">
                    <span class="input-group-text">Rp</span>
                    <input 
                      type="text" 
                      v-model="topUpAmountFormatted" 
                      @input="handleAmountInput"
                      class="form-control" 
                      placeholder="Enter amount" 
                      required 
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label>Payment Method</label>
                  <select v-model="paymentMethod" class="form-control">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="ewallet">E-Wallet</option>
                  </select>
                </div>
                <div v-if="topUpAmount" class="alert alert-info">
                  <i class="fas fa-info-circle mr-2"></i>
                  New balance after top-up: <strong>{{ formatCurrency(brandInfo.balance + parseFloat(topUpAmount || 0)) }}</strong>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeTopUpModal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Top Up Balance</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: 'brand'
})

import { ref, onMounted, nextTick } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

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

// Top-up modal
const isTopUpModal = ref(false);
const topUpAmount = ref('');
const topUpAmountFormatted = ref('');
const paymentMethod = ref('bank_transfer');

// Fetch brand information
const fetchBrandInfo = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/profile`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      brandInfo.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching brand info:', error);
  }
};

// Fetch analytics data
const fetchAnalytics = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/brand?period=${selectedPeriod.value}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      analytics.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};

// Fetch video analytics
const fetchVideoAnalytics = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/videos?period=${selectedPeriod.value}`, {
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

// Fetch recent activities
const fetchRecentActivities = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/activities?limit=10`, {
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

// Update all analytics
const updateAnalytics = async () => {
  await fetchAnalytics();
  await fetchVideoAnalytics();
  await nextTick();
  renderCharts();
};

// Render charts
const renderCharts = () => {
  renderPerformanceChart();
  renderAdTypeChart();
};

const renderPerformanceChart = () => {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Simple line chart implementation
  ctx.strokeStyle = '#6777ef';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  // Sample data - in real implementation, fetch from API
  const data = [
    { day: 'Mon', plays: 45 },
    { day: 'Tue', plays: 52 },
    { day: 'Wed', plays: 38 },
    { day: 'Thu', plays: 65 },
    { day: 'Fri', plays: 48 },
    { day: 'Sat', plays: 72 },
    { day: 'Sun', plays: 58 }
  ];
  
  const maxPlays = Math.max(...data.map(d => d.plays));
  
  data.forEach((point, index) => {
    const x = (index / (data.length - 1)) * canvas.width;
    const y = canvas.height - (point.plays / maxPlays) * canvas.height * 0.8;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
};

const renderAdTypeChart = () => {
  const canvas = document.getElementById('adTypeChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const total = analytics.value.general_plays + analytics.value.perfume_plays;
  if (total === 0) return;
  
  let currentAngle = 0;
  
  // General ads slice
  const generalAngle = (analytics.value.general_plays / total) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 3, currentAngle, currentAngle + generalAngle);
  ctx.lineTo(canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#007bff';
  ctx.fill();
  
  currentAngle += generalAngle;
  
  // Perfume ads slice
  const perfumeAngle = (analytics.value.perfume_plays / total) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 3, currentAngle, currentAngle + perfumeAngle);
  ctx.lineTo(canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#28a745';
  ctx.fill();
};

// Top-up functions
const showTopUpModal = () => {
  isTopUpModal.value = true;
  topUpAmount.value = '';
  topUpAmountFormatted.value = '';
  paymentMethod.value = 'bank_transfer';
};

const closeTopUpModal = () => {
  isTopUpModal.value = false;
  topUpAmount.value = '';
  topUpAmountFormatted.value = '';
  paymentMethod.value = 'bank_transfer';
};

const handleAmountInput = (event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  topUpAmount.value = value;
  topUpAmountFormatted.value = value ? parseInt(value).toLocaleString('id-ID') : '';
};

const submitTopUp = async () => {
  if (!topUpAmount.value || parseFloat(topUpAmount.value) <= 0) {
    $toast.error('Please enter a valid amount', { duration: 5000, position: 'top-right' });
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/balance/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: parseFloat(topUpAmount.value),
        payment_method: paymentMethod.value
      })
    });
    
    const data = await response.json();
    if (data.success) {
      $toast.success('Top-up request submitted successfully!', { duration: 5000, position: 'top-right' });
      closeTopUpModal();
      await fetchBrandInfo();
    } else {
      $toast.error(data.message || 'Failed to submit top-up request', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to submit top-up request', { duration: 5000, position: 'top-right' });
  }
};

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
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
    default: return 'bg-secondary';
  }
};

// Lifecycle
onMounted(async () => {
  await fetchBrandInfo();
  await fetchAnalytics();
  await fetchVideoAnalytics();
  await fetchRecentActivities();
  await nextTick();
  renderCharts();
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
}

.card-statistic-1 .card-wrap {
  padding: 1.5rem 1.5rem 1.5rem 7rem;
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

canvas {
  max-height: 300px;
}
</style>