<template>
  <div class="video-preview-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="mt-2">Loading video...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        {{ error }}
      </div>
    </div>
    
    <div v-else-if="video" class="video-content">
      <div class="video-header">
        <h5>{{ video.title }}</h5>
        <div class="video-meta">
          <span class="badge" :class="getAdTypeBadgeClass(video.ad_type)">
            {{ video.ad_type }}
          </span>
          <span class="ml-2 text-muted">{{ formatDuration(video.duration_seconds) }}</span>
        </div>
      </div>
      
      <div class="video-player">
        <video 
          ref="videoPlayer"
          :src="getVideoSrc(video.file_path)" 
          controls 
          class="w-100"
          @loadedmetadata="onVideoLoaded"
          @error="onVideoError"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div class="video-details mt-3">
        <div class="row">
          <div class="col-md-6">
            <p><strong>Brand:</strong> {{ video.brand?.name || 'N/A' }}</p>
            <p><strong>Cost per Play:</strong> {{ video.costPerPlay }} balance</p>
          </div>
          <div class="col-md-6">
            <p><strong>Created:</strong> {{ formatDate(video.createdAt) }}</p>
            <p><strong>Status:</strong> 
              <span class="badge" :class="video.status === 'active' ? 'badge-success' : 'badge-secondary'">
                {{ video.status }}
              </span>
            </p>
          </div>
        </div>
        
        <div v-if="video.description" class="mt-2">
          <p><strong>Description:</strong></p>
          <p class="text-muted">{{ video.description }}</p>
        </div>
      </div>
      
      <div class="video-actions mt-3">
        <button @click="playVideo" class="btn btn-primary mr-2">
          <i class="fas fa-play mr-2"></i>Play
        </button>
        <button @click="pauseVideo" class="btn btn-secondary mr-2">
          <i class="fas fa-pause mr-2"></i>Pause
        </button>
        <button @click="restartVideo" class="btn btn-outline-primary">
          <i class="fas fa-redo mr-2"></i>Restart
        </button>
      </div>
    </div>
    
    <div v-else class="no-video-container">
      <div class="text-center py-4">
        <i class="fas fa-video fa-3x text-muted mb-3"></i>
        <p class="text-muted">No video selected for preview</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  video: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['video-loaded', 'video-error'])

// Reactive data
const videoPlayer = ref(null)
const loading = ref(false)
const error = ref('')
const playbackProgress = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const progressInterval = ref(null)
const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Methods
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getVideoSrc = (filePath) => {
  console.log('Original File Path:', filePath); // Debugging line
  if (!filePath) return '';
  
  // If the path starts with /public, remove the /public prefix
  if (filePath.startsWith('/public')) {
    const relativePath = filePath.substring(8); // Remove '/public' prefix
    console.log('Relative Path:', relativePath); // Debugging line
    return `${apiUrl}/${relativePath}`;
  }
  
  console.log('File Path:', `${apiUrl}${filePath}`); // Debugging line
  // Otherwise, use the path as-is
  return `${apiUrl}${filePath}`;
}

const getAdTypeBadgeClass = (type) => {
  switch (type) {
    case 'general': return 'badge-primary'
    case 'perfume': return 'badge-success'
    default: return 'badge-secondary'
  }
}

const playVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.play()
  }
}

const pauseVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }
}

const restartVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = 0
    playbackProgress.value = 0
    currentTime.value = 0
  }
}

const updateProgress = () => {
  if (videoPlayer.value && duration.value > 0) {
    currentTime.value = videoPlayer.value.currentTime
    playbackProgress.value = (currentTime.value / duration.value) * 100
  }
}

const onVideoLoaded = () => {
  if (videoPlayer.value) {
    duration.value = videoPlayer.value.duration
    emit('video-loaded', props.video)
  }
}

const onVideoError = (e) => {
  error.value = 'Failed to load video. Please check if the video file exists and is in a supported format.'
  emit('video-error', e)
}

// Watch for video changes
watch(() => props.video, (newVideo) => {
  if (newVideo) {
    loading.value = true
    error.value = ''
    
    // Reset player state
    if (videoPlayer.value) {
      videoPlayer.value.load()
    }
    
    // Simulate loading (in a real app, you might want to check if the video file exists)
    setTimeout(() => {
      loading.value = false
    }, 500)
  } else {
    // Reset when no video is selected
    playbackProgress.value = 0
    currentTime.value = 0
    duration.value = 0
    error.value = ''
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  // Set up progress tracking
  progressInterval.value = setInterval(updateProgress, 100)
})

onUnmounted(() => {
  // Clean up interval
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
})
</script>

<style scoped>
.video-preview-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-container,
.error-container,
.no-video-container {
  padding: 2rem;
  text-align: center;
}

.video-header {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.video-meta {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.video-player {
  position: relative;
  background: #000;
}

.video-player video {
  max-height: 400px;
  display: block;
  margin: 0 auto;
}

.video-details {
  padding: 0 1rem;
}

.video-actions {
  padding: 0 1rem;
  border-top: 1px solid #e9ecef;
  margin-top: 1rem;
  padding-top: 1rem;
}

.video-progress {
  padding: 0 1rem 1rem;
}

.progress {
  height: 8px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-primary { background-color: #007bff; }
.badge-success { background-color: #28a745; }
.badge-secondary { background-color: #6c757d; }
</style>