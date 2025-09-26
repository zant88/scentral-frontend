<template>
  <div class="ad-display-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading advertisement...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchActiveAd">Try Again</button>
    </div>
    <div v-else class="video-wrapper" @mousemove="handleMouseMove">
      <video ref="videoPlayer" preload="auto" autoplay muted playsinline disablepictureinpicture
        controlslist="nodownload noplaybackrate nofullscreen noremoteplayback" controls="false"
        @click="toggleFullscreen" @error="handleVideoError" @loadeddata="videoLoaded"
        @canplay="console.log('Video can play now')" @ended="onVideoEnded"
        @loadstart="console.log('Video load started')" @progress="console.log('Video loading progress')">
        <source :src="videoSource" type="video/mp4">
        Your browser does not support the video tag.
      </video>

      <!-- Exit fullscreen button -->
      <button v-if="isFullscreen && showExitButton" class="exit-fullscreen-btn" @click="exitFullscreen"
        title="Exit Fullscreen">
        ✕
      </button>

      <div class="ad-info" v-if="currentAd && currentAd.title">
        <h2>{{ currentAd.title }}</h2>
        <p>{{ currentAd.description }}</p>
        <div class="ad-counter" v-if="advertisements.length > 1">
          {{ currentAdIndex + 1 }} / {{ advertisements.length }}
        </div>
      </div>
      <div class="fullscreen-button" @click="toggleFullscreen">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </div>
      <div class="status-indicator" v-if="mqttStatus">
        {{ mqttStatus }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
const apiBase = config.public.apiBase || 'http://localhost:3000';
const { $mqtt } = useNuxtApp()
const videoPlayer = ref(null);
const currentAd = ref({ video_url: '' });
const advertisements = ref([]);
const currentAdIndex = ref(0);
const loading = ref(true);
const error = ref(null);
const mqttStatus = ref('');
const failedVideos = ref(new Set());
const isTransitioning = ref(false);
const isFullscreen = ref(false);
const showExitButton = ref(false);
const mouseTimer = ref(null);
let mqttClient = null;
let adRotationInterval = null;

// Computed property for video source with cache busting
const videoSource = computed(() => {
  if (!currentAd.value || !currentAd.value.video_url) return '';
  const baseUrl = getFullVideoUrl(currentAd.value.video_url);
  const timestamp = new Date().getTime();
  return `${baseUrl}?t=${timestamp}`;
});

// Function to get full video URL
function getFullVideoUrl(videoUrl) {
  if (!videoUrl) return '';

  // If the URL is already absolute (starts with http:// or https://), use it as is
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }

  // If the URL starts with /videos, it's a path to a video file
  if (videoUrl.startsWith('/videos/')) {
    return `${apiBase}${videoUrl}`;
  }

  // Otherwise, assume it's just a filename and prepend the videos path
  // For filenames with spaces, we need to encode them for URLs
  console.log('Original video URL:', videoUrl);
  const encodedUrl = encodeURIComponent(videoUrl);
  console.log('Encoded video URL:', encodedUrl);
  return `${apiBase}/videos/${encodedUrl}`;
}

// Fetch active advertisement
async function fetchActiveAd() {
  loading.value = true;
  error.value = null;

  try {
    // Use fetch directly instead of useFetch to avoid authentication issues
    const response = await fetch(`${apiBase}/api/advertisement/active`);
    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch advertisement: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched advertisements data:', data);

    if (data && data.length > 0) {
      // Process video URLs for all advertisements
      for (const ad of data) {
        if (ad.video_url) {
          ad.video_url = getFullVideoUrl(ad.video_url);
        }
      }

      advertisements.value = data;
      currentAdIndex.value = 0;
      currentAd.value = advertisements.value[0];

      console.log('Processed advertisements:', advertisements.value);

      // Start playing the first video
      if (currentAd.value.video_url && videoPlayer.value) {
        playVideo();
      }

      // Start the rotation if there are multiple ads
      if (advertisements.value.length > 1) {
        startAdRotation();
      }
    } else {
      throw new Error('No active advertisements found');
    }
  } catch (err) {
    console.error('Error fetching advertisement:', err);
    error.value = err.message || 'Failed to load advertisement';
  } finally {
    loading.value = false;
  }
}

// Function to play the current video
function playVideo() {
  if (!videoPlayer.value || !currentAd.value.video_url) return;

  console.log('Playing video:', currentAd.value.video_url);
  videoPlayer.value.load();

  videoPlayer.value.play().catch(e => console.error('Error playing video:', e));
}

// Function to start ad rotation
function startAdRotation() {
  // Clear any existing interval
  if (adRotationInterval) {
    clearInterval(adRotationInterval);
  }

  console.log('Ad rotation started for', advertisements.value.length, 'advertisements');

  // Set up video ended event listener to automatically go to next ad
  // We'll add this in videoLoaded to ensure the video element is ready
}

// Function to go to next advertisement
function nextAd() {
  console.log('nextAd function called');

  // Prevent multiple simultaneous calls
  if (isTransitioning.value) {
    console.log('Already transitioning, ignoring call');
    return;
  }

  if (advertisements.value.length === 0) return;

  // Set transitioning flag
  isTransitioning.value = true;

  // If there's only one video, just replay it
  if (advertisements.value.length === 1) {
    console.log('Only one video available, replaying');
    if (currentAd.value.video_url && videoPlayer.value) {
      playVideo();
    }
    isTransitioning.value = false;
    return;
  }

  let attempts = 0;
  const maxAttempts = advertisements.value.length;
  const originalIndex = currentAdIndex.value;

  // Move to next index with proper circular rotation
  currentAdIndex.value = (currentAdIndex.value + 1) % advertisements.value.length;
  console.log(`Moving from index ${originalIndex} to ${currentAdIndex.value}`);

  // Find next valid video (not in failed list)
  while (attempts < maxAttempts) {
    currentAd.value = advertisements.value[currentAdIndex.value];

    // Check if current video is not in failed list
    if (!failedVideos.value.has(currentAd.value?.video_url)) {
      console.log(`Found valid video at index ${currentAdIndex.value}: ${currentAd.value.title}`);
      break;
    }

    console.log(`Video at index ${currentAdIndex.value} is in failed list, trying next`);
    // Move to next index
    currentAdIndex.value = (currentAdIndex.value + 1) % advertisements.value.length;
    attempts++;
  }

  // If all videos have failed, clear the failed list and start from beginning
  if (attempts >= maxAttempts) {
    console.log('All videos failed, clearing failed list and starting from first video');
    failedVideos.value.clear();
    currentAdIndex.value = 0;
    currentAd.value = advertisements.value[0];
  }

  console.log(`Now playing ad ${currentAdIndex.value + 1}/${advertisements.value.length}: ${currentAd.value.title}`);

  // Play the next video
  if (currentAd.value.video_url && videoPlayer.value) {
    playVideo();
  }

  // Reset transitioning flag after a short delay to allow video to start loading
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500);
}

// Function to go to next advertisement
// function nextAd() {
//   console.log('nextAd function called');
//   if (advertisements.value.length === 0) return;

//   let attempts = 0;
//   const maxAttempts = advertisements.value.length;
//   let startIndex = currentAdIndex.value;

//   do {
//     // Move to next index with proper circular rotation
//     currentAdIndex.value = (currentAdIndex.value + 1) % advertisements.value.length;
//     currentAd.value = advertisements.value[currentAdIndex.value];
//     attempts++;

//     // If we've tried all videos and they're all failed, clear the failed list and start over
//     if (attempts >= maxAttempts && failedVideos.value.size >= advertisements.value.length) {
//       console.log('All videos failed, clearing failed list and retrying');
//       failedVideos.value.clear();
//       // Reset to first video after clearing failed list
//       currentAdIndex.value = 0;
//       currentAd.value = advertisements.value[0];
//       break;
//     }

//     // Prevent infinite loop - if we've cycled through all ads, break
//     if (attempts >= maxAttempts) {
//       break;
//     }
//   } while (failedVideos.value.has(currentAd.value?.video_url));

//   console.log(`Switching to ad ${currentAdIndex.value + 1}/${advertisements.value.length}:`, currentAd.value.title);
//   console.log('Current index after rotation:', currentAdIndex.value);

//   // Play the next video
//   if (currentAd.value.video_url && videoPlayer.value) {
//     playVideo();
//   }
// }

// Function to stop ad rotation
function stopAdRotation() {
  if (adRotationInterval) {
    clearInterval(adRotationInterval);
    adRotationInterval = null;
  }

  if (videoPlayer.value) {
    videoPlayer.value.removeEventListener('ended', nextAd);
  }
}

// Handle video loading errors
function handleVideoError(e) {
  console.error('Video error:', e);
  console.error('Video error details:', e.target.error);
  console.error('Current video source:', currentAd.value.video_url);

  // Mark this video as failed
  if (currentAd.value?.video_url) {
    failedVideos.value.add(currentAd.value.video_url);
    console.log('Marked video as failed:', currentAd.value.video_url);
  }

  error.value = `Failed to load video: ${e.target.error?.message || 'Unknown error'}`;

  // Try to skip to next video if there are multiple ads
  if (advertisements.value.length > 1) {
    console.log('Skipping to next video due to error');
    setTimeout(() => {
      nextAd();
    }, 1000);
  }
}

// Handle video ended event
function onVideoEnded() {
  console.log('Video ended event triggered');
  if (advertisements.value.length > 1) {
    nextAd();
  }
}

// Handle mouse movement to show/hide exit button
function handleMouseMove(event) {
  if (!isFullscreen.value) return;

  // Show cursor temporarily
  const videoWrapper = event.currentTarget;
  videoWrapper.style.cursor = 'default';

  // Clear existing timer
  if (mouseTimer.value) {
    clearTimeout(mouseTimer.value);
  }

  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if mouse is in top-right corner (within 100px from top and right edges)
  const isInTopRightCorner = x > rect.width - 100 && y < 100;

  showExitButton.value = isInTopRightCorner;

  // Hide cursor and exit button after 3 seconds of inactivity
  mouseTimer.value = setTimeout(() => {
    videoWrapper.style.cursor = 'none';
    showExitButton.value = false;
  }, 3000);
}

// Exit fullscreen
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

// Called when video is loaded successfully
function videoLoaded() {
  console.log('Video loaded successfully');
  mqttStatus.value = 'Video loaded successfully';
  setTimeout(() => { mqttStatus.value = ''; }, 3000);
}

// Initial fetch of advertisements
await fetchActiveAd();

onMounted(() => {
  // connectMqtt();

  // Add fullscreen change event listeners
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Add ESC key listener
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // Clean up ad rotation
  stopAdRotation();
  onReceiveMqtt();
  // Remove fullscreen change event listeners
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

  // Remove ESC key listener
  document.removeEventListener('keydown', handleKeyDown);
  
  if (mqttClient) {
    mqttClient.end();
  }
});

function onReceiveMqtt() {

  try {
    // For browser compatibility, use WebSocket connection with proper options
    $mqtt.on('message', async (topic, message) => {
      const msgStr = message.toString();
      console.log(`Received MQTT message on ${topic}:`, msgStr);
    });
  } catch (err) {
    console.error('Failed to connect to MQTT:', err);
    mqttStatus.value = 'Failed to connect to MQTT';
    setTimeout(() => { mqttStatus.value = ''; }, 3000);
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    if (videoPlayer.value.requestFullscreen) {
      videoPlayer.value.requestFullscreen();
    } else if (videoPlayer.value.webkitRequestFullscreen) {
      videoPlayer.value.webkitRequestFullscreen();
    } else if (videoPlayer.value.mozRequestFullScreen) {
      videoPlayer.value.mozRequestFullScreen();
    } else if (videoPlayer.value.msRequestFullscreen) {
      videoPlayer.value.msRequestFullscreen();
    }
  } else {
    exitFullscreen();
  }
}

// Handle fullscreen change events
function handleFullscreenChange() {
  isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

  const videoWrapper = document.querySelector('.video-wrapper');

  if (!isFullscreen.value) {
    showExitButton.value = false;
    if (videoWrapper) {
      videoWrapper.style.cursor = 'default';
    }
    if (mouseTimer.value) {
      clearTimeout(mouseTimer.value);
    }
  } else {
    // Hide cursor immediately when entering fullscreen
    if (videoWrapper) {
      videoWrapper.style.cursor = 'none';
    }
  }
}

// Handle ESC key to exit fullscreen
function handleKeyDown(event) {
  if (event.key === 'Escape' && isFullscreen.value) {
    exitFullscreen();
  }
}

definePageMeta({
  layout: 'empty',
});
</script>

<style scoped>
.ad-display-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Hide all video controls completely */
video::-webkit-media-controls {
  display: none !important;
}

video::-webkit-media-controls-panel {
  display: none !important;
}

video::-webkit-media-controls-play-button {
  display: none !important;
}

video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

video::-webkit-media-controls-timeline {
  display: none !important;
}

video::-webkit-media-controls-current-time-display {
  display: none !important;
}

video::-webkit-media-controls-time-remaining-display {
  display: none !important;
}

video::-webkit-media-controls-mute-button {
  display: none !important;
}

video::-webkit-media-controls-volume-slider {
  display: none !important;
}

video::-webkit-media-controls-fullscreen-button {
  display: none !important;
}

video::-webkit-media-controls-overlay-play-button {
  display: none !important;
}

/* Firefox controls */
video::-moz-media-controls {
  display: none !important;
}

/* Hide controls in fullscreen mode */
video:-webkit-full-screen::-webkit-media-controls {
  display: none !important;
}

video:-moz-full-screen::-moz-media-controls {
  display: none !important;
}

video:fullscreen::-webkit-media-controls {
  display: none !important;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-wrapper:fullscreen {
  cursor: none;
}

.video-wrapper:-webkit-full-screen {
  cursor: none;
}

.video-wrapper:-moz-full-screen {
  cursor: none;
}

.video-wrapper:-ms-fullscreen {
  cursor: none;
}

.exit-fullscreen-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.exit-fullscreen-btn:hover {
  background: rgba(255, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.8);
  opacity: 1;
  transform: scale(1.1);
}

.exit-fullscreen-btn:active {
  transform: scale(0.95);
}

.loading-overlay {
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
  color: white;
  z-index: 10;
}

.fullscreen-button {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 50%;
  z-index: 10;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  color: white;
  text-align: center;
  padding: 20px;
}

.error-container button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin-top: 20px;
  cursor: pointer;
  border-radius: 4px;
}

.ad-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 10;
}

.ad-counter {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
  text-align: right;
}

.status-indicator {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;
  transition: opacity 0.5s ease;
}
</style>