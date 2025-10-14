<template>
  <div class="video-player-container">
    <div id="videoContainer">
      <video id="videoPlayer" autoplay muted playsinline @click="toggleFullscreen"></video>
      
      <!-- Video Caching Progress Component -->
      <VideoCachingProgress
        v-if="showCachingProgress"
        :allVideos="videosToCache"
        :onCachingComplete="handleCachingComplete"
        @progress-update="handleCachingProgressUpdate"
        ref="cachingComponentRef"
      />
      
      <div id="loadingOverlay" :class="{ hidden: (!isLoading && !showCachingProgress) || isFullscreen }">
        <div class="spinner"></div>
        <div id="loadingText">{{ loadingText }}</div>
      </div>

      <div id="statusOverlay" :class="{ hidden: isFullscreen }">
        <div class="status-item">
          <span class="status-label">Machine ID:</span>
          <span class="status-value">{{ machineId }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Current Slot:</span>
          <span class="status-value">{{ currentSlot }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Ad Type:</span>
          <span class="status-value">{{ adType }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Playback:</span>
          <span class="status-value">{{ playbackStatus }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Perfume Time Today:</span>
          <span class="status-value">{{ perfumeTimeToday }}s</span>
        </div>
      </div>

      <div id="debugOverlay" :class="{ hidden: !debugMode || isFullscreen }">
        <div style="font-weight: bold; margin-bottom: 5px;">Debug Log</div>
        <div id="debugLog">
          <div v-for="(log, index) in debugLogs" :key="index"
               :class="['log-entry', `log-level-${log.level}`]">
            <span class="log-time">{{ log.time }}</span>{{ log.message }}
          </div>
        </div>
      </div>

      <div id="errorOverlay" :class="{ hidden: !showError }">
        <div class="error-title">Playback Error</div>
        <div class="error-message">{{ errorMessage }}</div>
        <button class="retry-button" @click="retry">Retry</button>
      </div>

      <!-- Load New Video Button -->
      <button id="loadVideoBtn" v-show="!isFullscreen" @click="loadNewVideos" title="Load New Videos">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>

      <!-- Fullscreen Button -->
      <button id="fullscreenBtn" v-show="!isFullscreen" @click="toggleFullscreen" title="Enter Fullscreen">
        <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * Scentral Video Player for Tizen Smart TV
 * Handles advertisement playback with time slots, MQTT integration, and caching
 * Updated flow:
 * 1. Load URL with machineId parameter
 * 2. Fetch all videos with time slots and balance information
 * 3. Cache all videos
 * 4. Play in pattern: ad1, default, ad2, default, ad3...
 * 5. Log and deduct balance when ads are played
 * 6. Check current time for slot-based playback
 * 7. Show black screen outside active hours (08:00-23:00)
 */

import { ref, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import VideoCachingProgress from '../components/VideoCachingProgress.vue'

// Layout definition
definePageMeta({
  layout: 'video-player'
})

const config = useRuntimeConfig();
const apiBaseUrl = ref(`${config.public.apiBase}`);
const mqttBaseUrl = ref(`${config.public.mqttBase}`);
// Reactive state
const machineId = ref('')

const mqttClient = ref(null)
const manifest = ref(null)
const currentVideo = ref(null)
const currentSlot = ref(null)
const perfumeTimeToday = ref(0)
const lastPerfumeAdTime = ref(null)
const isPerfumeAdPlaying = ref(false)
const generalAdQueue = ref([])
const currentGeneralAdIndex = ref(0)
const retryCount = ref(0)
const maxRetries = ref(3)
const debugMode = ref(false)
const isLoading = ref(true)
const loadingText = ref('Initializing video player...')
const showError = ref(false)
const errorMessage = ref('')
const playbackStatus = ref('-')
const adType = ref('-')
const debugLogs = ref([])
const brandBalances = ref({})
const playbackLoop = ref([])
const currentLoopIndex = ref(0)
const isPlayingAd = ref(false)
const showCachingProgress = ref(false)
const videosToCache = ref([])
const cachingProgress = ref({
  percentage: 0,
  cachedCount: 0,
  totalCount: 0,
  estimatedTime: 0
})
const cachingComponentRef = ref(null)
const isFullscreen = ref(false)
const slotAssignments = ref([])
const lastSlotCheckTime = ref(null)

// New state for enhanced functionality
const isBlackScreenActive = ref(false)
const isActiveWindow = ref(false) // 08:00-23:00 active window
const slotCheckInterval = ref(null)
const balanceCheckInterval = ref(null)
const activeWindowCheckInterval = ref(null)

// Configuration functions
const getMachineId = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const machineIdParam = urlParams.get('machineId')
  if (machineIdParam) {
    return machineIdParam
  }
  
  // Fallback to device-specific ID (for Tizen)
  if (window.tizen && window.tizen.systeminfo) {
    try {
      const systemInfo = window.tizen.systeminfo
      return systemInfo.getCapability('http://tizen.org/system/model_name') || 'unknown-device'
    } catch (e) {
      log('warn', 'Failed to get Tizen device ID')
    }
  }
  
  // Fallback to hostname or generated ID
  return window.location.hostname || `device-${Date.now()}`
}

const getApiBaseUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const apiUrlParam = urlParams.get('apiUrl')
  if (apiUrlParam) {
    return apiUrlParam
  }
  
  // Default to backend server on port 3030
  return apiBaseUrl.value;
}

const getDebugMode = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('debug') === 'true'
}

const getMqttUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const mqttUrl = urlParams.get('mqttUrl')
  if (mqttUrl) {
    return mqttUrl
  }
  
  // Default MQTT configuration
  return mqttBaseUrl.value // WebSocket endpoint
}

// Utility function to clean video URLs
const cleanVideoUrl = (url) => {
  if (!url) return url
  
  try {
    // Parse the URL to handle it properly
    const urlObj = new URL(url)
    let pathname = urlObj.pathname
    
    // Remove "public" from the beginning of the path
    if (pathname.startsWith('/public/')) {
      pathname = pathname.substring('/public'.length)
      log('info', `Cleaned video URL: removed 'public' from path`)
    }
    
    // Reconstruct the URL with the cleaned path
    return `${urlObj.protocol}//${urlObj.host}${pathname}${urlObj.search}${urlObj.hash}`
  } catch (error) {
    log('warn', `Failed to parse video URL: ${error.message}`)
    
    // Fallback to simple string replacement
    if (url.includes('/public/video/')) {
      return url.replace('/public/video/', '/video/')
    } else if (url.includes('/public/videos/')) {
      return url.replace('/public/videos/', '/videos/')
    }
    
    return url
  }
}

// Logging functions
const log = (level, message) => {
  const timestamp = new Date().toLocaleTimeString()
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
  
  console.log(logMessage)
  
  if (debugMode.value) {
    addDebugLog(level, message)
  }
}

const addDebugLog = (level, message) => {
  // Ensure debugLogs is initialized
  if (!debugLogs.value) {
    debugLogs.value = []
  }
  
  const timestamp = new Date().toLocaleTimeString()
  const logEntry = {
    time: timestamp,
    level: level,
    message: message
  }
  
  debugLogs.value.push(logEntry)
  
  // Keep only last 50 entries
  if (debugLogs.value.length > 50) {
    debugLogs.value.shift()
  }
}

// Load slot assignments from the backend
const loadSlotAssignments = async () => {
  try {
    const response = await fetch(`${apiBaseUrl.value}/api/video-player/slot-assignments/${machineId.value}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to load slot assignments')
    }
    
    slotAssignments.value = data.data
    log('info', `Loaded ${slotAssignments.value.length} slot assignments`)
    
  } catch (error) {
    log('error', `Failed to load slot assignments: ${error.message}`)
  }
}

// Check if a video is assigned to the current slot
const isVideoAssignedToCurrentSlot = (video, currentSlotData) => {
  if (!currentSlotData || !video) {
    return false
  }
  
  // Find slot assignments for this video
  const videoAssignments = slotAssignments.value.filter(assignment => 
    assignment.video_id === video.id && 
    assignment.status === 'ACTIVE'
  )
  
  if (videoAssignments.length === 0) {
    log('warn', `No active slot assignments found for video ${video.title}`)
    return false
  }
  
  // Check if any assignment matches the current slot
  for (const assignment of videoAssignments) {
    if (assignment.slot_id === currentSlotData.id) {
      log('info', `Video ${video.title} is assigned to current slot ${currentSlotData.name}`)
      return true
    }
  }
  
  log('info', `Video ${video.title} is not assigned to current slot ${currentSlotData.name}`)
  return false
}

// Start monitoring for slot changes
const startSlotMonitoring = () => {
  // Check for slot changes every minute
  setInterval(() => {
    const now = new Date()
    const currentSlotData = getCurrentTimeSlot()
    
    if (currentSlotData) {
      // Check if this is a new slot
      if (!lastSlotCheckTime.value || currentSlotData.id !== lastSlotCheckTime.value) {
        log('info', `Slot changed to: ${currentSlotData.name}`)
        lastSlotCheckTime.value = currentSlotData.id
        
        // Refresh slot assignments
        loadSlotAssignments()
        
        // Reinitialize playback loop with new slot
        initializePlaybackLoop()
      }
    }
  }, 60000) // Check every minute
}

// Video event handlers
const setupVideoEventListeners = () => {
  const video = document.getElementById('videoPlayer')
  
  video.addEventListener('loadstart', () => {
    log('info', 'Video loading started')
    playbackStatus.value = 'Loading...'
  })

  video.addEventListener('canplay', () => {
    log('info', 'Video can play')
    playbackStatus.value = 'Ready'
  })

  video.addEventListener('play', () => {
    log('info', `Video playing: ${currentVideo.value?.title || 'Unknown'}`)
    playbackStatus.value = 'Playing'
  })

  video.addEventListener('ended', () => {
    log('info', 'Video ended')
    handleVideoEnded()
  })

  video.addEventListener('error', (e) => {
    log('error', `Video error: ${e.message || 'Unknown error'}`)
    handleVideoError(e)
  })

  video.addEventListener('stalled', () => {
    log('warn', 'Video playback stalled')
  })

  video.addEventListener('waiting', () => {
    log('info', 'Video buffering...')
    playbackStatus.value = 'Buffering...'
  })
}

// MQTT functions
const initializeMQTT = async () => {
  try {
    // Check if Paho MQTT is already loaded
    if (typeof window.Paho === 'undefined') {
      // Load Paho MQTT library
      log('info', 'Loading Paho MQTT library...')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.1.0/paho-mqtt.min.js')
      
      // Wait a bit for the library to initialize
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Check if Paho is available now
    if (typeof window.Paho === 'undefined' || !window.Paho.MQTT || !window.Paho.MQTT.Client) {
      throw new Error('Paho MQTT library not available')
    }
    
    const mqttUrl = getMqttUrl()
    const clientId = `scentral-player-${machineId.value}-${Date.now()}`
    
    log('info', `Connecting to MQTT: ${mqttUrl} with client ID: ${clientId}`)
    
    mqttClient.value = new window.Paho.MQTT.Client(mqttUrl, clientId)
    
    mqttClient.value.onConnectionLost = (responseObject) => {
      log('warn', `MQTT connection lost: ${responseObject.errorMessage}`)
      scheduleMqttReconnect()
    }
    
    mqttClient.value.onMessageArrived = (message) => {
      handleMqttMessage(message)
    }
    
    const connectOptions = {
      timeout: 10,
      onSuccess: () => {
        log('info', 'MQTT connected successfully')
        subscribeToMqttTopics()
      },
      onFailure: (error) => {
        log('error', `MQTT connection failed: ${error.errorMessage || error}`)
        scheduleMqttReconnect()
      }
    }
    
    mqttClient.value.connect(connectOptions)
    
  } catch (error) {
    log('warn', `MQTT initialization failed: ${error.message}`)
    // Don't fail the entire initialization if MQTT fails
  }
}

const subscribeToMqttTopics = () => {
  if (!mqttClient.value || !mqttClient.value.isConnected()) {
    return
  }
  
  const topics = [
    `scentral/video-player/recache/${machineId.value}`,
    `scentral/video-player/perfume-trigger/${machineId.value}`,
    'scentral/video-player/recache',
    'scentral/video-player/perfume-trigger',
    `scentral/video-assignment/${machineId.value}`,
    'scentral/video-assignment'
  ]
  
  topics.forEach(topic => {
    mqttClient.value.subscribe(topic, {
      onSuccess: () => log('info', `Subscribed to: ${topic}`),
      onFailure: (error) => log('warn', `Failed to subscribe to ${topic}: ${error.errorMessage}`)
    })
  })
}

const handleMqttMessage = (message) => {
  try {
    const payload = JSON.parse(message.payloadString)
    log('info', `MQTT message received on ${message.destinationName}: ${JSON.stringify(payload)}`)
    
    if (message.destinationName.includes('recache')) {
      handleRecacheTrigger(payload)
    } else if (message.destinationName.includes('perfume-trigger')) {
      handlePerfumeAdTrigger(payload)
    } else if (message.destinationName.includes('video-assignment')) {
      handleVideoAssignmentTrigger(payload)
    }
    
  } catch (error) {
    log('error', `Failed to parse MQTT message: ${error.message}`)
  }
}

const handleRecacheTrigger = async (trigger) => {
  if (trigger.machineId && trigger.machineId !== machineId.value) {
    return // Not for this machine
  }
  
  log('info', `Recache triggered: ${trigger.triggerReason || 'Unknown reason'}`)
  
  if (trigger.version && manifest.value && trigger.version <= manifest.value.recacheVersion) {
    log('info', 'Skipping recache - version is not newer')
    return
  }
  
  try {
    await loadManifest()
    log('info', 'Recache completed successfully')
  } catch (error) {
    log('error', `Recache failed: ${error.message}`)
  }
}

const handlePerfumeAdTrigger = async (trigger) => {
  if (trigger.machineId && trigger.machineId !== machineId.value) {
    return // Not for this machine
  }
  
  if (trigger.action === 'cancel') {
    log('info', 'Perfume ad cancelled')
    return
  }
  
  log('info', `Perfume ad triggered for brand: ${trigger.brandName || trigger.brandId}`)
  
  if (isPerfumeAdPlaying.value) {
    log('warn', 'Perfume ad already playing, ignoring trigger')
    return
  }
  
  await playPerfumeAd(trigger.brandId)
}

const handleVideoAssignmentTrigger = async (trigger) => {
  // Check if this trigger is for this machine or for all machines
  if (trigger.machineId && trigger.machineId !== machineId.value) {
    return // Not for this machine
  }
  
  log('info', `Video assignment trigger received: ${trigger.action} for video ${trigger.videoId} in slot ${trigger.slotId}`)
  
  // If a video was removed or updated, refresh our slot assignments
  if (trigger.action === 'removed' || trigger.action === 'updated') {
    log('info', 'Refreshing slot assignments due to video assignment change')
    await loadSlotAssignments()
    
    // Reinitialize the playback loop with the updated assignments
    initializePlaybackLoop()
    
    // If the currently playing video was removed, switch to the next video
    if (trigger.action === 'removed' && currentVideo.value && currentVideo.value.id === trigger.videoId) {
      log('info', 'Currently playing video was removed, switching to next video')
      setTimeout(() => {
        playNextInLoop()
      }, 1000) // Give a moment before switching
    }
  }
  
  // If a new video was assigned and should play now, handle it
  if (trigger.action === 'assigned' && trigger.shouldPlayNow) {
    log('info', 'New video assigned and should play now')
    
    // Find the video in our manifest
    const video = findVideoInManifest(trigger.videoId)
    if (video) {
      // Find the slot
      const slot = findSlotInManifest(trigger.slotId)
      if (slot) {
        // Play the video immediately
        await playVideo(video, trigger.adType, slot)
      }
    }
  }
}

const scheduleMqttReconnect = () => {
  setTimeout(() => {
    log('info', 'Attempting to reconnect MQTT...')
    initializeMQTT()
  }, 5000)
}

// Helper functions to find videos and slots in manifest
const findVideoInManifest = (videoId) => {
  if (!manifest.value) return null
  
  // Check general ads
  const generalAd = manifest.value.general_ads.find(ad => ad.id === videoId)
  if (generalAd) return generalAd
  
  // Check perfume ads
  const perfumeAd = manifest.value.perfume_ads.find(ad => ad.id === videoId)
  if (perfumeAd) return perfumeAd
  
  // Check default video
  if (manifest.value.default_video && manifest.value.default_video.id === videoId) {
    return manifest.value.default_video
  }
  
  return null
}

const findSlotInManifest = (slotId) => {
  if (!manifest.value) return null
  
  return manifest.value.time_slots.find(slot => slot.id === slotId) || null
}

// Manifest and caching functions
const loadManifest = async () => {
  try {
    loadingText.value = 'Loading video manifest...'
    
    const response = await fetch(`${apiBaseUrl.value}/api/video-player/manifest/${machineId.value}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to load manifest')
    }
    
    manifest.value = data.data
    
    // Clean video URLs in the manifest
    if (manifest.value.default_video) {
      const originalUrl = manifest.value.default_video.file_path
      manifest.value.default_video.file_path = cleanVideoUrl(originalUrl)
      if (originalUrl !== manifest.value.default_video.file_path) {
        log('info', `Cleaned default video URL`)
      }
    }
    
    manifest.value.general_ads.forEach(ad => {
      const originalUrl = ad.file_path
      ad.file_path = cleanVideoUrl(originalUrl)
      if (originalUrl !== ad.file_path) {
        log('info', `Cleaned general ad URL: ${ad.title}`)
      }
    })
    
    manifest.value.perfume_ads.forEach(ad => {
      const originalUrl = ad.file_path
      ad.file_path = cleanVideoUrl(originalUrl)
      if (originalUrl !== ad.file_path) {
        log('info', `Cleaned perfume ad URL: ${ad.title}`)
      }
    })
    
    log('info', `Manifest loaded: ${manifest.value.general_ads.length} general ads, ${manifest.value.perfume_ads.length} perfume ads`)
    
    // Load slot assignments
    await loadSlotAssignments()
    
    // Prepare videos for caching
    prepareVideosForCaching()
    
    // Cache videos with progress tracking
    await cacheVideosWithProgress()
    
    // Initialize general ad queue
    initializeGeneralAdQueue()
    
  } catch (error) {
    log('error', `Failed to load manifest: ${error.message}`)
    throw error
  }
}

const prepareVideosForCaching = () => {
  videosToCache.value = []
  
  // Add default video if available
  if (manifest.value.default_video) {
    videosToCache.value.push(manifest.value.default_video)
  }
  
  // Add general ads
  videosToCache.value.push(...manifest.value.general_ads)
  
  // Add perfume ads
  videosToCache.value.push(...manifest.value.perfume_ads)
  
  log('info', `Prepared ${videosToCache.value.length} videos for caching`)
}

const cacheVideosWithProgress = async () => {
  try {
    showCachingProgress.value = true
    isLoading.value = false
    
    // Wait a bit for the component to be mounted
    await new Promise(resolve => setTimeout(resolve, 100))
    
    for (const video of videosToCache.value) {
      // Start caching this video
      if (cachingComponentRef.value?.exposed?.startCachingVideo) {
        cachingComponentRef.value.exposed.startCachingVideo(video)
      }
      
      try {
        await cacheVideo(video)
        
        // Mark as cached
        if (cachingComponentRef.value?.exposed?.markVideoAsCached) {
          cachingComponentRef.value.exposed.markVideoAsCached(video)
        }
        
        log('info', `Cached video: ${video.title}`)
      } catch (error) {
        log('error', `Failed to cache video ${video.title}: ${error.message}`)
        
        // Handle error in UI
        if (cachingComponentRef.value?.exposed?.handleCachingError) {
          cachingComponentRef.value.exposed.handleCachingError(video, error)
        }
        
        throw error
      }
    }
    
    log('info', 'All videos cached successfully')
    
    // Call handleCachingComplete directly after caching is done
    handleCachingComplete()
    
  } catch (error) {
    log('error', `Video caching failed: ${error.message}`)
    throw error
  }
}

const cacheVideo = async (video) => {
  try {
    const cachedVideo = await getCachedVideo(video.id)
    if (cachedVideo) {
      log('info', `Video already cached: ${video.title}`)
      return
    }
    
    log('info', `Caching video: ${video.title}`)
    
    let response
    try {
      // First try direct fetch
      response = await fetch(video.file_path)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (fetchError) {
      // If direct fetch fails due to CORS, try proxy through the API
      log('warn', `Direct fetch failed due to CORS, trying proxy: ${fetchError.message}`)
      
      const proxyUrl = `${apiBaseUrl.value}/api/video-player/proxy-video`
      const formData = new FormData()
      formData.append('url', video.file_path)
      
      response = await fetch(proxyUrl, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Proxy fetch failed: HTTP ${response.status}: ${response.statusText}`)
      }
    }
    
    const blob = await response.blob()
    
    // Store in IndexedDB
    await storeVideoInIndexedDB(video.id, blob, video)
    
    log('info', `Video cached: ${video.title}`)
    
  } catch (error) {
    log('error', `Failed to cache video ${video.title}: ${error.message}`)
    throw error
  }
}

const getCachedVideo = async (videoId) => {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['videos'], 'readonly')
    const store = transaction.objectStore('videos')
    
    return new Promise((resolve, reject) => {
      const request = store.get(videoId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    
  } catch (error) {
    log('warn', `Failed to get cached video ${videoId}: ${error.message}`)
    return null
  }
}

const storeVideoInIndexedDB = async (videoId, blob, metadata) => {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['videos'], 'readwrite')
    const store = transaction.objectStore('videos')
    
    // Create a clean metadata object without circular references
    const cleanMetadata = {
      id: metadata.id,
      title: metadata.title,
      description: metadata.description,
      file_path: metadata.file_path,
      filename: metadata.filename,
      thumbnail_path: metadata.thumbnail_path,
      duration_seconds: metadata.duration_seconds,
      ad_type: metadata.ad_type,
      cost_per_play: metadata.cost_per_play,
      status: metadata.status,
      priority: metadata.priority,
      brand_id: metadata.brand_id,
      brand_name: metadata.brand_name,
      play_count: metadata.play_count,
      last_played: metadata.last_played
    }
    
    const record = {
      id: videoId,
      blob: blob,
      metadata: cleanMetadata,
      cachedAt: new Date().toISOString()
    }
    
    return new Promise((resolve, reject) => {
      const request = store.put(record)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    
  } catch (error) {
    log('error', `Failed to store video in IndexedDB: ${error.message}`)
    throw error
  }
}

const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ScentralVideoPlayer', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('videos')) {
        const store = db.createObjectStore('videos', { keyPath: 'id' })
        store.createIndex('cachedAt', 'cachedAt', { unique: false })
      }
      
      if (!db.objectStoreNames.contains('playbackLogs')) {
        const store = db.createObjectStore('playbackLogs', { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// Balance checking functions
const loadBrandBalances = async () => {
  try {
    const response = await fetch(`${apiBaseUrl.value}/api/video-player/brand-balances/${machineId.value}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    if (data.success) {
      const balances = {}
      data.data.brand_balances.forEach(brand => {
        balances[brand.brand_id] = brand
      })
      brandBalances.value = balances
      log('info', `Loaded balances for ${Object.keys(balances).length} brands`)
    }
  } catch (error) {
    log('warn', `Failed to load brand balances: ${error.message}`)
  }
}

const canPlayVideo = (video) => {
  const brandBalance = brandBalances.value[video.brand_id]
  if (!brandBalance) {
    log('warn', `No balance info for brand ${video.brand_id}, allowing playback`)
    return true
  }
  
  // Check if brand has sufficient balance
  if (brandBalance.current_balance <= 0) {
    log('info', `Brand ${brandBalance.brand_name} has no balance, skipping video`)
    return false
  }
  
  // Check estimated remaining plays
  if (brandBalance.estimated_remaining_plays <= 0 && brandBalance.cost_per_play_avg > 0) {
    log('info', `Brand ${brandBalance.brand_name} has insufficient balance for more plays, skipping video`)
    return false
  }
  
  return true
}

// Playback functions
const initializePlaybackLoop = () => {
  // Create the playback loop: [ad1, default, ad2, default, ad3, default, ...]
  playbackLoop.value = []
  
  // Get current slot
  const currentSlotData = getCurrentTimeSlot()
  
  // Check if we're in active window
  if (!isActiveWindow.value) {
    log('info', 'Outside active window, not initializing playback loop')
    return
  }
  
  // Filter ads based on current time slot and balance
  const availableAds = manifest.value.general_ads.filter(ad => {
    // Check if video is assigned to current slot
    if (currentSlotData && currentSlotData.allow_general) {
      return isVideoAssignedToCurrentSlot(ad, currentSlotData) && canPlayVideo(ad)
    }
    return false
  })
  
  if (availableAds.length === 0) {
    log('warn', 'No available general ads with sufficient balance for current slot')
    if (manifest.value.default_video) {
      // Only play default video if no ads available
      playbackLoop.value.push({ type: 'default', video: manifest.value.default_video })
    }
  } else {
    // Create the alternating pattern: ad1, default, ad2, default, ad3, default...
    availableAds.forEach(ad => {
      playbackLoop.value.push({ type: 'ad', video: ad })
      if (manifest.value.default_video) {
        playbackLoop.value.push({ type: 'default', video: manifest.value.default_video })
      }
    })
  }
  
  currentLoopIndex.value = 0
  log('info', `Playback loop initialized with ${playbackLoop.value.length} items (${availableAds.length} ads)`)
}

const startPlaybackLoop = () => {
  // Check if we're in active window before starting
  if (!checkActiveWindow()) {
    log('info', 'Outside active window, showing black screen')
    showBlackScreen(true)
    return
  }
  
  hideBlackScreen()
  updatePerfumeTimeToday()
  loadBrandBalances() // Load initial balances
  initializePlaybackLoop()
  
  if (playbackLoop.value.length > 0) {
    playNextInLoop()
  } else {
    log('warn', 'No videos in playback loop, showing black screen')
    showBlackScreen(true)
  }
  
  // Refresh balances every 5 minutes
  balanceCheckInterval.value = setInterval(loadBrandBalances, 5 * 60 * 1000)
  
  // Start slot monitoring
  startSlotMonitoring()
  
  // Start active window monitoring
  startActiveWindowMonitoring()
}

const playNextInLoop = async () => {
  try {
    // Check if we're still in active window
    if (!isActiveWindow.value) {
      log('info', 'Outside active window, stopping playback')
      showBlackScreen(true)
      return
    }
    
    if (isPerfumeAdPlaying.value) {
      log('info', 'Perfume ad is playing, pausing loop')
      return
    }
    
    if (playbackLoop.value.length === 0) {
      log('warn', 'Playback loop is empty, reinitializing')
      initializePlaybackLoop()
      if (playbackLoop.value.length === 0) {
        log('error', 'No videos available to play')
        showBlackScreen(true)
        return
      }
    }
    
    const currentItem = playbackLoop.value[currentLoopIndex.value]
    
    // Check if we can still play this video (balance might have changed)
    if (currentItem.type === 'ad') {
      // Check balance first
      if (!canPlayVideo(currentItem.video)) {
        log('info', `Video ${currentItem.video.title} can no longer be played due to insufficient balance`)
        
        // Remove this item from the loop and reinitialize
        playbackLoop.value.splice(currentLoopIndex.value, 1)
        if (playbackLoop.value.length === 0) {
          initializePlaybackLoop()
        }
        currentLoopIndex.value = currentLoopIndex.value % playbackLoop.value.length
        playNextInLoop()
        return
      }
      
      // Check slot assignment
      const currentSlotData = getCurrentTimeSlot()
      if (!currentSlotData || !currentSlotData.allow_general || !isVideoAssignedToCurrentSlot(currentItem.video, currentSlotData)) {
        log('info', `Ad ${currentItem.video.title} is not assigned to current slot, playing default video`)
        await playDefaultVideo()
        // Move to next item
        currentLoopIndex.value = (currentLoopIndex.value + 1) % playbackLoop.value.length
        return
      }
    }
    
    isPlayingAd.value = currentItem.type === 'ad'
    
    if (currentItem.type === 'ad') {
      const currentSlotData = getCurrentTimeSlot()
      log('info', `Playing ad: ${currentItem.video.title} in slot ${currentSlotData?.name || 'Unknown'}`)
      await playVideo(currentItem.video, 'general', currentSlotData)
    } else {
      log('info', `Playing default video: ${currentItem.video.title}`)
      await playVideo(currentItem.video, 'default')
    }
    
    // Move to next item in loop
    currentLoopIndex.value = (currentLoopIndex.value + 1) % playbackLoop.value.length
    
  } catch (error) {
    log('error', `Failed to play next in loop: ${error.message}`)
    
    // Try to play default video as fallback
    try {
      await playDefaultVideo()
    } catch (defaultError) {
      log('error', `Failed to play default video: ${defaultError.message}`)
      showBlackScreen(true)
    }
  }
}

const initializeGeneralAdQueue = () => {
  generalAdQueue.value = [...manifest.value.general_ads]
  
  // Sort by priority and last played time
  generalAdQueue.value.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    
    if (priorityDiff !== 0) {
      return -priorityDiff // Higher priority first
    }
    
    // If same priority, sort by last played (older first)
    const aLastPlayed = a.last_played ? new Date(a.last_played).getTime() : 0
    const bLastPlayed = b.last_played ? new Date(b.last_played).getTime() : 0
    
    return aLastPlayed - bLastPlayed
  })
  
  currentGeneralAdIndex.value = 0
  log('info', `General ad queue initialized with ${generalAdQueue.value.length} videos`)
}

const playNextGeneralAd = async () => {
  try {
    if (isPerfumeAdPlaying.value) {
      log('info', 'Perfume ad is playing, skipping general ad')
      return
    }
    
    const currentSlotData = getCurrentTimeSlot()
    if (!currentSlotData || !currentSlotData.allow_general) {
      log('info', 'No active slot for general ads, playing default video')
      await playDefaultVideo()
      return
    }
    
    const availableAds = getAvailableGeneralAds(currentSlotData)
    if (availableAds.length === 0) {
      log('info', 'No available general ads for current slot, playing default video')
      await playDefaultVideo()
      return
    }
    
    // Select next ad from queue
    const video = selectNextGeneralAd(availableAds)
    await playVideo(video, 'general', currentSlotData)
    
  } catch (error) {
    log('error', `Failed to play general ad: ${error.message}`)
    await playDefaultVideo()
  }
}

const getCurrentTimeSlot = () => {
  const now = new Date()
  const currentTime = formatTime(now.getHours(), now.getMinutes())
  
  for (const slot of manifest.value.time_slots) {
    if (isTimeInSlot(currentTime, slot.start_time, slot.end_time)) {
      return slot
    }
  }
  
  return null
}

const isTimeInSlot = (currentTime, startTime, endTime) => {
  return currentTime >= startTime && currentTime <= endTime
}

const formatTime = (hours, minutes) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Check if current time is within active window (08:00-23:00)
const checkActiveWindow = () => {
  const now = new Date()
  const currentHour = now.getHours()
  const wasActive = isActiveWindow.value
  
  // Active window is from 08:00 to 23:00 (8 AM to 11 PM)
  isActiveWindow.value = currentHour >= 8 && currentHour < 23
  
  // Log state changes
  if (wasActive !== isActiveWindow.value) {
    if (isActiveWindow.value) {
      log('info', 'Entering active window - starting playback')
      // If we were showing black screen, stop it and resume playback
      if (isBlackScreenActive.value) {
        isBlackScreenActive.value = false
        setTimeout(() => {
          startPlaybackLoop()
        }, 1000)
      }
    } else {
      log('info', 'Exiting active window - showing black screen')
      // Show black screen when exiting active window
      showBlackScreen()
    }
  }
  
  return isActiveWindow.value
}

// Hide black screen when entering active hours
const hideBlackScreen = () => {
  if (isBlackScreenActive.value) {
    isBlackScreenActive.value = false
    const videoElement = document.getElementById('videoPlayer')
    if (videoElement) {
      videoElement.style.backgroundColor = 'transparent'
    }
    log('info', 'Black screen deactivated - entering active hours')
  }
}

// Start monitoring active window changes
const startActiveWindowMonitoring = () => {
  // Check every minute
  activeWindowCheckInterval.value = setInterval(() => {
    checkActiveWindow()
  }, 60000)
  
  // Initial check
  checkActiveWindow()
}

const getAvailableGeneralAds = (slot) => {
  return manifest.value.general_ads.filter(video => {
    // Check if video is assigned to this slot
    if (slot.general_video_ids && slot.general_video_ids.length > 0) {
      return slot.general_video_ids.includes(video.id)
    }
    
    // If no specific assignments, all general ads are available
    return true
  })
}

const selectNextGeneralAd = (availableAds) => {
  if (generalAdQueue.value.length === 0) {
    initializeGeneralAdQueue()
  }
  
  // Find the next available ad from the queue
  let attempts = 0
  while (attempts < generalAdQueue.value.length) {
    const video = generalAdQueue.value[currentGeneralAdIndex.value]
    
    if (availableAds.find(ad => ad.id === video.id)) {
      currentGeneralAdIndex.value = (currentGeneralAdIndex.value + 1) % generalAdQueue.value.length
      return video
    }
    
    currentGeneralAdIndex.value = (currentGeneralAdIndex.value + 1) % generalAdQueue.value.length
    attempts++
  }
  
  // Fallback to first available ad
  return availableAds[0]
}

const playPerfumeAd = async (brandId) => {
  try {
    if (isPerfumeAdPlaying.value) {
      log('warn', 'Perfume ad already playing')
      return
    }
    
    // Check perfume time cap
    if (perfumeTimeToday.value >= manifest.value.max_cap_seconds) {
      log('warn', `Perfume ad time cap reached: ${perfumeTimeToday.value}s / ${manifest.value.max_cap_seconds}s`)
      return
    }
    
    const perfumeAd = manifest.value.perfume_ads.find(ad => ad.brand_id === brandId)
    if (!perfumeAd) {
      log('warn', `No perfume ad found for brand ${brandId}`)
      return
    }
    
    isPerfumeAdPlaying.value = true
    log('info', `Playing perfume ad: ${perfumeAd.title}`)
    
    await playVideo(perfumeAd, 'perfume')
    
  } catch (error) {
    log('error', `Failed to play perfume ad: ${error.message}`)
    isPerfumeAdPlaying.value = false
  }
}

const playDefaultVideo = async () => {
  try {
    if (!manifest.value.default_video) {
      log('warn', 'No default video available, showing black screen')
      showBlackScreen()
      return
    }
    
    log('info', `Playing default video: ${manifest.value.default_video.title}`)
    await playVideo(manifest.value.default_video, 'default')
    
  } catch (error) {
    log('error', `Failed to play default video: ${error.message}`)
    showBlackScreen()
  }
}

const playVideo = async (video, adTypeParam, slot = null) => {
  try {
    currentVideo.value = video
    currentSlot.value = slot ? slot.name : 'None'
    adType.value = adTypeParam
    
    // Get cached video
    const cachedVideo = await getCachedVideo(video.id)
    let videoUrl
    
    if (cachedVideo) {
      videoUrl = URL.createObjectURL(cachedVideo.blob)
      log('info', `Playing cached video: ${video.title}`)
    } else {
      videoUrl = video.file_path
      log('warn', `Playing uncached video: ${video.title}`)
    }
    
    const videoElement = document.getElementById('videoPlayer')
    videoElement.src = videoUrl
    videoElement.load()
    
    await videoElement.play()
    
    // Log playback start
    logPlaybackEvent({
      videoId: video.id,
      brandId: video.brand_id,
      adType: adTypeParam,
      slotId: slot ? slot.id : null,
      status: 'started',
      duration: 0,
      cost: video.cost_per_play || 0
    })
    
  } catch (error) {
    log('error', `Failed to play video ${video.title}: ${error.message}`)
    throw error
  }
}

const handleVideoEnded = async () => {
  if (!currentVideo.value) {
    return
  }
  
  const videoElement = document.getElementById('videoPlayer')
  const duration = Math.round(videoElement.duration)
  const actualDuration = Math.round(videoElement.currentTime)
  
  // Log playback completion
  await logPlaybackEvent({
    videoId: currentVideo.value.id,
    brandId: currentVideo.value.brand_id,
    adType: currentVideo.value === manifest.value.default_video ? 'default' : 
            (isPerfumeAdPlaying.value ? 'perfume' : 'general'),
    slotId: currentSlot.value ? currentSlot.value.id : null,
    status: 'completed',
    duration: actualDuration,
    cost: currentVideo.value.cost_per_play || 0
  })
  
  // Update perfume time if applicable
  if (isPerfumeAdPlaying.value) {
    perfumeTimeToday.value += actualDuration
    isPerfumeAdPlaying.value = false
  }
  
  // Clean up object URL if created
  if (videoElement.src.startsWith('blob:')) {
    URL.revokeObjectURL(videoElement.src)
  }
  
  // Continue playback loop
  setTimeout(() => {
    playNextInLoop()
  }, 1000) // 1 second gap between videos
}

const handleVideoError = async (error) => {
  if (!currentVideo.value) {
    return
  }
  
  log('error', `Video playback error: ${error.message || 'Unknown error'}`)
  
  // Log playback error
  await logPlaybackEvent({
    videoId: currentVideo.value.id,
    brandId: currentVideo.value.brand_id,
    adType: currentVideo.value === manifest.value.default_video ? 'default' : 
            (isPerfumeAdPlaying.value ? 'perfume' : 'general'),
    slotId: currentSlot.value ? currentSlot.value.id : null,
    status: 'error',
    duration: 0,
    cost: 0
  })
  
  // Retry logic
  if (retryCount.value < maxRetries.value) {
    retryCount.value++
    log('info', `Retrying video playback (${retryCount.value}/${maxRetries.value})`)
    
    setTimeout(() => {
      playVideo(currentVideo.value, isPerfumeAdPlaying.value ? 'perfume' : 'general', currentSlot.value)
    }, 2000 * retryCount.value) // Exponential backoff
    
  } else {
    log('error', 'Max retries reached, falling back to default video')
    retryCount.value = 0
    isPerfumeAdPlaying.value = false
    
    setTimeout(() => {
      playDefaultVideo()
    }, 1000)
  }
}

const showBlackScreen = (isPowerSaving = false) => {
  isBlackScreenActive.value = true
  const videoElement = document.getElementById('videoPlayer')
  if (videoElement) {
    videoElement.src = ''
    videoElement.load()
    videoElement.style.backgroundColor = '#000'
  }
  
  if (isPowerSaving) {
    playbackStatus.value = 'Power saving mode'
    
    // Stop all playback loops
    if (slotCheckInterval.value) {
      clearInterval(slotCheckInterval.value)
      slotCheckInterval.value = null
    }
    
    log('info', 'Black screen activated - outside active hours')
  } else {
    playbackStatus.value = 'No content'
    
    // Try again after 30 seconds for regular black screen
    setTimeout(() => {
      if (!isPowerSaving) {
        playNextInLoop()
      }
    }, 30000)
  }
}

// Logging and analytics
const logPlaybackEvent = async (eventData) => {
  try {
    // Skip tracking for default videos
    if (eventData.adType === 'default') {
      log('info', `Skipping tracking for default video: ${eventData.videoId}`)
      return
    }
    
    // Check if the brand is eligible to play ads (has sufficient balance)
    const brandBalance = brandBalances.value[eventData.brandId]
    if (brandBalance && (brandBalance.current_balance <= 0 ||
        (brandBalance.estimated_remaining_plays <= 0 && brandBalance.cost_per_play_avg > 0))) {
      log('info', `Skipping tracking for ineligible brand ${eventData.brandId}: insufficient balance`)
      return
    }
    
    const event = {
      machine_id: machineId.value,
      video_id: eventData.videoId,
      brand_id: eventData.brandId,
      ad_type: eventData.adType,
      slot_id: eventData.slotId,
      played_at: new Date().toISOString(),
      duration: eventData.duration,
      status: eventData.status,
      cost: eventData.cost,
      device_timestamp: new Date().toISOString(),
      recache_version: manifest.value ? manifest.value.recache_version : 0
    }
    
    // Try to send immediately
    try {
      const response = await fetch(`${apiBaseUrl.value}/api/video-player/playback-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      log('info', `Playback event logged: ${eventData.adType} - ${eventData.status}`)
      
    } catch (networkError) {
      // Store locally for retry
      await storePlaybackEventLocally(event)
      log('warn', `Failed to send playback event, stored locally: ${networkError.message}`)
    }
    
  } catch (error) {
    log('error', `Failed to log playback event: ${error.message}`)
  }
}

const storePlaybackEventLocally = async (event) => {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['playbackLogs'], 'readwrite')
    const store = transaction.objectStore('playbackLogs')
    
    event.timestamp = new Date().toISOString()
    event.id = undefined // Let auto-increment handle it
    
    return new Promise((resolve, reject) => {
      const request = store.add(event)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    
  } catch (error) {
    log('error', `Failed to store playback event locally: ${error.message}`)
  }
}

const updatePerfumeTimeToday = () => {
  const now = new Date()
  const today = now.toDateString()
  const lastReset = localStorage.getItem('perfumeTimeResetDate')
  
  if (lastReset !== today) {
    perfumeTimeToday.value = 0
    localStorage.setItem('perfumeTimeResetDate', today)
    localStorage.setItem('perfumeTimeToday', '0')
  } else {
    const stored = localStorage.getItem('perfumeTimeToday')
    perfumeTimeToday.value = parseInt(stored) || 0
  }
  
  // Update every minute
  setTimeout(() => updatePerfumeTimeToday(), 60000)
}

// Utility functions
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Error handling
const showErrorDialog = (message) => {
  errorMessage.value = message
  showError.value = true
}

const hideErrorDialog = () => {
  showError.value = false
  errorMessage.value = ''
}

const retry = () => {
  hideErrorDialog()
  retryCount.value = 0
  isPerfumeAdPlaying.value = false
  playNextGeneralAd()
}

// Handle caching progress updates
const handleCachingProgressUpdate = (progress) => {
  cachingProgress.value = progress
}

// Handle caching complete
const handleCachingComplete = () => {
  log('info', 'Caching completed, starting playback...')
  showCachingProgress.value = false
  
  // Wait a bit for UI to update before starting playback
  setTimeout(() => {
    startPlaybackLoop()
  }, 500)
}

// Fullscreen functionality
const toggleFullscreen = () => {
  const videoContainer = document.getElementById('videoContainer');
  
  if (!isFullscreen.value) {
    // Enter fullscreen
    if (videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) { /* Safari */
      videoContainer.webkitRequestFullscreen();
    } else if (videoContainer.msRequestFullscreen) { /* IE11 */
      videoContainer.msRequestFullscreen();
    }
    isFullscreen.value = true;
    log('info', 'Entered fullscreen mode');
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
    isFullscreen.value = false;
    log('info', 'Exited fullscreen mode');
  }
}

// Handle fullscreen change events
const handleFullscreenChange = () => {
  if (!document.fullscreenElement && !document.webkitFullscreenElement &&
      !document.msFullscreenElement) {
    isFullscreen.value = false;
  }
}

// Load new videos function - now performs a full browser reload with cache clearing
const loadNewVideos = () => {
  log('info', 'Loading new videos - performing full reload with cache clearing...')
  
  // Show loading state immediately
  isLoading.value = true
  loadingText.value = 'Reloading with fresh cache...'
  
  // Clear all local caches before reload
  try {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear IndexedDB caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }).then(() => {
        log('info', 'All browser caches cleared successfully')
      })
    }
    
    // Add timestamp to URL to prevent browser caching
    const timestamp = Date.now()
    const url = new URL(window.location)
    url.searchParams.set('t', timestamp)
    
    // Force reload the page with cache bypass
    window.location.href = url.toString()
    
  } catch (error) {
    log('error', `Error clearing caches: ${error.message}`)
    // Fallback to simple reload if cache clearing fails
    window.location.reload(true)
  }
}

// Clear video cache from IndexedDB
const clearVideoCache = async () => {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['videos'], 'readwrite')
    const store = transaction.objectStore('videos')
    
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => {
        log('info', 'Video cache cleared successfully')
        resolve()
      }
      request.onerror = () => {
        log('error', `Failed to clear video cache: ${request.error}`)
        reject(request.error)
      }
    })
  } catch (error) {
    log('error', `Failed to clear video cache: ${error.message}`)
    throw error
  }
}

// Main initialization
const init = async () => {
  console.log('testing');
  try {
    log('info', 'Initializing Scentral Video Player...')
    
    // Initialize video element event listeners
    setupVideoEventListeners()
    
    // Add fullscreen event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    // Initialize MQTT connection
    await initializeMQTT()
    
    // Load initial manifest
    await loadManifest()
    
    isLoading.value = false
    log('info', 'Video player initialized successfully')
    
  } catch (error) {
    log('error', `Initialization failed: ${error.message}`)
    showErrorDialog(`Initialization failed: ${error.message}`)
  }
}

// Lifecycle hooks
onBeforeMount(() => {
  // Initialize configuration
  machineId.value = getMachineId()
  const urlParams = new URLSearchParams(window.location.search)
  const apiUrlParam = urlParams.get('apiUrl')
  if (apiUrlParam) {
    apiBaseUrl.value = apiUrlParam
  }
  debugMode.value = getDebugMode()
  
  // Ensure debugLogs is initialized before any logging
  if (!debugLogs.value) {
    debugLogs.value = []
  }
  
  if (debugMode.value) {
    log('info', `Debug mode enabled for machine: ${machineId.value}`)
  }
})

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  // Cleanup all intervals
  if (slotCheckInterval.value) {
    clearInterval(slotCheckInterval.value)
  }
  if (balanceCheckInterval.value) {
    clearInterval(balanceCheckInterval.value)
  }
  if (activeWindowCheckInterval.value) {
    clearInterval(activeWindowCheckInterval.value)
  }
  
  // Cleanup MQTT connection
  if (mqttClient.value && mqttClient.value.isConnected()) {
    mqttClient.value.disconnect()
  }
  
  // Remove fullscreen event listeners
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.video-player-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #000;
  color: #fff;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#videoContainer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

#videoPlayer {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#loadingOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #333;
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

#statusOverlay {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 14px;
  z-index: 5;
  max-width: 300px;
}

.status-item {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.status-label {
  color: #ccc;
}

.status-value {
  color: #fff;
  font-weight: bold;
}

#debugOverlay {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  font-family: monospace;
  z-index: 5;
  max-width: 400px;
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  margin: 2px 0;
  padding: 2px 0;
  border-bottom: 1px solid #333;
}

.log-time {
  color: #888;
  margin-right: 5px;
}

.log-level-info { color: #4CAF50; }
.log-level-warn { color: #FF9800; }
.log-level-error { color: #F44336; }

.hidden {
  display: none !important;
}

#errorOverlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(244, 67, 54, 0.9);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  z-index: 15;
  max-width: 400px;
}

.error-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.error-message {
  font-size: 14px;
  margin-bottom: 15px;
}

.retry-button {
  background: #fff;
  color: #F44336;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.retry-button:hover {
  background: #f5f5f5;
}

#loadVideoBtn {
  position: fixed;
  bottom: 20px;
  left: 80px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  transition: all 0.3s ease;
}

#loadVideoBtn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

#loadVideoBtn svg {
  width: 24px;
  height: 24px;
}

#fullscreenBtn {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  transition: all 0.3s ease;
}

#fullscreenBtn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

#fullscreenBtn svg {
  width: 24px;
  height: 24px;
}
</style>
