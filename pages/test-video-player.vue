<template>
  <div class="test-container">
    <h1>Test Video Player with Slot Checking</h1>
    
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
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No videos available for current slot</p>
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
      <button @click="testVideoPlayer">Test Video Player</button>
      <p v-if="testResult">Test Result: {{ testResult }}</p>
    </div>
  </div>
</template>

<script setup>
const machineId = ref('6');
const apiBaseUrl = ref('http://localhost:3030/api');
const currentSlot = ref(null);
const availableVideos = ref([]);
const slotAssignments = ref([]);
const testResult = ref('');

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

// Load data on mount
onMounted(() => {
  loadManifest();
  loadSlotAssignments();
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
}

button:hover {
  background-color: #45a049;
}
</style>