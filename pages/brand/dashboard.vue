<template>
  <section class="section">
    <div class="section-header">
      <h1>Brand Dashboard</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Brand Overview</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">{{ brandInfo.name }} Analytics</h2>
      <p class="section-lead">Your advertising performance and video management</p>
      
      <!-- Brand Statistics Cards -->
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-video"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>My Videos</h4></div>
              <div class="card-body">{{ brandStats.totalVideos }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-play-circle"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Plays</h4></div>
              <div class="card-body">{{ brandStats.totalPlays }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-coins"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Balance</h4></div>
              <div class="card-body">{{ brandStats.balance }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-clock"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Playtime</h4></div>
              <div class="card-body">{{ formatDuration(brandStats.totalPlaytime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance Management -->
      <div class="row">
        <div class="col-lg-4 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>Balance Management</h4>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Current Balance</span>
                  <span class="h4 mb-0 text-primary">{{ brandStats.balance }}</span>
                </div>
                <div class="progress mb-3" style="height: 8px;">
                  <div class="progress-bar bg-primary" :style="{width: balancePercentage + '%'}"></div>
                </div>
                <small class="text-muted">{{ balancePercentage }}% of recommended balance</small>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Top Up Amount</label>
                <div class="input-group">
                  <input type="number" class="form-control" v-model="topUpAmount" placeholder="Enter amount">
                  <div class="input-group-append">
                    <button class="btn btn-primary" @click="topUpBalance" :disabled="!topUpAmount || topUpAmount <= 0">
                      Top Up
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>Note:</strong> 1 balance = 15 seconds of ad display time
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-8 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>Video Performance</h4>
              <div class="card-header-action">
                <div class="dropdown">
                  <a href="#" data-toggle="dropdown" class="btn btn-warning dropdown-toggle">Period</a>
                  <div class="dropdown-menu">
                    <a href="#" class="dropdown-item" @click="changePeriod('7d')">Last 7 Days</a>
                    <a href="#" class="dropdown-item" @click="changePeriod('30d')">Last 30 Days</a>
                    <a href="#" class="dropdown-item" @click="changePeriod('90d')">Last 90 Days</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <canvas id="performanceChart" height="100"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Management and Slot Assignment -->
      <div class="row">
        <div class="col-lg-8 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>My Videos</h4>
              <div class="card-header-action">
                <a href="/brand/videos/upload" class="btn btn-primary">
                  <i class="fas fa-plus"></i> Upload Video
                </a>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Plays</th>
                      <th>Last Played</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="video in brandVideos" :key="video.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-sm mr-2">
                            <img :src="video.thumbnail || '/img/video-placeholder.png'" alt="Video Thumbnail">
                          </div>
                          <div>
                            <div class="font-weight-600">{{ video.title }}</div>
                            <div class="text-muted small">{{ video.filename }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="video.adType === 'perfume' ? 'badge-primary' : 'badge-success'">
                          {{ video.adType }}
                        </span>
                      </td>
                      <td>{{ formatDuration(video.durationSeconds) }}</td>
                      <td>
                        <span class="badge" :class="getStatusClass(video.status)">
                          {{ video.status }}
                        </span>
                      </td>
                      <td>{{ video.playCount || 0 }}</td>
                      <td>{{ formatDate(video.lastPlayed) }}</td>
                      <td>
                        <div class="dropdown">
                          <a href="#" data-toggle="dropdown" class="btn btn-sm btn-outline-primary dropdown-toggle">Actions</a>
                          <div class="dropdown-menu">
                            <a href="#" class="dropdown-item" @click="viewVideoDetails(video.id)">View Details</a>
                            <a href="#" class="dropdown-item" @click="requestSlotAssignment(video.id)">Request Slot</a>
                            <a href="#" class="dropdown-item" @click="editVideo(video.id)">Edit</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>Slot Assignments</h4>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div v-for="assignment in slotAssignments" :key="assignment.id" class="list-group-item px-0">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">{{ assignment.video?.title }}</h6>
                      <p class="mb-1 text-muted small">{{ assignment.slot?.name }}</p>
                      <small class="text-muted">{{ assignment.slot?.startTime }} - {{ assignment.slot?.endTime }}</small>
                    </div>
                    <span class="badge" :class="getAssignmentStatusClass(assignment.status)">
                      {{ assignment.status }}
                    </span>
                  </div>
                </div>
                <div v-if="slotAssignments.length === 0" class="text-center py-3 text-muted">
                  <i class="fas fa-calendar-times fa-2x mb-2"></i>
                  <p>No slot assignments yet</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mt-3">
            <div class="card-header">
              <h4>Quick Stats</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-6">
                  <div class="text-center">
                    <div class="h4 mb-0 text-primary">{{ brandStats.activeVideos }}</div>
                    <small class="text-muted">Active Videos</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center">
                    <div class="h4 mb-0 text-success">{{ brandStats.avgPlaytime }}</div>
                    <small class="text-muted">Avg. Playtime</small>
                  </div>
                </div>
              </div>
              <hr>
              <div class="row">
                <div class="col-6">
                  <div class="text-center">
                    <div class="h4 mb-0 text-warning">{{ brandStats.pendingAssignments }}</div>
                    <small class="text-muted">Pending Slots</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center">
                    <div class="h4 mb-0 text-info">{{ brandStats.completedAssignments }}</div>
                    <small class="text-muted">Completed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Recent Activity</h4>
            </div>
            <div class="card-body">
              <div class="activities">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity">
                  <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-detail">
                    <div class="mb-2">
                      <span class="text-job">{{ formatDate(activity.createdAt) }}</span>
                      <span class="bullet"></span>
                      <span class="text-job">{{ activity.type }}</span>
                    </div>
                    <p>{{ activity.description }}</p>
                  </div>
                </div>
                <div v-if="recentActivities.length === 0" class="text-center py-3 text-muted">
                  <i class="fas fa-history fa-2x mb-2"></i>
                  <p>No recent activities</p>
                </div>
              </div>
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

import { ref, onMounted, computed, nextTick } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Reactive data
const brandInfo = ref({
  id: null,
  name: '',
  type: ''
})

const brandStats = ref({
  totalVideos: 0,
  totalPlays: 0,
  balance: 0,
  totalPlaytime: 0,
  activeVideos: 0,
  avgPlaytime: '0:00',
  pendingAssignments: 0,
  completedAssignments: 0
})

const brandVideos = ref([])
const slotAssignments = ref([])
const recentActivities = ref([])
const performanceData = ref([])
const topUpAmount = ref(null)
const selectedPeriod = ref('7d')

// Chart instance
let performanceChart = null

// Computed properties
const balancePercentage = computed(() => {
  const recommended = 1000 // Recommended balance
  return Math.min((brandStats.value.balance / recommended) * 100, 100)
})

// Fetch brand dashboard data
const fetchBrandData = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const headers = { 'Authorization': `Bearer ${accessToken}` }

    // Fetch brand info and stats
    const statsRes = await fetchWithAuth(`${apiUrl}/api/brand/dashboard`, { headers })
    const statsData = await statsRes.json()
    
    if (statsData.success) {
      brandInfo.value = statsData.data.brandInfo || {}
      brandStats.value = {
        ...brandStats.value,
        ...statsData.data.stats
      }
    }

    // Fetch brand videos
    const videosRes = await fetchWithAuth(`${apiUrl}/api/videos`, { headers })
    const videosData = await videosRes.json()
    
    if (videosData.success) {
      brandVideos.value = videosData.data || []
    }

    // Fetch slot assignments
    const assignmentsRes = await fetchWithAuth(`${apiUrl}/api/slot-assignments`, { headers })
    const assignmentsData = await assignmentsRes.json()
    
    if (assignmentsData.success) {
      slotAssignments.value = assignmentsData.data || []
    }

    // Fetch performance data
    const performanceRes = await fetchWithAuth(`${apiUrl}/api/analytics/brand/performance?period=${selectedPeriod.value}`, { headers })
    const performanceDataRes = await performanceRes.json()
    
    if (performanceDataRes.success) {
      performanceData.value = performanceDataRes.data.trend || []
    }

    // Fetch recent activities
    const activitiesRes = await fetchWithAuth(`${apiUrl}/api/brand/activities`, { headers })
    const activitiesData = await activitiesRes.json()
    
    if (activitiesData.success) {
      recentActivities.value = activitiesData.data || []
    }

  } catch (error) {
    console.error('Error fetching brand data:', error)
  }
}

// Initialize performance chart
const initPerformanceChart = async () => {
  await nextTick()
  
  const ctx = document.getElementById('performanceChart')
  if (ctx && window.Chart) {
    if (performanceChart) {
      performanceChart.destroy()
    }
    
    performanceChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: performanceData.value.map(d => d.date),
        datasets: [{
          label: 'Video Plays',
          data: performanceData.value.map(d => d.plays),
          borderColor: '#6777ef',
          backgroundColor: 'rgba(103, 119, 239, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Playtime (minutes)',
          data: performanceData.value.map(d => d.playtime / 60),
          borderColor: '#47c363',
          backgroundColor: 'rgba(71, 195, 99, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

// Action handlers
const topUpBalance = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/balance/topup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        amount: parseFloat(topUpAmount.value),
        reference: `Top-up-${Date.now()}`
      })
    })
    
    const data = await response.json()
    if (data.success) {
      brandStats.value.balance = data.data.newBalance
      topUpAmount.value = null
      // Refresh the dashboard data to show updated balance
      await fetchBrandData()
      // Show success message (you can add a toast notification here)
      console.log('Balance topped up successfully!')
    } else {
      console.error('Top-up failed:', data.error)
    }
  } catch (error) {
    console.error('Error topping up balance:', error)
  }
}

const changePeriod = async (period) => {
  selectedPeriod.value = period
  await fetchBrandData()
  await initPerformanceChart()
}

const viewVideoDetails = (videoId) => {
  navigateTo(`/brand/videos/${videoId}`)
}

const requestSlotAssignment = (videoId) => {
  navigateTo(`/brand/slot-requests/create?video_id=${videoId}`)
}

const editVideo = (videoId) => {
  navigateTo(`/brand/videos/${videoId}/edit`)
}

// Utility functions
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active': return 'badge-success'
    case 'pending': return 'badge-warning'
    case 'inactive': return 'badge-secondary'
    default: return 'badge-light'
  }
}

const getAssignmentStatusClass = (status) => {
  switch (status) {
    case 'approved': return 'badge-success'
    case 'pending': return 'badge-warning'
    case 'rejected': return 'badge-danger'
    default: return 'badge-light'
  }
}

const getActivityIconClass = (type) => {
  switch (type) {
    case 'video_upload': return 'bg-primary'
    case 'slot_request': return 'bg-warning'
    case 'balance_topup': return 'bg-success'
    case 'video_play': return 'bg-info'
    default: return 'bg-secondary'
  }
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'video_upload': return 'fas fa-upload'
    case 'slot_request': return 'fas fa-calendar-plus'
    case 'balance_topup': return 'fas fa-coins'
    case 'video_play': return 'fas fa-play'
    default: return 'fas fa-info'
  }
}

// Lifecycle
onMounted(async () => {
  await fetchBrandData()
  setTimeout(initPerformanceChart, 500)
})
</script>

<style scoped>
.card-statistic-1 {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 2rem;
  padding: 20px;
  color: #fff;
  border-radius: 5px 0 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

.bg-primary { background: #6777ef; }
.bg-success { background: #47c363; }
.bg-warning { background: #ffa426; }
.bg-info { background: #3abaf4; }

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activities .activity {
  display: flex;
  margin-bottom: 20px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 15px;
  flex-shrink: 0;
}

.activity-detail {
  flex: 1;
}

.text-job {
  font-size: 0.875rem;
  color: #6c757d;
}

.bullet {
  display: inline-block;
  width: 4px;
  height: 4px;
  background: #6c757d;
  border-radius: 50%;
  margin: 0 8px;
  vertical-align: middle;
}

.progress {
  background-color: #e9ecef;
  border-radius: 0.25rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>