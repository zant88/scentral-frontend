<template>
  <section class="section">
    <div class="section-header">
      <h1>Analytics Dashboard</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Analytics</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Advertisement Analytics</h2>
      <p class="section-lead">
        View comprehensive analytics and reports for the advertisement system.
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
                {{ formatNumber(summary.totalPlays) }}
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
                <h4>Total Revenue</h4>
              </div>
              <div class="card-body">
                {{ formatCurrency(summary.totalRevenue) }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-clock"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Active Slots</h4>
              </div>
              <div class="card-body">
                {{ summary.activeSlots }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info">
              <i class="fas fa-video"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Active Videos</h4>
              </div>
              <div class="card-body">
                {{ summary.activeVideos }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="card-header">
          <h4>Filters</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Period</label>
                <select v-model="filters.period" @change="updateAnalytics" class="form-control">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>
            <div class="col-md-3" v-if="filters.period === 'custom'">
              <div class="form-group">
                <label>Start Date</label>
                <input type="date" v-model="filters.startDate" @change="updateAnalytics" class="form-control" />
              </div>
            </div>
            <div class="col-md-3" v-if="filters.period === 'custom'">
              <div class="form-group">
                <label>End Date</label>
                <input type="date" v-model="filters.endDate" @change="updateAnalytics" class="form-control" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label>Brand</label>
                <select v-model="filters.brandId" @change="updateAnalytics" class="form-control">
                  <option value="">All Brands</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h4>Plays Over Time</h4>
            </div>
            <div class="card-body">
              <canvas id="playsChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h4>Ad Type Distribution</h4>
            </div>
            <div class="card-body">
              <canvas id="adTypeChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h4>Top Performing Videos</h4>
            </div>
            <div class="card-body">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Brand</th>
                    <th>Plays</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="video in topVideos" :key="video.id">
                    <td>{{ video.title }}</td>
                    <td>{{ video.brand_name }}</td>
                    <td>{{ formatNumber(video.total_plays) }}</td>
                    <td>{{ formatCurrency(video.total_revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h4>Slot Utilization</h4>
            </div>
            <div class="card-body">
              <canvas id="slotUtilizationChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Brand Performance Table -->
      <div class="card">
        <div class="card-header">
          <h4>Brand Performance</h4>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Total Plays</th>
                <th>General Plays</th>
                <th>Perfume Plays</th>
                <th>Total Revenue</th>
                <th>Current Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="brand in brandAnalytics" :key="brand.id">
                <td>
                  <div class="brand-info">
                    <strong>{{ brand.name }}</strong>
                    <div class="text-muted small">{{ brand.email || 'No email' }}</div>
                  </div>
                </td>
                <td>{{ formatNumber(brand.total_plays) }}</td>
                <td>{{ formatNumber(brand.general_plays) }}</td>
                <td>{{ formatNumber(brand.perfume_plays) }}</td>
                <td>{{ formatCurrency(brand.total_revenue) }}</td>
                <td>
                  <span :class="brand.balance > 0 ? 'text-success' : 'text-danger'">
                    {{ formatCurrency(brand.balance) }}
                  </span>
                </td>
                <td>
                  <button @click="viewBrandDetails(brand)" class="btn btn-sm btn-info">
                    <i class="fas fa-eye"></i> Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Playback Logs -->
      <div class="card">
        <div class="card-header">
          <h4>Recent Playback Logs</h4>
        </div>
        <div class="card-body">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Time</th>
                <th>Video</th>
                <th>Brand</th>
                <th>Device</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in recentLogs" :key="log.id">
                <td>{{ formatDateTime(log.played_at) }}</td>
                <td>{{ log.video?.title || 'N/A' }}</td>
                <td>{{ log.video?.brand?.name || 'N/A' }}</td>
                <td>{{ log.device_id || 'N/A' }}</td>
                <td>{{ formatDuration(log.duration_played) }}</td>
                <td>
                  <span :class="getStatusBadgeClass(log.status)" class="badge">
                    {{ log.status?.toUpperCase() || 'UNKNOWN' }}
                  </span>
                </td>
                <td>{{ log.cost_incurred || 0 }} balance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})

import { ref, onMounted, nextTick } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Reactive data
const summary = ref({
  totalPlays: 0,
  totalRevenue: 0,
  activeSlots: 0,
  activeVideos: 0
});

const filters = ref({
  period: '7d',
  startDate: '',
  endDate: '',
  brandId: ''
});

const brands = ref([]);
const topVideos = ref([]);
const brandAnalytics = ref([]);
const recentLogs = ref([]);
const charts = ref({});

// Fetch data
const fetchBrands = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    brands.value = data.data || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
};

const fetchSummary = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/summary`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      summary.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching summary:', error);
  }
};

const fetchTopVideos = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    
    if (filters.value.period !== 'custom') {
      params.append('period', filters.value.period);
    } else {
      if (filters.value.startDate) params.append('start_date', filters.value.startDate);
      if (filters.value.endDate) params.append('end_date', filters.value.endDate);
    }
    if (filters.value.brandId) params.append('brand_id', filters.value.brandId);
    
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/top-videos?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      topVideos.value = data.data || [];
    }
  } catch (error) {
    console.error('Error fetching top videos:', error);
  }
};

const fetchBrandAnalytics = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    
    if (filters.value.period !== 'custom') {
      params.append('period', filters.value.period);
    } else {
      if (filters.value.startDate) params.append('start_date', filters.value.startDate);
      if (filters.value.endDate) params.append('end_date', filters.value.endDate);
    }
    
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/brands?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      brandAnalytics.value = data.data || [];
    }
  } catch (error) {
    console.error('Error fetching brand analytics:', error);
  }
};

const fetchRecentLogs = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/recent-logs?limit=20`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      recentLogs.value = data.data || [];
    }
  } catch (error) {
    console.error('Error fetching recent logs:', error);
  }
};

const fetchPlaysOverTime = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    
    if (filters.value.period !== 'custom') {
      params.append('period', filters.value.period);
    } else {
      if (filters.value.startDate) params.append('start_date', filters.value.startDate);
      if (filters.value.endDate) params.append('end_date', filters.value.endDate);
    }
    if (filters.value.brandId) params.append('brand_id', filters.value.brandId);
    
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/plays-over-time?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      await nextTick();
      renderPlaysChart(data.data || []);
    }
  } catch (error) {
    console.error('Error fetching plays over time:', error);
  }
};

const fetchAdTypeDistribution = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    
    if (filters.value.period !== 'custom') {
      params.append('period', filters.value.period);
    } else {
      if (filters.value.startDate) params.append('start_date', filters.value.startDate);
      if (filters.value.endDate) params.append('end_date', filters.value.endDate);
    }
    if (filters.value.brandId) params.append('brand_id', filters.value.brandId);
    
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/ad-type-distribution?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      await nextTick();
      renderAdTypeChart(data.data || []);
    }
  } catch (error) {
    console.error('Error fetching ad type distribution:', error);
  }
};

const fetchSlotUtilization = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    
    if (filters.value.period !== 'custom') {
      params.append('period', filters.value.period);
    } else {
      if (filters.value.startDate) params.append('start_date', filters.value.startDate);
      if (filters.value.endDate) params.append('end_date', filters.value.endDate);
    }
    
    const response = await fetchWithAuth(`${apiUrl}/api/analytics/slot-utilization?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      await nextTick();
      renderSlotUtilizationChart(data.data || []);
    }
  } catch (error) {
    console.error('Error fetching slot utilization:', error);
  }
};

// Chart rendering functions
const renderPlaysChart = (data) => {
  const canvas = document.getElementById('playsChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  // Simple line chart implementation
  // In a real implementation, you would use a charting library like Chart.js
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#6777ef';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  data.forEach((point, index) => {
    const x = (index / (data.length - 1)) * canvas.width;
    const y = canvas.height - (point.plays / Math.max(...data.map(d => d.plays))) * canvas.height * 0.8;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
};

const renderAdTypeChart = (data) => {
  const canvas = document.getElementById('adTypeChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;
  
  data.forEach((item, index) => {
    const sliceAngle = (item.count / total) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 3, currentAngle, currentAngle + sliceAngle);
    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = item.ad_type === 'general' ? '#007bff' : '#28a745';
    ctx.fill();
    
    currentAngle += sliceAngle;
  });
};

const renderSlotUtilizationChart = (data) => {
  const canvas = document.getElementById('slotUtilizationChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const barWidth = canvas.width / data.length * 0.8;
  const maxValue = Math.max(...data.map(d => Math.max(d.general_seconds, d.perfume_seconds)));
  
  data.forEach((slot, index) => {
    const x = (index / data.length) * canvas.width + barWidth * 0.1;
    
    // General ads bar
    const generalHeight = (slot.general_seconds / maxValue) * canvas.height * 0.8;
    ctx.fillStyle = '#007bff';
    ctx.fillRect(x, canvas.height - generalHeight, barWidth / 2 - 2, generalHeight);
    
    // Perfume ads bar
    const perfumeHeight = (slot.perfume_seconds / maxValue) * canvas.height * 0.8;
    ctx.fillStyle = '#28a745';
    ctx.fillRect(x + barWidth / 2 + 2, canvas.height - perfumeHeight, barWidth / 2 - 2, perfumeHeight);
  });
};

// Update all analytics
const updateAnalytics = () => {
  fetchTopVideos();
  fetchBrandAnalytics();
  fetchPlaysOverTime();
  fetchAdTypeDistribution();
  fetchSlotUtilization();
};

const viewBrandDetails = (brand) => {
  // Navigate to brand details page or show modal
  navigateTo(`/admin/brands/${brand.id}`);
};

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
};

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rp${Math.round(numAmount).toLocaleString('id-ID')}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'interrupted': return 'badge-warning';
    case 'error': return 'badge-danger';
    default: return 'badge-secondary';
  }
};

// Lifecycle
onMounted(async () => {
  await fetchBrands();
  await fetchSummary();
  await fetchTopVideos();
  await fetchBrandAnalytics();
  await fetchRecentLogs();
  await fetchPlaysOverTime();
  await fetchAdTypeDistribution();
  await fetchSlotUtilization();
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

.brand-info {
  min-width: 150px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-success { background-color: #28a745; }
.badge-warning { background-color: #ffc107; color: #212529; }
.badge-danger { background-color: #dc3545; }
.badge-secondary { background-color: #6c757d; }

canvas {
  max-height: 300px;
}
</style>