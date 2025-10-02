<template>
  <section class="section">
    <div class="section-header">
      <h1>Admin Dashboard</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Admin Overview</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">System Overview</h2>
      <p class="section-lead">Comprehensive analytics for advertising and APK release systems</p>
      
      <!-- Statistics Cards -->
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-video"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Videos</h4></div>
              <div class="card-body">{{ stats.totalVideos }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-clock"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Active Slots</h4></div>
              <div class="card-body">{{ stats.activeSlots }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-building"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Brands</h4></div>
              <div class="card-body">{{ stats.totalBrands }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-coins"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Balance</h4></div>
              <div class="card-body">{{ stats.totalBalance }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- APK Release Statistics -->
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-danger"><i class="fas fa-mobile-alt"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total APKs</h4></div>
              <div class="card-body">{{ apkStats.totalAPKs }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-download"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Latest APKs</h4></div>
              <div class="card-body">{{ apkStats.latestAPKs }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-archive"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Deprecated APKs</h4></div>
              <div class="card-body">{{ apkStats.deprecatedAPKs }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-chart-pie"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Downloads</h4></div>
              <div class="card-body">{{ apkStats.totalDownloads }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row">
        <div class="col-lg-8 col-md-12 col-12 col-sm-12">
          <div class="card">
            <div class="card-header">
              <h4>Video Playback Analytics</h4>
              <div class="card-header-action">
                <div class="dropdown">
                  <a href="#" data-toggle="dropdown" class="btn btn-warning dropdown-toggle">Options</a>
                  <div class="dropdown-menu">
                    <a href="#" class="dropdown-item">Last 7 Days</a>
                    <a href="#" class="dropdown-item">Last 30 Days</a>
                    <a href="#" class="dropdown-item">This Year</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <canvas id="playbackChart" height="100"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-12 col-12 col-sm-12">
          <div class="card">
            <div class="card-header">
              <h4>Ad Type Distribution</h4>
            </div>
            <div class="card-body">
              <canvas id="adTypeChart" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- APK Release Distribution -->
      <div class="row">
        <div class="col-lg-6 col-md-12 col-12 col-sm-12">
          <div class="card">
            <div class="card-header">
              <h4>APK Release Distribution</h4>
            </div>
            <div class="card-body">
              <canvas id="apkDistributionChart" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-6 col-md-12 col-12 col-sm-12">
          <div class="card">
            <div class="card-header">
              <h4>Recent APK Releases</h4>
              <div class="card-header-action">
                <a href="/admin/apk-releases" class="btn btn-primary">View All APKs</a>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>App Name</th>
                      <th>Version</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="apk in recentAPKs" :key="apk.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-sm mr-2">
                            <i class="fas fa-mobile-alt text-primary"></i>
                          </div>
                          <div>
                            <div class="font-weight-600">{{ apk.app_name }}</div>
                          </div>
                        </div>
                      </td>
                      <td>{{ apk.version_name }}</td>
                      <td>
                        <span v-if="apk.is_latest" class="badge badge-success">Latest</span>
                        <span v-if="apk.is_deprecated" class="badge badge-danger">Deprecated</span>
                        <span v-if="!apk.is_latest && !apk.is_deprecated" class="badge badge-secondary">Old Version</span>
                      </td>
                      <td>{{ formatDate(apk.created_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slot Usage and Brand Performance -->
      <div class="row">
        <div class="col-lg-6 col-md-12 col-12 col-sm-12">
          <div class="card">
            <div class="card-header">
              <h4>Slot Usage Today</h4>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      <th>Perfume Ads</th>
                      <th>General Ads</th>
                      <th>Usage %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="slot in slotUsage" :key="slot.id">
                      <td>{{ slot.timeSlot }}</td>
                      <td>
                        <div class="progress" style="height: 6px;">
                          <div class="progress-bar bg-primary" :style="{width: slot.perfumeUsage + '%'}"></div>
                        </div>
                        <small>{{ slot.perfumeUsage }}%</small>
                      </td>
                      <td>
                        <div class="progress" style="height: 6px;">
                          <div class="progress-bar bg-success" :style="{width: slot.generalUsage + '%'}"></div>
                        </div>
                        <small>{{ slot.generalUsage }}%</small>
                      </td>
                      <td>
                        <span class="badge" :class="slot.totalUsage > 80 ? 'badge-success' : slot.totalUsage > 50 ? 'badge-warning' : 'badge-danger'">
                          {{ slot.totalUsage }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 col-md-12 col-12 col-sm-12">
          <div class="card">
            <div class="card-header">
              <h4>Top Performing Brands</h4>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Videos</th>
                      <th>Playtime</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="brand in topBrands" :key="brand.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-sm mr-2">
                            <img :src="brand.logo || '/img/avatar/avatar-1.png'" alt="Brand Logo">
                          </div>
                          <div>
                            <div class="font-weight-600">{{ brand.name }}</div>
                            <div class="text-muted small">{{ brand.type }}</div>
                          </div>
                        </div>
                      </td>
                      <td>{{ brand.videoCount }}</td>
                      <td>{{ formatDuration(brand.totalPlaytime) }}</td>
                      <td>
                        <span class="badge" :class="brand.balance > 100 ? 'badge-success' : brand.balance > 50 ? 'badge-warning' : 'badge-danger'">
                          {{ brand.balance }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Recent Video Activities</h4>
              <div class="card-header-action">
                <a href="/admin/videos" class="btn btn-primary">View All Videos</a>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Brand</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Last Played</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="video in recentVideos" :key="video.id">
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
                      <td>{{ video.brand?.name || 'N/A' }}</td>
                      <td>
                        <span class="badge" :class="video.adType === 'perfume' ? 'badge-primary' : 'badge-success'">
                          {{ video.adType }}
                        </span>
                      </td>
                      <td>{{ formatDuration(video.durationSeconds) }}</td>
                      <td>
                        <span class="badge" :class="video.status === 'active' ? 'badge-success' : 'badge-warning'">
                          {{ video.status }}
                        </span>
                      </td>
                      <td>{{ formatDate(video.lastPlayed) }}</td>
                      <td>
                        <div class="dropdown">
                          <a href="#" data-toggle="dropdown" class="btn btn-sm btn-outline-primary dropdown-toggle">Actions</a>
                          <div class="dropdown-menu">
                            <a href="#" class="dropdown-item" @click="viewVideo(video.id)">View</a>
                            <a href="#" class="dropdown-item" @click="assignSlot(video.id)">Assign Slot</a>
                            <a href="#" class="dropdown-item text-danger" @click="deactivateVideo(video.id)">Deactivate</a>
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
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'

definePageMeta({
  middleware: 'admin'
})

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Reactive data
const stats = ref({
  totalVideos: 0,
  activeSlots: 0,
  totalBrands: 0,
  totalBalance: 0
})

const apkStats = ref({
  totalAPKs: 0,
  latestAPKs: 0,
  deprecatedAPKs: 0,
  totalDownloads: 0
})

const slotUsage = ref([])
const topBrands = ref([])
const recentVideos = ref([])
const recentAPKs = ref([])
const playbackData = ref([])
const adTypeData = ref([])
const apkDistributionData = ref([])

// Chart instances
let playbackChart = null
let adTypeChart = null
let apkDistributionChart = null

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    // Fetch analytics summary
    const summaryRes = await fetchWithAuth(`${apiUrl}/api/analytics/summary`)
    const summaryData = await summaryRes.json()
    
    if (summaryData.success) {
      stats.value = {
        totalVideos: summaryData.data.totalVideos || 0,
        activeSlots: summaryData.data.activeSlots || 0,
        totalBrands: summaryData.data.totalBrands || 0,
        totalBalance: summaryData.data.totalBalance || 0
      }
    }

    // Fetch APK statistics
    const apkRes = await fetchWithAuth(`${apiUrl}/api/apk-release`)
    const apkData = await apkRes.json()
    
    if (apkData.success) {
      const apkReleases = apkData.data || []
      apkStats.value = {
        totalAPKs: apkReleases.length,
        latestAPKs: apkReleases.filter(apk => apk.is_latest).length,
        deprecatedAPKs: apkReleases.filter(apk => apk.is_deprecated).length,
        totalDownloads: 0 // This would need a separate tracking system
      }
      
      // Get recent APKs (last 5)
      recentAPKs.value = apkReleases
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
      
      // Prepare APK distribution data
      const appDistribution = {}
      apkReleases.forEach(apk => {
        if (!appDistribution[apk.app_name]) {
          appDistribution[apk.app_name] = 0
        }
        appDistribution[apk.app_name]++
      })
      
      apkDistributionData.value = Object.keys(appDistribution).map(appName => ({
        name: appName,
        count: appDistribution[appName]
      }))
    }

    // Fetch slot analytics
    const slotRes = await fetchWithAuth(`${apiUrl}/api/analytics/slot`)
    const slotData = await slotRes.json()
    
    if (slotData.success) {
      slotUsage.value = slotData.data.slotUsage || []
    }

    // Fetch video analytics
    const videoRes = await fetchWithAuth(`${apiUrl}/api/analytics/video`)
    const videoData = await videoRes.json()
    
    if (videoData.success) {
      playbackData.value = videoData.data.playbackTrend || []
      adTypeData.value = videoData.data.adTypeDistribution || []
      topBrands.value = videoData.data.topBrands || []
      recentVideos.value = videoData.data.recentVideos || []
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

// Initialize charts
const initCharts = async () => {
  await nextTick()
  
  // Playback Chart
  const playbackCtx = document.getElementById('playbackChart')
  if (playbackCtx && window.Chart) {
    playbackChart = new window.Chart(playbackCtx, {
      type: 'line',
      data: {
        labels: playbackData.value.map(d => d.date),
        datasets: [{
          label: 'Perfume Ads',
          data: playbackData.value.map(d => d.perfumeCount),
          borderColor: '#6777ef',
          backgroundColor: 'rgba(103, 119, 239, 0.1)',
          tension: 0.4
        }, {
          label: 'General Ads',
          data: playbackData.value.map(d => d.generalCount),
          borderColor: '#47c363',
          backgroundColor: 'rgba(71, 195, 99, 0.1)',
          tension: 0.4
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

  // Ad Type Chart
  const adTypeCtx = document.getElementById('adTypeChart')
  if (adTypeCtx && window.Chart) {
    adTypeChart = new window.Chart(adTypeCtx, {
      type: 'doughnut',
      data: {
        labels: adTypeData.value.map(d => d.type),
        datasets: [{
          data: adTypeData.value.map(d => d.count),
          backgroundColor: ['#6777ef', '#47c363', '#ffa426', '#fc544b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }

  // APK Distribution Chart
  const apkDistributionCtx = document.getElementById('apkDistributionChart')
  if (apkDistributionCtx && window.Chart) {
    apkDistributionChart = new window.Chart(apkDistributionCtx, {
      type: 'pie',
      data: {
        labels: apkDistributionData.value.map(d => d.name),
        datasets: [{
          data: apkDistributionData.value.map(d => d.count),
          backgroundColor: ['#6777ef', '#47c363', '#ffa426', '#fc544b', '#3abaf4', '#f36196']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }
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

// Action handlers
const viewVideo = (videoId) => {
  navigateTo(`/admin/videos/${videoId}`)
}

const assignSlot = (videoId) => {
  navigateTo(`/admin/slot-assignments/create?video_id=${videoId}`)
}

const deactivateVideo = async (videoId) => {
  // Implementation for deactivating video
  console.log('Deactivating video:', videoId)
}

// Lifecycle
onMounted(async () => {
  await fetchDashboardData()
  setTimeout(initCharts, 500) // Delay to ensure DOM is ready
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
.bg-danger { background: #fc544b; }

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.progress {
  background-color: #e9ecef;
  border-radius: 0.25rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #6c757d;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.dropdown-toggle::after {
  margin-left: 0.5rem;
}
</style>