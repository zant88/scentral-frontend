<template>
  <section class="section">
    <div class="section-header">
      <h1>Performance Reports</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item"><a href="#" @click="navigateTo('/brand/dashboard')">Dashboard</a></div>
        <div class="breadcrumb-item active">Performance Reports</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Analytics & Reports</h2>
      <p class="section-lead">
        Comprehensive analytics and performance reports for your advertisement campaigns.
      </p>

      <!-- Report Filters -->
      <div class="card">
        <div class="card-header">
          <h4>Report Filters</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <label>Report Period</label>
              <select v-model="reportPeriod" @change="updateReports" class="form-control">
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div class="col-md-3">
              <label>Start Date</label>
              <input 
                type="date" 
                v-model="customStartDate" 
                @change="updateReports"
                :disabled="reportPeriod !== 'custom'"
                class="form-control"
              />
            </div>
            <div class="col-md-3">
              <label>End Date</label>
              <input 
                type="date" 
                v-model="customEndDate" 
                @change="updateReports"
                :disabled="reportPeriod !== 'custom'"
                class="form-control"
              />
            </div>
            <div class="col-md-3">
              <label>Report Type</label>
              <select v-model="reportType" @change="updateReports" class="form-control">
                <option value="overview">Overview</option>
                <option value="videos">Video Performance</option>
                <option value="devices">Device Analytics</option>
                <option value="time">Time Analysis</option>
              </select>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-12">
              <button @click="exportReport" class="btn btn-primary" :disabled="isExporting || isLoading">
                <i class="fas fa-download mr-1" v-if="!isExporting"></i>
                <span class="spinner-border spinner-border-sm mr-1" v-if="isExporting" role="status"></span>
                {{ isExporting ? 'Exporting...' : 'Export Report' }}
              </button>
              <button @click="generatePDF" class="btn btn-secondary ml-2" :disabled="isLoading">
                <i class="fas fa-file-pdf mr-1"></i>Generate PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="row" v-if="isLoading">
        <div class="col-12 text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading report data...</p>
        </div>
      </div>

      <div class="row" v-else>
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
                {{ formatNumber(reportMetrics.total_plays) }}
                <small class="text-muted d-block">
                  <i :class="getTrendIcon(reportMetrics.plays_trend)" class="mr-1"></i>
                  {{ Math.abs(reportMetrics.plays_trend) }}% from previous period
                </small>
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
                {{ formatCurrency(reportMetrics.total_spend) }}
                <small class="text-muted d-block">
                  <i :class="getTrendIcon(reportMetrics.spend_trend)" class="mr-1"></i>
                  {{ Math.abs(reportMetrics.spend_trend) }}% from previous period
                </small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Engagement Rate</h4>
              </div>
              <div class="card-body">
                {{ reportMetrics.engagement_rate }}%
                <small class="text-muted d-block">
                  <i :class="getTrendIcon(reportMetrics.engagement_trend)" class="mr-1"></i>
                  {{ Math.abs(reportMetrics.engagement_trend) }}% from previous period
                </small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Unique Views</h4>
              </div>
              <div class="card-body">
                {{ formatNumber(reportMetrics.unique_views) }}
                <small class="text-muted d-block">
                  <i :class="getTrendIcon(reportMetrics.views_trend)" class="mr-1"></i>
                  {{ Math.abs(reportMetrics.views_trend) }}% from previous period
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h4>Performance Trend</h4>
              <div class="card-header-action">
                <div class="btn-group">
                  <button 
                    @click="chartMetric = 'plays'" 
                    :class="['btn', chartMetric === 'plays' ? 'btn-primary' : 'btn-outline-primary']"
                  >
                    Plays
                  </button>
                  <button 
                    @click="chartMetric = 'spend'" 
                    :class="['btn', chartMetric === 'spend' ? 'btn-primary' : 'btn-outline-primary']"
                  >
                    Spend
                  </button>
                  <button 
                    @click="chartMetric = 'engagement'" 
                    :class="['btn', chartMetric === 'engagement' ? 'btn-primary' : 'btn-outline-primary']"
                  >
                    Engagement
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <canvas id="performanceTrendChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h4>Ad Type Distribution</h4>
            </div>
            <div class="card-body">
              <canvas id="adTypeDistributionChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Performance Table -->
      <div class="card">
        <div class="card-header">
          <h4>Video Performance Analysis</h4>
          <div class="card-header-action">
            <div class="input-group" style="width: 250px;">
              <input 
                type="text" 
                v-model="videoSearch" 
                @input="filterVideos"
                class="form-control" 
                placeholder="Search videos..."
              />
              <div class="input-group-append">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Type</th>
                  <th>Plays</th>
                  <th>Total Spend</th>
                  <th>Avg Cost/Play</th>
                  <th>Engagement Rate</th>
                  <th>Performance Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="video in paginatedVideos" :key="video.id">
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
                  <td>{{ formatNumber(video.total_plays) }}</td>
                  <td>{{ formatCurrency(video.total_spend) }}</td>
                  <td>{{ video.total_plays > 0 ? formatCurrency(video.total_spend / video.total_plays) : 'N/A' }}</td>
                  <td>{{ video.engagement_rate }}%</td>
                  <td>
                    <div class="progress" style="height: 20px;">
                      <div 
                        class="progress-bar" 
                        :class="getPerformanceClass(video.performance_score)"
                        :style="{ width: Math.min(video.performance_score || 0, 100) + '%' }"
                      >
                        {{ Math.round(video.performance_score || 0) }}%
                      </div>
                    </div>
                  </td>
                  <td>
                    <button @click="showVideoReport(video)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-chart-bar"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <nav v-if="totalVideoPages > 1" aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: videoCurrentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="videoCurrentPage--">Previous</a>
              </li>
              <li 
                v-for="page in totalVideoPages" 
                :key="page"
                class="page-item" 
                :class="{ active: videoCurrentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="videoCurrentPage = page">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: videoCurrentPage === totalVideoPages }">
                <a class="page-link" href="#" @click.prevent="videoCurrentPage++">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Device Analytics -->
      <div class="card">
        <div class="card-header">
          <h4>Device Analytics</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <canvas id="devicePerformanceChart" width="400" height="200"></canvas>
            </div>
            <div class="col-md-6">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Plays</th>
                      <th>Revenue</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="device in deviceAnalytics" :key="device.id">
                      <td>{{ device.name }}</td>
                      <td>{{ formatNumber(device.total_plays) }}</td>
                      <td>{{ formatCurrency(device.total_revenue) }}</td>
                      <td>
                        <div class="progress" style="height: 15px;">
                          <div 
                            class="progress-bar" 
                            :class="getPerformanceClass(device.performance_score)"
                            :style="{ width: Math.min(device.performance_score || 0, 100) + '%' }"
                          ></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Time Analysis -->
      <div class="card">
        <div class="card-header">
          <h4>Time Analysis</h4>
          <div class="card-header-action">
            <div class="btn-group">
              <button 
                @click="timeAnalysis = 'hourly'" 
                :class="['btn', timeAnalysis === 'hourly' ? 'btn-primary' : 'btn-outline-primary']"
              >
                Hourly
              </button>
              <button 
                @click="timeAnalysis = 'daily'" 
                :class="['btn', timeAnalysis === 'daily' ? 'btn-primary' : 'btn-outline-primary']"
              >
                Daily
              </button>
              <button 
                @click="timeAnalysis = 'weekly'" 
                :class="['btn', timeAnalysis === 'weekly' ? 'btn-primary' : 'btn-outline-primary']"
              >
                Weekly
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <canvas id="timeAnalysisChart" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Video Report Modal -->
      <div v-if="showVideoModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeVideoModal">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Video Performance Report - {{ selectedVideo?.title }}</h5>
              <button type="button" class="btn-close" @click="closeVideoModal"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedVideo" class="row">
                <div class="col-md-6">
                  <h6>Basic Information</h6>
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Title:</strong></td>
                        <td>{{ selectedVideo.title }}</td>
                      </tr>
                      <tr>
                        <td><strong>Type:</strong></td>
                        <td>
                          <span :class="getAdTypeBadgeClass(selectedVideo.ad_type)" class="badge">
                            {{ selectedVideo.ad_type?.toUpperCase() }}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Duration:</strong></td>
                        <td>{{ formatDuration(selectedVideo.duration_seconds) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Created:</strong></td>
                        <td>{{ formatDateTime(selectedVideo.created_at) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6>Performance Metrics</h6>
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Total Plays:</strong></td>
                        <td>{{ formatNumber(selectedVideo.total_plays) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Total Spend:</strong></td>
                        <td>{{ formatCurrency(selectedVideo.total_spend) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Engagement Rate:</strong></td>
                        <td>{{ selectedVideo.engagement_rate }}%</td>
                      </tr>
                    </tbody>
                    
                  </table>
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-12">
                  <h6>Daily Performance</h6>
                  <canvas id="videoDailyChart" width="400" height="150"></canvas>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeVideoModal">Close</button>
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

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Reactive data
const reportMetrics = ref({
  total_plays: 0,
  total_spend: 0,
  engagement_rate: 0,
  unique_views: 0,
  plays_trend: 0,
  spend_trend: 0,
  engagement_trend: 0,
  views_trend: 0
});

const videoReports = ref([]);
const deviceAnalytics = ref([]);
const performanceTrendData = ref([]);
const timeAnalysisData = ref({});

// Filters
const reportPeriod = ref('30d');
const customStartDate = ref('');
const customEndDate = ref('');
const reportType = ref('overview');
const chartMetric = ref('plays');
const timeAnalysis = ref('daily');
const videoSearch = ref('');
const videoCurrentPage = ref(1);
const itemsPerPage = 10;

// Modals
const showVideoModal = ref(false);
const selectedVideo = ref(null);

// Loading states
const isLoading = ref(false);
const isExporting = ref(false);

// Chart instances
const performanceTrendChart = ref(null);
const adTypeDistributionChart = ref(null);
const devicePerformanceChart = ref(null);
const timeAnalysisChart = ref(null);
const videoDailyChart = ref(null);

// Navigation function
const navigateTo = (path) => {
  router.push(path);
};

// Fetch report data
const fetchReportData = async () => {
  isLoading.value = true;
  try {
    const accessToken = localStorage.getItem('access_token');
    let url = `${apiUrl}/api/brand/dashboard/reports?`;

    // Add period or custom date range
    if (reportPeriod.value === 'custom' && customStartDate.value && customEndDate.value) {
      url += `date_from=${customStartDate.value}&date_to=${customEndDate.value}`;
    } else {
      url += `period=${reportPeriod.value}`;
    }

    const response = await fetchWithAuth(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      // Update metrics with backend data structure
      reportMetrics.value = {
        total_plays: data.data.metrics.total_plays || 0,
        total_spend: data.data.metrics.total_cost || 0,
        engagement_rate: Math.round(data.data.metrics.avg_completion_rate || 0),
        unique_views: data.data.metrics.unique_devices || 0,
        plays_trend: data.data.metrics.plays_trend || 0,
        spend_trend: data.data.metrics.cost_trend || 0,
        engagement_trend: 0, // Backend doesn't provide this yet
        views_trend: 0 // Backend doesn't provide this yet
      };

      // Update video reports with enhanced data
      videoReports.value = (data.data.video_performance || []).map(video => ({
        id: video.video_id,
        title: video.video_title,
        ad_type: video.ad_type,
        total_plays: video.plays,
        unique_views: video.unique_devices || 0,
        total_spend: video.cost,
        engagement_rate: Math.round(video.completion_rate || 0),
        performance_score: video.completion_rate || 0, // Use completion rate as performance score
        duration_seconds: 0, // Backend doesn't provide this in reports
        created_at: new Date().toISOString() // Placeholder
      }));

      // Update device analytics
      deviceAnalytics.value = (data.data.device_analytics || []).map(device => ({
        id: device.device_id,
        name: device.device_id,
        total_plays: device.plays,
        total_revenue: device.cost,
        performance_score: device.plays > 0 ? Math.min((device.cost / device.plays) * 10, 100) : 0
      }));

      // Store chart data
      performanceTrendData.value = data.data.performance_trend || [];
      timeAnalysisData.value = data.data.time_analysis || {};
    } else {
      $toast.error(data.message || 'Failed to fetch report data', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    $toast.error('Failed to fetch report data', { duration: 5000, position: 'top-right' });
  } finally {
    isLoading.value = false;
  }
};

// Update reports
const updateReports = async () => {
  await fetchReportData();
  await nextTick();
  renderAllCharts();
};

// Filter videos
const filteredVideos = computed(() => {
  let filtered = [...videoReports.value];
  
  if (videoSearch.value) {
    const query = videoSearch.value.toLowerCase();
    filtered = filtered.filter(video => 
      video.title?.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query)
    );
  }
  
  return filtered.sort((a, b) => b.total_plays - a.total_plays);
});

const paginatedVideos = computed(() => {
  const start = (videoCurrentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredVideos.value.slice(start, end);
});

const totalVideoPages = computed(() => {
  return Math.ceil(filteredVideos.value.length / itemsPerPage);
});

const filterVideos = () => {
  videoCurrentPage.value = 1;
};

// Show video report
const showVideoReport = (video) => {
  selectedVideo.value = video;
  showVideoModal.value = true;
  nextTick(() => {
    renderVideoDailyChart();
  });
};

const closeVideoModal = () => {
  showVideoModal.value = false;
  selectedVideo.value = null;
};

// Export functions
const exportReport = async () => {
  isExporting.value = true;
  try {
    const csvData = generateCSVData();
    downloadCSV(csvData, `brand-report-${reportPeriod.value}-${new Date().toISOString().split('T')[0]}.csv`);
    $toast.success('Report exported successfully!', { duration: 3000, position: 'top-right' });
  } catch (error) {
    console.error('Export error:', error);
    $toast.error('Failed to export report', { duration: 5000, position: 'top-right' });
  } finally {
    isExporting.value = false;
  }
};

const generatePDF = () => {
  $toast.info('PDF generation will be available soon!', { duration: 3000, position: 'top-right' });
  // PDF generation would require additional libraries like jsPDF or puppeteer
  // This is a placeholder for future implementation
};

// Generate CSV data
const generateCSVData = () => {
  const headers = ['Report Type', 'Period', 'Generated Date', 'Total Plays', 'Total Spend', 'Engagement Rate', 'Unique Views'];
  const data = [
    ['Performance Report', reportPeriod.value, new Date().toLocaleString(),
     reportMetrics.value.total_plays, reportMetrics.value.total_spend,
     `${reportMetrics.value.engagement_rate}%`, reportMetrics.value.unique_views]
  ];

  // Add video performance data
  data.push([''], ['', '', '', '', '', '', '']); // Empty row for separation
  data.push(['Video Performance Report']);
  data.push(['Video Title', 'Ad Type', 'Plays', 'Unique Views', 'Total Spend', 'Engagement Rate', 'Performance Score']);

  videoReports.value.forEach(video => {
    data.push([
      video.title,
      video.ad_type?.toUpperCase() || 'N/A',
      video.total_plays,
      video.unique_views,
      video.total_spend,
      `${video.engagement_rate}%`,
      `${Math.round(video.performance_score || 0)}%`
    ]);
  });

  // Add device analytics data
  data.push([''], ['', '', '', '', '', '', '']); // Empty row for separation
  data.push(['Device Analytics Report']);
  data.push(['Device ID', 'Device Name', 'Plays', 'Revenue', 'Performance Score']);

  deviceAnalytics.value.forEach(device => {
    data.push([
      device.id,
      device.name,
      device.total_plays,
      device.total_revenue,
      `${Math.round(device.performance_score || 0)}%`
    ]);
  });

  return { headers, data };
};

// Download CSV file
const downloadCSV = (csvData, filename) => {
  let csvContent = csvData.headers.join(',') + '\n';

  csvData.data.forEach(row => {
    // Escape commas and quotes in data
    const escapedRow = row.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    });
    csvContent += escapedRow.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Render all charts
const renderAllCharts = () => {
  renderPerformanceTrendChart();
  renderAdTypeDistributionChart();
  renderDevicePerformanceChart();
  renderTimeAnalysisChart();
};

const renderPerformanceTrendChart = () => {
  const canvas = document.getElementById('performanceTrendChart');
  if (!canvas) return;

  // Destroy existing chart if it exists
  if (performanceTrendChart.value) {
    performanceTrendChart.value.destroy();
  }

  const ctx = canvas.getContext('2d');

  // Prepare data from API response
  const chartData = performanceTrendData.value.length > 0 ? performanceTrendData.value : [
    { date: '2024-01-01', plays: 45, cost: 12.5 },
    { date: '2024-01-02', plays: 52, cost: 14.2 },
    { date: '2024-01-03', plays: 38, cost: 10.8 },
    { date: '2024-01-04', plays: 65, cost: 18.3 },
    { date: '2024-01-05', plays: 48, cost: 13.7 },
    { date: '2024-01-06', plays: 72, cost: 20.1 },
    { date: '2024-01-07', plays: 58, cost: 16.4 }
  ];

  const labels = chartData.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  let dataset1, dataset2, label1, label2;

  if (chartMetric.value === 'plays') {
    dataset1 = chartData.map(d => d.plays);
    label1 = 'Total Plays';
    dataset2 = null;
    label2 = null;
  } else if (chartMetric.value === 'spend') {
    dataset1 = chartData.map(d => d.cost);
    label1 = 'Total Spend (Rp)';
    dataset2 = null;
    label2 = null;
  } else {
    // engagement - calculate engagement rate
    dataset1 = chartData.map(d => d.plays > 0 ? Math.min((d.cost / d.plays) * 100, 100) : 0);
    label1 = 'Engagement Rate (%)';
    dataset2 = null;
    label2 = null;
  }

  const datasets = [{
    label: label1,
    data: dataset1,
    borderColor: '#6777ef',
    backgroundColor: 'rgba(103, 119, 239, 0.1)',
    tension: 0.4,
    fill: true
  }];

  if (dataset2) {
    datasets.push({
      label: label2,
      data: dataset2,
      borderColor: '#28a745',
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      tension: 0.4,
      fill: true
    });
  }

  performanceTrendChart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (chartMetric.value === 'spend') {
                return 'Rp' + value.toLocaleString('id-ID');
              } else if (chartMetric.value === 'engagement') {
                return value + '%';
              }
              return value;
            }
          }
        }
      }
    }
  });
};

const renderAdTypeDistributionChart = () => {
  const canvas = document.getElementById('adTypeDistributionChart');
  if (!canvas) return;

  // Destroy existing chart if it exists
  if (adTypeDistributionChart.value) {
    adTypeDistributionChart.value.destroy();
  }

  const ctx = canvas.getContext('2d');

  // Calculate ad type distribution from video reports
  const adTypeCounts = {};
  videoReports.value.forEach(video => {
    const type = video.ad_type || 'unknown';
    adTypeCounts[type] = (adTypeCounts[type] || 0) + video.total_plays;
  });

  // Default data if no videos
  if (Object.keys(adTypeCounts).length === 0) {
    adTypeCounts['general'] = 60;
    adTypeCounts['perfume'] = 40;
  }

  const labels = Object.keys(adTypeCounts).map(key => key.charAt(0).toUpperCase() + key.slice(1));
  const data = Object.values(adTypeCounts);
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];

  adTypeDistributionChart.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
            }
          }
        }
      }
    }
  });
};

const renderDevicePerformanceChart = () => {
  const canvas = document.getElementById('devicePerformanceChart');
  if (!canvas) return;

  // Destroy existing chart if it exists
  if (devicePerformanceChart.value) {
    devicePerformanceChart.value.destroy();
  }

  const ctx = canvas.getContext('2d');

  // Get top 5 devices by plays
  const topDevices = deviceAnalytics.value.slice(0, 5);

  if (topDevices.length === 0) {
    // Show empty state
    devicePerformanceChart.value = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['No Data'],
        datasets: [{
          label: 'Total Plays',
          data: [0],
          backgroundColor: '#6777ef'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
    return;
  }

  const labels = topDevices.map(device =>
    device.name.length > 10 ? device.name.substring(0, 10) + '...' : device.name
  );
  const playsData = topDevices.map(device => device.total_plays);
  const revenueData = topDevices.map(device => device.total_revenue);

  devicePerformanceChart.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Plays',
          data: playsData,
          backgroundColor: '#6777ef',
          borderColor: '#6777ef',
          borderWidth: 1
        },
        {
          label: 'Revenue (Rp)',
          data: revenueData,
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  });
};

const renderTimeAnalysisChart = () => {
  const canvas = document.getElementById('timeAnalysisChart');
  if (!canvas) return;

  // Destroy existing chart if it exists
  if (timeAnalysisChart.value) {
    timeAnalysisChart.value.destroy();
  }

  const ctx = canvas.getContext('2d');

  let labels = [];
  let data = [];
  let title = '';

  // Get data from API response based on time analysis type
  if (timeAnalysis.value === 'hourly' && timeAnalysisData.value.hourly) {
    // Hourly data from backend
    labels = timeAnalysisData.value.hourly.map(h => h.hour + ':00');
    data = timeAnalysisData.value.hourly.map(h => h.plays);
    title = 'Hourly Performance (Avg)';
  } else if (timeAnalysis.value === 'daily') {
    // Use performance_trend data for daily view
    if (performanceTrendData.value && performanceTrendData.value.length > 0) {
       labels = performanceTrendData.value.map(d => {
         const date = new Date(d.date);
         return date.toLocaleDateString('en-US', { weekday: 'short' });
       });
       data = performanceTrendData.value.map(d => d.plays);
    } else {
       // Fallback if no trend data
       labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
       data = [0, 0, 0, 0, 0, 0, 0];
    }
    title = 'Daily Performance';
  } else if (timeAnalysis.value === 'weekly') {
    // Aggregate performance_trend data by week
    if (performanceTrendData.value && performanceTrendData.value.length > 0) {
      const weeklyMap = {};
      performanceTrendData.value.forEach(d => {
        const date = new Date(d.date);
        // Simple week number calculation
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const weekLabel = `Week ${weekNum}`;
        
        weeklyMap[weekLabel] = (weeklyMap[weekLabel] || 0) + d.plays;
      });
      labels = Object.keys(weeklyMap);
      data = Object.values(weeklyMap);
    } else {
       labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
       data = [0, 0, 0, 0];
    }
    title = 'Weekly Performance';
  }

  timeAnalysisChart.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Plays',
        data: data,
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: title
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  });
};

const renderVideoDailyChart = () => {
  const canvas = document.getElementById('videoDailyChart');
  if (!canvas) return;

  // Destroy existing chart if it exists
  if (videoDailyChart.value) {
    videoDailyChart.value.destroy();
  }

  const ctx = canvas.getContext('2d');

  // Get last 7 days performance data for selected video
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  const labels = [];
  const playsData = [];
  const costData = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    labels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    // Use performance trend data if available, otherwise generate sample data
    const dayData = performanceTrendData.value.find(d =>
      new Date(d.date).toDateString() === currentDate.toDateString()
    );

    if (dayData) {
      playsData.push(dayData.plays);
      costData.push(dayData.cost);
    } else {
      // Sample data for demonstration
      playsData.push(Math.floor(Math.random() * 100) + 20);
      costData.push(Math.random() * 20 + 5);
    }
  }

  videoDailyChart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Daily Plays',
          data: playsData,
          borderColor: '#6777ef',
          backgroundColor: 'rgba(103, 119, 239, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Daily Cost (Rp)',
          data: costData,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: selectedVideo.value ? `Last 7 Days - ${selectedVideo.value.title}` : 'Last 7 Days Performance'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Plays'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Cost (Rp)'
          },
          grid: {
            drawOnChartArea: false,
          }
        }
      }
    }
  });
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

const getTrendIcon = (trend) => {
  if (trend > 0) return 'fas fa-arrow-up text-success';
  if (trend < 0) return 'fas fa-arrow-down text-danger';
  return 'fas fa-minus text-muted';
};

const getAdTypeBadgeClass = (type) => {
  switch (type) {
    case 'general': return 'badge-primary';
    case 'perfume': return 'badge-success';
    default: return 'badge-secondary';
  }
};

const getPerformanceClass = (score) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-danger';
};

// Cleanup function to destroy charts
const cleanupCharts = () => {
  if (performanceTrendChart.value) {
    performanceTrendChart.value.destroy();
    performanceTrendChart.value = null;
  }
  if (adTypeDistributionChart.value) {
    adTypeDistributionChart.value.destroy();
    adTypeDistributionChart.value = null;
  }
  if (devicePerformanceChart.value) {
    devicePerformanceChart.value.destroy();
    devicePerformanceChart.value = null;
  }
  if (timeAnalysisChart.value) {
    timeAnalysisChart.value.destroy();
    timeAnalysisChart.value = null;
  }
  if (videoDailyChart.value) {
    videoDailyChart.value.destroy();
    videoDailyChart.value = null;
  }
};

// Lifecycle
onMounted(async () => {
  await fetchReportData();
  await nextTick();
  renderAllCharts();
});

// Watch for changes in chart metric and time analysis
watch(chartMetric, () => {
  if (!isLoading.value) {
    nextTick(() => {
      renderPerformanceTrendChart();
    });
  }
});

watch(timeAnalysis, () => {
  if (!isLoading.value) {
    nextTick(() => {
      renderTimeAnalysisChart();
    });
  }
});

// Cleanup on unmount
onUnmounted(() => {
  cleanupCharts();
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

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  transition: width 0.6s ease;
}
</style>
