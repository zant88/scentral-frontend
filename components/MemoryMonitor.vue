<template>
  <div v-if="showMonitor" class="memory-monitor">
    <div class="monitor-header">
      <h4>Memory Monitor</h4>
      <button @click="toggleDetails" class="toggle-btn">
        {{ showDetails ? 'Hide' : 'Show' }} Details
      </button>
      <button @click="forceCleanup" class="cleanup-btn">Cleanup</button>
    </div>
    
    <div class="memory-usage">
      <div class="usage-bar">
        <div 
          class="usage-fill" 
          :style="{ width: memoryPercentage + '%', backgroundColor: memoryColor }"
        ></div>
      </div>
      <div class="usage-text">
        {{ memoryUsage.used }}MB / {{ memoryUsage.total }}MB ({{ memoryPercentage }}%)
      </div>
    </div>
    
    <div v-if="showDetails" class="memory-details">
      <div class="detail-item">
        <span>Used:</span>
        <span>{{ memoryUsage.used }}MB</span>
      </div>
      <div class="detail-item">
        <span>Total:</span>
        <span>{{ memoryUsage.total }}MB</span>
      </div>
      <div class="detail-item">
        <span>Limit:</span>
        <span>{{ memoryUsage.limit }}MB</span>
      </div>
      <div class="detail-item">
        <span>Cached Videos:</span>
        <span>{{ cachedVideosCount }}</span>
      </div>
      <div class="detail-item">
        <span>Active Intervals:</span>
        <span>{{ activeIntervalsCount }}</span>
      </div>
      <div class="detail-item">
        <span>Last Cleanup:</span>
        <span>{{ lastCleanupTime }}</span>
      </div>
    </div>
    
    <div v-if="warnings.length > 0" class="warnings">
      <div v-for="(warning, index) in warnings" :key="index" class="warning-item">
        ⚠️ {{ warning }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  showMonitor: {
    type: Boolean,
    default: false
  },
  memoryThreshold: {
    type: Number,
    default: 150 // MB
  },
  criticalThreshold: {
    type: Number,
    default: 200 // MB
  }
})

const emit = defineEmits(['memory-warning', 'memory-critical', 'cleanup-performed'])

const showDetails = ref(false)
const memoryUsage = ref({
  used: 0,
  total: 0,
  limit: 0
})
const cachedVideosCount = ref(0)
const activeIntervalsCount = ref(0)
const lastCleanupTime = ref('Never')
const warnings = ref([])
const monitoringInterval = ref(null)

const memoryPercentage = computed(() => {
  if (memoryUsage.value.total === 0) return 0
  return Math.round((memoryUsage.value.used / memoryUsage.value.total) * 100)
})

const memoryColor = computed(() => {
  const percentage = memoryPercentage.value
  if (percentage > 80) return '#F44336' // Red
  if (percentage > 60) return '#FF9800' // Orange
  return '#4CAF50' // Green
})

const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    }
  }
  
  // Fallback for browsers without performance.memory
  return {
    used: 0,
    total: 0,
    limit: 0
  }
}

const checkMemoryUsage = () => {
  const usage = getMemoryUsage()
  memoryUsage.value = usage
  
  // Check thresholds
  if (usage.used > props.criticalThreshold) {
    const warning = `Critical memory usage: ${usage.used}MB exceeds threshold of ${props.criticalThreshold}MB`
    if (!warnings.value.includes(warning)) {
      warnings.value.push(warning)
      emit('memory-critical', usage)
    }
  } else if (usage.used > props.memoryThreshold) {
    const warning = `High memory usage: ${usage.used}MB exceeds threshold of ${props.memoryThreshold}MB`
    if (!warnings.value.includes(warning)) {
      warnings.value.push(warning)
      emit('memory-warning', usage)
    }
  }
  
  // Clear old warnings if memory is back to normal
  if (usage.used < props.memoryThreshold) {
    warnings.value = warnings.value.filter(w => !w.includes('memory usage'))
  }
}

const forceCleanup = () => {
  performCleanup()
  emit('cleanup-performed', memoryUsage.value)
}

const performCleanup = () => {
  // Force garbage collection if available
  if (window.gc) {
    window.gc()
  }
  
  // Clear old warnings
  warnings.value = []
  
  // Update last cleanup time
  lastCleanupTime.value = new Date().toLocaleTimeString()
  
  // Check memory after cleanup
  setTimeout(() => {
    checkMemoryUsage()
  }, 1000)
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const updateCachedVideosCount = (count) => {
  cachedVideosCount.value = count
}

const updateActiveIntervalsCount = (count) => {
  activeIntervalsCount.value = count
}

// Expose methods for parent component
defineExpose({
  updateCachedVideosCount,
  updateActiveIntervalsCount,
  forceCleanup,
  checkMemoryUsage
})

onMounted(() => {
  // Initial check
  checkMemoryUsage()
  
  // Monitor every 5 seconds
  monitoringInterval.value = setInterval(checkMemoryUsage, 5000)
})

onBeforeUnmount(() => {
  if (monitoringInterval.value) {
    clearInterval(monitoringInterval.value)
  }
})
</script>

<style scoped>
.memory-monitor {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 12px;
  z-index: 10000;
  min-width: 250px;
  border: 1px solid #333;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.monitor-header h4 {
  margin: 0;
  font-size: 14px;
}

.toggle-btn, .cleanup-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  margin-left: 5px;
}

.toggle-btn:hover, .cleanup-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.cleanup-btn {
  background: rgba(244, 67, 54, 0.7);
}

.cleanup-btn:hover {
  background: rgba(244, 67, 54, 0.9);
}

.memory-usage {
  margin-bottom: 8px;
}

.usage-bar {
  width: 100%;
  height: 10px;
  background: #333;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 4px;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.usage-text {
  font-size: 10px;
  text-align: center;
}

.memory-details {
  border-top: 1px solid #333;
  padding-top: 8px;
  margin-top: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  font-size: 10px;
}

.warnings {
  margin-top: 8px;
  border-top: 1px solid #333;
  padding-top: 8px;
}

.warning-item {
  color: #FF9800;
  font-size: 10px;
  margin-bottom: 2px;
}
</style>