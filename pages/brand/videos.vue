<template>
  <section class="section">
    <div class="section-header">
      <h1>My Videos</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item"><a href="#" @click="navigateTo('/brand/dashboard')">Dashboard</a></div>
        <div class="breadcrumb-item active">My Videos</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Your Advertisement Videos</h2>
      <p class="section-lead">
        View and monitor the performance of all your advertisement videos.
      </p>

      <!-- Summary Cards -->
      <div class="row">
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary">
              <i class="fas fa-video"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Videos</h4>
              </div>
              <div class="card-body">
                {{ videoStats.total_videos }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success">
              <i class="fas fa-play-circle"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Active Videos</h4>
              </div>
              <div class="card-body">
                {{ videoStats.active_videos }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-pause-circle"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Inactive Videos</h4>
              </div>
              <div class="card-body">
                {{ videoStats.inactive_videos }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info">
              <i class="fas fa-eye"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Plays</h4>
              </div>
              <div class="card-body">
                {{ formatNumber(videoStats.total_plays) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="card">
        <div class="card-header">
          <h4>Video Library</h4>
          <div class="card-header-action">
            <div class="input-group" style="width: 300px;">
              <input 
                type="text" 
                v-model="searchQuery" 
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
          <div class="row mb-3">
            <div class="col-md-3">
              <select v-model="filterStatus" @change="filterVideos" class="form-control">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="filterType" @change="filterVideos" class="form-control">
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="perfume">Perfume</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="sortBy" @change="filterVideos" class="form-control">
                <option value="created_at">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="plays">Sort by Plays</option>
                <option value="total_cost">Sort by Spend</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="sortOrder" @change="filterVideos" class="form-control">
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <!-- Video Grid -->
          <div v-if="filteredVideos.length > 0" class="row">
            <div v-for="video in paginatedVideos" :key="video.id" class="col-lg-4 col-md-6 mb-4">
              <div class="card">
                <div class="card-video-thumbnail">
                  <img 
                    :src="video.thumbnail_url || '/img/no-camera.png'" 
                    :alt="video.title"
                    class="card-img-top video-thumbnail"
                  />
                  <div class="video-duration">
                    {{ formatDuration(video.duration_seconds) }}
                  </div>
                  <div class="video-status-overlay">
                    <span :class="getStatusBadgeClass(video.status)" class="badge">
                      {{ video.status?.toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ video.title }}</h5>
                  <p class="card-text text-muted small">{{ video.description }}</p>
                  
                  <div class="video-meta">
                    <div class="row">
                      <div class="col-6">
                        <small class="text-muted">Type:</small><br>
                        <span :class="getAdTypeBadgeClass(video.ad_type)" class="badge">
                          {{ video.ad_type?.toUpperCase() }}
                        </span>
                      </div>
                      <div class="col-6">
                        <small class="text-muted">Plays:</small><br>
                        <strong>{{ formatNumber(video.plays || 0) }}</strong>
                      </div>
                    </div>
                    <div class="row mt-2">
                      <div class="col-6">
                        <small class="text-muted">Spend:</small><br>
                        <strong>{{ formatNumber(video.total_cost || 0) }}</strong>
                      </div>
                      <div class="col-6">
                        <small class="text-muted">Created:</small><br>
                        <strong>{{ formatDate(video.created_at) }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- <div class="mt-3">
                    <div class="progress mb-2" style="height: 8px;">
                      <div 
                        class="progress-bar" 
                        :class="getPerformanceClass(video.performance_score)"
                        :style="{ width: Math.min(video.performance_score || 0, 100) + '%' }"
                      ></div>
                    </div>
                    <small class="text-muted">Performance: {{ Math.round(video.performance_score || 0) }}%</small>
                  </div> -->

                  <div class="mt-3 text-center">
                    <div class="btn-group" role="group">
                      <button @click="showVideoDetails(video)" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-eye mr-1"></i>View Details
                      </button>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-5">
            <i class="fas fa-video fa-4x text-muted mb-3"></i>
            <h5 class="text-muted">No videos found</h5>
            <p class="text-muted">
              {{ searchQuery || filterStatus || filterType ? 'Try adjusting your filters' : 'Contact admin to upload your advertisement videos' }}
            </p>
          </div>

          <!-- Pagination -->
          <nav v-if="totalPages > 1" aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page"
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </section>

  <!-- Video Details Modal -->
  <div v-if="showDetailsModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeDetailsModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Video Details - {{ selectedVideo?.title }}</h5>
          <button type="button" class="btn-close" @click="closeDetailsModal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedVideo" class="row">
            <div class="col-md-6">
              <!-- Video Player -->
              <div class="video-player-container mb-3">
                <video
                  ref="videoPlayer"
                  :src="selectedVideo.video_url || selectedVideo.url"
                  :poster="selectedVideo.thumbnail_url || '/img/no-camera.png'"
                  class="video-player"
                  controls
                  preload="metadata"
                  @error="handleVideoError"
                  @loadedmetadata="handleVideoLoaded"
                >
                  Your browser does not support the video tag.
                </video>
                
                <!-- Video Loading/Error States -->
                <div v-if="videoLoading" class="video-loading-overlay">
                  <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p class="text-muted mt-2">Loading video...</p>
                  </div>
                </div>
                
                <div v-if="videoError" class="video-error-overlay">
                  <div class="error-content">
                    <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                    <p class="text-muted">Failed to load video</p>
                    <button @click="retryVideoLoad" class="btn btn-sm btn-primary">
                      <i class="fas fa-redo mr-1"></i>Retry
                    </button>
                  </div>
                </div>
              </div>
              
              
            </div>
            <div class="col-md-6">
              <h5>{{ selectedVideo.title }}</h5>
              <p class="text-muted">{{ selectedVideo.description }}</p>
              
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Status:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedVideo.status)" class="badge">
                        {{ selectedVideo.status?.toUpperCase() }}
                      </span>
                    </td>
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
                    <td><strong>Total Plays:</strong></td>
                    <td>{{ formatNumber(selectedVideo.plays || 0) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Spend:</strong></td>
                    <td>{{ formatNumber(selectedVideo.total_cost || 0) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Avg Cost/Play:</strong></td>
                    <td>{{ selectedVideo.plays > 0 ? formatNumber(selectedVideo.total_cost / selectedVideo.plays) : 'N/A' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Created:</strong></td>
                    <td>{{ formatDateTime(selectedVideo.created_at) }}</td>
                  </tr>
                </tbody>
                
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeDetailsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'brand'
})

import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Reactive data
const videos = ref([]);
const videoStats = ref({
  total_videos: 0,
  active_videos: 0,
  inactive_videos: 0,
  total_plays: 0
});

// Filters
const searchQuery = ref('');
const filterStatus = ref('');
const filterType = ref('');
const sortBy = ref('created_at');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = 9;

// Modal
const showDetailsModal = ref(false);
const selectedVideo = ref(null);

// Video player states
const videoPlayer = ref(null);
const videoLoading = ref(false);
const videoError = ref(false);

// Navigation function
const navigateTo = (path) => {
  router.push(path);
};

// Fetch videos
const fetchVideos = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/videos`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      // Log the API response to understand the data structure
      console.log('Videos API Response:', data);
      
      // Process videos to ensure they have proper URLs
      const processedVideos = (data.data || []).map(video => {
        console.log(`Processing video ${video.id}:`, {
          title: video.title,
          backend_video_url: video.video_url,
          file_path: video.file_path
        });

        // Use video_url from backend if available, otherwise construct fallback URLs
        if (video.video_url) {
          // Backend provided video URL - use it directly
          console.log(`Using backend video URL for ${video.title}:`, video.video_url);
          return {
            ...video,
            video_url: video.video_url,
            possible_video_urls: [video.video_url]
          };
        } else {
          // Fallback: construct possible URLs if backend doesn't provide one
          const videoId = video.id;
          const possibleUrls = [
            video.file_path ? `${apiUrl}/${video.file_path}` : null,
            `${apiUrl}/api/videos/${videoId}/stream`,
            `${apiUrl}/api/brand/videos/${videoId}/play`,
            `${apiUrl}/uploads/videos/${videoId}.mp4`,
            `${apiUrl}/storage/videos/${videoId}.mp4`
          ].filter(url => url !== null);

          console.log(`Using fallback URLs for ${video.title}:`, possibleUrls);

          return {
            ...video,
            video_url: possibleUrls[0] || null,
            possible_video_urls: possibleUrls
          };
        }
      });
      
      videos.value = processedVideos;
      calculateStats();
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    $toast.error('Failed to fetch videos', { duration: 5000, position: 'top-right' });
  }
};

// Calculate statistics
const calculateStats = () => {
  videoStats.value = {
    total_videos: videos.value.length,
    active_videos: videos.value.filter(v => v.status === 'active').length,
    inactive_videos: videos.value.filter(v => v.status === 'inactive').length,
    total_plays: videos.value.reduce((sum, v) => sum + (v.plays || 0), 0)
  };
};

// Filter and sort videos
const filteredVideos = computed(() => {
  let filtered = [...videos.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(video => 
      video.title?.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (filterStatus.value) {
    filtered = filtered.filter(video => video.status === filterStatus.value);
  }

  // Type filter
  if (filterType.value) {
    filtered = filtered.filter(video => video.ad_type === filterType.value);
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue = a[sortBy.value] || '';
    let bValue = b[sortBy.value] || '';

    if (sortBy.value === 'plays' || sortBy.value === 'total_cost') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filtered;
});

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredVideos.value.length / itemsPerPage);
});

const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredVideos.value.slice(start, end);
});

// Filter videos
const filterVideos = () => {
  currentPage.value = 1;
};

// Show video details
const showVideoDetails = (video) => {
  selectedVideo.value = video;
  showDetailsModal.value = true;
  
  // Try to load video with fallback URLs when modal opens
  nextTick(() => {
    tryLoadVideoWithFallback();
  });
};

// Close details modal
const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedVideo.value = null;
  videoError.value = false;
  videoLoading.value = false;
  
  // Stop video playback when modal closes
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
};

// Video player functions
const handleVideoError = () => {
  videoLoading.value = false;
  videoError.value = true;
  console.error('Video failed to load');
};

const handleVideoLoaded = () => {
  videoLoading.value = false;
  videoError.value = false;
  console.log('Video loaded successfully');
};

const retryVideoLoad = async () => {
  videoError.value = false;
  videoLoading.value = true;
  
  if (videoPlayer.value && selectedVideo.value) {
    // Try different URL patterns if current one fails
    if (selectedVideo.value.possible_video_urls && selectedVideo.value.possible_video_urls.length > 0) {
      let currentSrc = videoPlayer.value.src;
      let currentIndex = selectedVideo.value.possible_video_urls.indexOf(currentSrc);
      let nextIndex = (currentIndex + 1) % selectedVideo.value.possible_video_urls.length;
      
      console.log(`Trying video URL ${nextIndex + 1}:`, selectedVideo.value.possible_video_urls[nextIndex]);
      videoPlayer.value.src = selectedVideo.value.possible_video_urls[nextIndex];
    } else {
      videoPlayer.value.load();
    }
  }
};

// Function to try loading video with fallback URLs
const tryLoadVideoWithFallback = async () => {
  if (!selectedVideo.value) return;
  
  videoLoading.value = true;
  videoError.value = false;
  
  // Try each possible URL until one works
  if (selectedVideo.value.possible_video_urls) {
    for (let i = 0; i < selectedVideo.value.possible_video_urls.length; i++) {
      try {
        const url = selectedVideo.value.possible_video_urls[i];
        console.log(`Attempting to load video from URL ${i + 1}:`, url);
        
        // Test if URL is accessible
        const testResponse = await fetch(url, { method: 'HEAD' });
        if (testResponse.ok) {
          if (videoPlayer.value) {
            videoPlayer.value.src = url;
            return; // Success, stop trying other URLs
          }
        }
      } catch (error) {
        console.log(`URL ${i + 1} failed:`, error);
        continue; // Try next URL
      }
    }
  }
  
  // If all URLs fail, show error
  videoLoading.value = false;
  videoError.value = true;
};

// Watch for video selection changes
watch(selectedVideo, (newVideo) => {
  if (newVideo) {
    videoLoading.value = true;
    videoError.value = false;
  }
});

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
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
    case 'active': return 'badge-success';
    case 'inactive': return 'badge-warning';
    default: return 'badge-secondary';
  }
};

const getPerformanceClass = (score) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-danger';
};

// Watch for filter changes
watch([searchQuery, filterStatus, filterType, sortBy, sortOrder], () => {
  filterVideos();
});

// Lifecycle
onMounted(fetchVideos);
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
  padding-left: 0;
}

.card-video-thumbnail {
  position: relative;
  overflow: hidden;
}

.video-thumbnail {
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .video-thumbnail {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.video-status-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
}

.video-meta {
  font-size: 0.875rem;
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

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  transition: width 0.6s ease;
}

/* Video Player Styles */
.video-player-container {
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: auto;
  max-height: 300px;
  display: block;
  border-radius: 8px;
}

.video-loading-overlay,
.video-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 20px;
}

.video-info-section {
  margin-top: 15px;
}

.video-info-section h6 {
  color: #495057;
  font-weight: 600;
  margin-bottom: 10px;
}
</style>
