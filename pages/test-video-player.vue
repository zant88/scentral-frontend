<template>
  <div class="test-container">
    <h1>Test Video Player with MQTT Integration</h1>
    
    <div class="test-section">
      <h2>MQTT Connection Status</h2>
      <div class="status-indicator" :class="{ 'connected': mqttConnected, 'disconnected': !mqttConnected }">
        {{ mqttConnected ? 'Connected' : 'Disconnected' }}
      </div>
      <button @click="toggleMQTT">{{ mqttConnected ? 'Disconnect' : 'Connect' }} MQTT</button>
    </div>
    
    <div class="test-section">
      <h2>Current Slot Information</h2>
      <div v-if="currentSlot">
        <p>Slot Name: {{ currentSlot.name }}</p>
        <p>Time: {{ currentSlot.start_time }} - {{ currentSlot.end_time }}</p>
        <p>Allow General: {{ currentSlot.allow_general ? 'Yes' : 'No' }}</p>
        <p>Allow Perfume: {{ currentSlot.allow_perfume ? 'Yes' : 'No' }}</p>
      </div>
      <div v-else>
        <p>No active slot at this time</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Available Videos for Current Slot</h2>
      <div v-if="availableVideos.length > 0">
        <ul>
          <li v-for="video in availableVideos" :key="video.id">
            {{ video.title }} ({{ video.ad_type }})
            <button @click="playVideo(video)" class="play-btn">Play</button>
            <span v-if="video.cached" class="cached-badge">Cached</span>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No videos available for current slot</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Video Cache Status</h2>
      <div v-if="Object.keys(videoCache).length > 0">
        <table>
          <thead>
            <tr>
              <th>Video</th>
              <th>Brand</th>
              <th>Cached</th>
              <th>Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cached, videoId) in videoCache" :key="videoId">
              <td>{{ cached.title }}</td>
              <td>{{ cached.brandName }}</td>
              <td>{{ cached.cached ? 'Yes' : 'No' }}</td>
              <td :class="{ 'low-balance': cached.balance < cached.costPerPlay }">
                {{ cached.balance.toFixed(2) }}
              </td>
              <td>
                <button @click="playCachedVideo(cached)" :disabled="!cached.cached || cached.balance < cached.costPerPlay">
                  Play
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>No videos in cache</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>Slot Assignments</h2>
      <div v-if="slotAssignments.length > 0">
        <table>
          <thead>
            <tr>
              <th>Video</th>
              <th>Slot</th>
              <th>Ad Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="assignment in slotAssignments" :key="assignment.id">
              <td>{{ assignment.video?.title || 'N/A' }}</td>
              <td>{{ assignment.slot?.name || 'N/A' }}</td>
              <td>{{ assignment.ad_type }}</td>
              <td>{{ assignment.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>No slot assignments found</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>MQTT Messages</h2>
      <div class="message-log">
        <div v-for="(message, index) in mqttMessages" :key="index" class="message-item">
          <span class="timestamp">{{ new Date(message.timestamp).toLocaleTimeString() }}</span>
          <span class="topic">{{ message.topic }}</span>
          <span class="payload">{{ JSON.stringify(message.payload) }}</span>
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <button @click="testVideoPlayer">Test Video Player</button>
      <p v-if="testResult">Test Result: {{ testResult }}</p>
    </div>
    
    <!-- Video Player Modal -->
    <div v-if="showVideoPlayer" class="video-modal" @click.self="closeVideoPlayer">
      <div class="video-content">
        <h3>{{ currentVideo?.title }}</h3>
        <video ref="videoElement" controls @ended="onVideoEnded" width="600">
          <source :src="currentVideo?.file_path" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="video-info">
          <p>Brand: {{ currentVideo?.brand_name }}</p>
          <p>Cost per play: {{ currentVideo?.cost_per_play }}</p>
          <p v-if="brandBalances[currentVideo?.brand_id]">
            Brand balance: {{ brandBalances[currentVideo?.brand_id].toFixed(2) }}
          </p>
        </div>
        <button @click="closeVideoPlayer">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import mqtt from 'mqtt'

const machineId = ref('6');
const apiBaseUrl = ref('http://localhost:3030/api');
const currentSlot = ref(null);
const availableVideos = ref([]);
const slotAssignments = ref([]);
const testResult = ref('');
const mqttClient = ref(null);
const mqttConnected = ref(false);
const mqttMessages = ref([]);
const videoCache = ref({});
const brandBalances = ref({});
const showVideoPlayer = ref(false);
const currentVideo = ref(null);
const videoElement = ref(null);

// Load manifest and check current slot
const loadManifest = async () => {
  try {
    const response = await fetch(`${apiBaseUrl.value}/video-player/manifest/${machineId.value}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to load manifest');
    }
    
    const manifest = data.data;
    console.log('Manifest loaded:', manifest);
    
    // Find current slot
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    for (const slot of manifest.time_slots) {
      if (currentTime >= slot.start_time && currentTime <= slot.end_time) {
        currentSlot.value = slot;
        console.log('Current slot:', slot);
        
        // Filter available videos based on slot assignments
        if (slot.allow_general) {
          availableVideos.value = manifest.general_ads.filter(video => 
            slot.general_video_ids.includes(video.id)
          );
        }
        
        if (slot.allow_perfume) {
          const perfumeVideos = manifest.perfume_ads.filter(video => 
            slot.perfume_video_ids.includes(video.id)
          );
          availableVideos.value = [...availableVideos.value, ...perfumeVideos];
        }
        
        break;
      }
    }
    
    if (!currentSlot.value) {
      console.log('No active slot found');
    }
    
  } catch (error) {
    console.error('Failed to load manifest:', error);
  }
};

// Load slot assignments
const loadSlotAssignments = async () => {
  try {
    const response = await fetch(`${apiBaseUrl.value}/video-player/slot-assignments/${machineId.value}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to load slot assignments');
    }
    
    slotAssignments.value = data.data;
    console.log('Slot assignments loaded:', data.data);
    
  } catch (error) {
    console.error('Failed to load slot assignments:', error);
  }
};

// Test video player
const testVideoPlayer = () => {
  if (currentSlot.value && availableVideos.value.length > 0) {
    testResult.value = `Success: Found ${availableVideos.value.length} videos for slot "${currentSlot.value.name}"`;
    window.open(`/video-player-slot-check?machineId=${machineId.value}`, '_blank');
  } else if (currentSlot.value) {
    testResult.value = `Warning: Slot "${currentSlot.value.name}" is active but no videos available`;
  } else {
    testResult.value = 'Error: No active slot at this time';
  }
};

// MQTT connection and message handling
const connectMQTT = () => {
  const mqttUrl = 'ws://localhost:9001'; // MQTT WebSocket URL
  const clientId = `video-player-${machineId.value}-${Math.random().toString(16).substr(2, 8)}`
  
  mqttClient.value = mqtt.connect(mqttUrl, {
    clientId,
    keepalive: 60,
    reconnectPeriod: 1000,
  });
  
  mqttClient.value.on('connect', () => {
    console.log('MQTT connected');
    mqttConnected.value = true;
    
    // Subscribe to video assignment updates
    mqttClient.value.subscribe(`scentral/video-player/assignment`, (err) => {
      if (err) {
        console.error('Failed to subscribe to assignment topic:', err);
      } else {
        console.log('Subscribed to video assignment updates');
      }
    });
    
    // Subscribe to balance updates
    mqttClient.value.subscribe(`scentral/brand/balance`, (err) => {
      if (err) {
        console.error('Failed to subscribe to balance topic:', err);
      } else {
        console.log('Subscribed to balance updates');
      }
    });
  });
  
  mqttClient.value.on('message', (topic, message) => {
    const payload = JSON.parse(message.toString());
    console.log('MQTT message received:', topic, payload);
    
    // Add to message log
    mqttMessages.value.unshift({
      timestamp: Date.now(),
      topic,
      payload
    });
    
    // Keep only last 50 messages
    if (mqttMessages.value.length > 50) {
      mqttMessages.value = mqttMessages.value.slice(0, 50);
    }
    
    // Handle different message types
    if (topic === 'scentral/video-player/assignment') {
      handleVideoAssignment(payload);
    } else if (topic === 'scentral/brand/balance') {
      handleBalanceUpdate(payload);
    }
  });
  
  mqttClient.value.on('error', (err) => {
    console.error('MQTT error:', err);
    mqttConnected.value = false;
  });
  
  mqttClient.value.on('close', () => {
    console.log('MQTT connection closed');
    mqttConnected.value = false;
  });
};

const disconnectMQTT = () => {
  if (mqttClient.value) {
    mqttClient.value.end();
    mqttClient.value = null;
    mqttConnected.value = false;
  }
};

const toggleMQTT = () => {
  if (mqttConnected.value) {
    disconnectMQTT();
  } else {
    connectMQTT();
  }
};

// Handle video assignment updates from MQTT
const handleVideoAssignment = async (assignment) => {
  console.log('Handling video assignment:', assignment);
  
  // Check if this message is for this machine
  if (assignment.machine_id && assignment.machine_id !== machineId.value) {
    return;
  }
  
  // Refresh manifest to get updated assignments
  await loadManifest();
  await loadSlotAssignments();
  
  // Cache the video if it's new or updated
  if (assignment.action === 'assigned' || assignment.action === 'updated') {
    await cacheVideo(assignment);
    
    // If shouldPlayNow is true, play the video immediately
    if (assignment.should_play_now) {
      playAssignedVideo(assignment);
    }
  } else if (assignment.action === 'removed') {
    // Remove from cache
    if (videoCache.value[assignment.video_id]) {
      delete videoCache.value[assignment.video_id];
    }
  }
};

// Handle balance updates from MQTT
const handleBalanceUpdate = (balanceUpdate) => {
  if (brandBalances.value[balanceUpdate.brand_id]) {
    brandBalances.value[balanceUpdate.brand_id] = balanceUpdate.balance;
  }
};

// Cache video for offline playback
const cacheVideo = async (assignment) => {
  try {
    console.log('Caching video:', assignment.video_url);
    
    // Check if video is already cached
    if (videoCache.value[assignment.video_id]?.cached) {
      console.log('Video already cached:', assignment.video_id);
      return;
    }
    
    // Create a video element to preload the video
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = assignment.video_url;
    
    // Wait for video to load
    await new Promise((resolve, reject) => {
      video.addEventListener('canplaythrough', resolve);
      video.addEventListener('error', reject);
    });
    
    // Update cache
    videoCache.value[assignment.video_id] = {
      id: assignment.video_id,
      title: assignment.brand_name,
      brandId: assignment.brand_id,
      brandName: assignment.brand_name,
      url: assignment.video_url,
      thumbnailUrl: assignment.thumbnail_url,
      duration: assignment.duration,
      costPerPlay: assignment.cost_per_play,
      adType: assignment.ad_type,
      cached: true,
      cachedAt: Date.now()
    };
    
    console.log('Video cached successfully:', assignment.video_id);
  } catch (error) {
    console.error('Failed to cache video:', error);
  }
};

// Play assigned video
const playAssignedVideo = async (assignment) => {
  // Check brand balance before playing
  const balance = await checkBrandBalance(assignment.brand_id);
  if (balance < assignment.cost_per_play) {
    console.log('Insufficient balance for brand:', assignment.brand_name);
    return;
  }
  
  // Play the video
  const videoData = {
    id: assignment.video_id,
    title: assignment.brand_name,
    brand_name: assignment.brand_name,
    brand_id: assignment.brand_id,
    file_path: assignment.video_url,
    cost_per_play: assignment.cost_per_play,
    ad_type: assignment.ad_type
  };
  
  playVideo(videoData);
};

// Play video
const playVideo = async (video) => {
  // Check balance before playing
  const balance = await checkBrandBalance(video.brand_id || video.brandId);
  if (balance < (video.cost_per_play || video.costPerPlay)) {
    alert('Insufficient balance for this video');
    return;
  }
  
  currentVideo.value = video;
  showVideoPlayer.value = true;
  
  // Wait for next tick to ensure video element is rendered
  await nextTick();
  
  if (videoElement.value) {
    videoElement.value.play();
    
    // Log playback event
    logPlaybackEvent(video);
  }
};

// Play cached video
const playCachedVideo = (cachedVideo) => {
  playVideo(cachedVideo);
};

// Close video player
const closeVideoPlayer = () => {
  if (videoElement.value) {
    videoElement.value.pause();
    videoElement.value.currentTime = 0;
  }
  showVideoPlayer.value = false;
  currentVideo.value = null;
};

// Handle video end
const onVideoEnded = () => {
  closeVideoPlayer();
};

// Check brand balance
const checkBrandBalance = async (brandId) => {
  try {
    const response = await fetch(`${apiBaseUrl.value}/video-player/brand-balance/${brandId}`);
    const data = await response.json();
    if (data.success) {
      brandBalances.value[brandId] = data.data.current_balance;
      return data.data.current_balance;
    }
  } catch (error) {
    console.error('Failed to check brand balance:', error);
  }
  return 0;
};

// Log playback event
const logPlaybackEvent = async (video) => {
  try {
    const eventData = {
      machine_id: machineId.value,
      video_id: video.id || video.videoId,
      brand_id: video.brand_id || video.brandId,
      ad_type: video.ad_type || video.adType,
      played_at: new Date().toISOString(),
      duration: video.duration || 0,
      status: 'started',
      cost: video.cost_per_play || video.costPerPlay
    };
    
    await fetch(`${apiBaseUrl.value}/video-player/log-playback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
  } catch (error) {
    console.error('Failed to log playback event:', error);
  }
};

// Load data on mount
onMounted(() => {
  loadManifest();
  loadSlotAssignments();
  
  // Connect to MQTT
  connectMQTT();
});

// Cleanup on unmount
onUnmounted(() => {
  disconnectMQTT();
});
</script>

<style scoped>
.test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

h1, h2 {
  color: #333;
}

.status-indicator {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  margin-right: 10px;
}

.status-indicator.connected {
  background-color: #d4edda;
  color: #155724;
}

.status-indicator.disconnected {
  background-color: #f8d7da;
  color: #721c24;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.play-btn {
  padding: 5px 10px;
  font-size: 12px;
  margin-left: 10px;
}

.cached-badge {
  background-color: #17a2b8;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-left: 10px;
}

.low-balance {
  color: #dc3545;
  font-weight: bold;
}

.message-log {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  background-color: #f8f9fa;
}

.message-item {
  margin-bottom: 10px;
  font-family: monospace;
  font-size: 12px;
}

.timestamp {
  color: #6c757d;
  margin-right: 10px;
}

.topic {
  color: #007bff;
  margin-right: 10px;
}

.payload {
  color: #28a745;
}

.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.video-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.video-info {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>