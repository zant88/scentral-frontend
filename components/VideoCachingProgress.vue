<template>
  <div class="caching-overlay">
    <div class="caching-container">
      <div class="caching-header">
        <h2 class="caching-title">Loading Videos</h2>
        <p class="caching-subtitle">Please wait while we prepare your content...</p>
      </div>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="progress-text">{{ progressPercentage }}%</div>
      </div>
      
      <div class="current-video">
        <div class="video-info">
          <div class="video-icon">🎬</div>
          <div class="video-details">
            <div class="video-name">{{ currentVideo?.title || 'Unknown' }}</div>
            <div class="video-status">{{ currentStatus }}</div>
          </div>
        </div>
      </div>
      
      <div class="video-list">
        <div 
          v-for="video in allVideos" 
          :key="video.id"
          :class="['video-item', { 
            'video-item-completed': cachedVideos.has(video.id),
            'video-item-current': currentVideo?.id === video.id
          }]"
        >
          <div class="video-item-icon">
            <span v-if="cachedVideos.has(video.id)" class="checkmark">✓</span>
            <span v-else-if="currentVideo?.id === video.id" class="loading">⏳</span>
            <span v-else class="pending">•</span>
          </div>
          <div class="video-item-name">{{ video.title }}</div>
          <div class="video-item-size">{{ videoSize(video) }}</div>
        </div>
      </div>
      
      <div class="caching-footer">
        <div class="caching-stats">
          <span class="stat">{{ cachedVideos.size }} of {{ allVideos.length }} videos cached</span>
          <span class="stat-separator">•</span>
          <span class="stat">{{ formatTime(estimatedTimeRemaining) }} remaining</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  allVideos: {
    type: Array,
    required: true
  },
  onCachingComplete: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['progress-update'])

const cachedVideos = ref(new Set())
const currentVideo = ref(null)
const currentStatus = ref('Preparing...')
const progressPercentage = ref(0)
const estimatedTimeRemaining = ref(0)
const startTime = ref(null)
const lastUpdateTime = ref(null)
const averageSpeed = ref(0)

// Calculate progress
const progress = computed(() => {
  return (cachedVideos.value.size / props.allVideos.length) * 100
})

// Update progress percentage
const updateProgress = () => {
  progressPercentage.value = Math.round(progress.value)
  
  // Calculate estimated time remaining
  if (startTime.value && cachedVideos.value.size > 0) {
    const elapsed = (Date.now() - startTime.value) / 1000 // in seconds
    const averageTimePerVideo = elapsed / cachedVideos.value.size
    const remainingVideos = props.allVideos.length - cachedVideos.value.size
    estimatedTimeRemaining.value = remainingVideos * averageTimePerVideo
  }
  
  emit('progress-update', {
    percentage: progressPercentage.value,
    cachedCount: cachedVideos.value.size,
    totalCount: props.allVideos.length,
    estimatedTime: estimatedTimeRemaining.value
  })
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Estimate video size (fallback if not available)
const videoSize = (video) => {
  // If video has size property, use it
  if (video.size) {
    return formatFileSize(video.size)
  }
  
  // Otherwise estimate based on duration (rough approximation)
  // Assuming 1 MB per second of video
  const estimatedSize = (video.duration_seconds || 60) * 1024 * 1024
  return formatFileSize(estimatedSize)
}

// Format time
const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return 'Calculating...'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Start caching a video
const startCachingVideo = (video) => {
  currentVideo.value = video
  currentStatus.value = 'Downloading...'
  lastUpdateTime.value = Date.now()
}

// Mark video as cached
const markVideoAsCached = (video) => {
  cachedVideos.value.add(video.id)
  currentStatus.value = 'Cached ✓'
  updateProgress()
  
  // Check if all videos are cached
  if (cachedVideos.value.size === props.allVideos.length) {
    // All videos cached, call completion callback
    setTimeout(() => {
      props.onCachingComplete()
    }, 500)
  } else {
    // Reset for next video
    setTimeout(() => {
      currentVideo.value = null
      currentStatus.value = 'Preparing...'
    }, 500)
  }
}

// Handle caching error
const handleCachingError = (video, error) => {
  currentStatus.value = `Error: ${error.message}`
  console.error(`Failed to cache video ${video.title}:`, error)
}

// Initialize
onMounted(() => {
  startTime.value = Date.now()
  updateProgress()
})

// Auto-update progress every second
const progressInterval = setInterval(() => {
  updateProgress()
}, 1000)

onBeforeUnmount(() => {
  clearInterval(progressInterval)
})

// Expose methods for parent component
defineExpose({
  startCachingVideo,
  markVideoAsCached,
  handleCachingError,
  cachedVideos,
  progressPercentage,
  estimatedTimeRemaining
})
</script>

<style scoped>
.caching-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.caching-container {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}

.caching-header {
  text-align: center;
  margin-bottom: 30px;
}

.caching-title {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.caching-subtitle {
  font-size: 16px;
  color: #888;
  margin: 0;
}

.progress-container {
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #4CAF50;
}

.current-video {
  background: #252525;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #333;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.video-icon {
  font-size: 32px;
}

.video-details {
  flex: 1;
}

.video-name {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
}

.video-status {
  font-size: 14px;
  color: #4CAF50;
}

.video-list {
  margin-bottom: 30px;
  max-height: 300px;
  overflow-y: auto;
}

.video-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #252525;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.video-item:hover {
  background: #2a2a2a;
  border-color: #444;
}

.video-item-completed {
  background: #1b3a1b;
  border-color: #4CAF50;
}

.video-item-current {
  background: #1a2a3a;
  border-color: #2196F3;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
}

.video-item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
}

.checkmark {
  color: #4CAF50;
}

.loading {
  color: #2196F3;
  animation: pulse 1.5s infinite;
}

.pending {
  color: #666;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.video-item-name {
  flex: 1;
  font-size: 14px;
  color: #ccc;
}

.video-item-size {
  font-size: 12px;
  color: #888;
}

.caching-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #333;
}

.caching-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #888;
}

.stat {
  color: #ccc;
}

.stat-separator {
  color: #555;
}

/* Scrollbar styling */
.video-list::-webkit-scrollbar {
  width: 6px;
}

.video-list::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.video-list::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.video-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
