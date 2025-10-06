// Patch to fix slot detection and ad playing issues
// Replace the getCurrentTimeSlot function in pages/video-player.vue with this improved version

const getCurrentTimeSlot = () => {
  if (!manifest.value || !manifest.value.time_slots) {
    log('warn', 'No manifest or time slots available')
    return null
  }

  const now = new Date()
  // Adjust for timezone if needed - using local time for now
  const currentTime = formatTime(now.getHours(), now.getMinutes())
  
  log('info', `Checking current time slot for: ${currentTime}`)
  
  for (const slot of manifest.value.time_slots) {
    if (isTimeInSlot(currentTime, slot.start_time, slot.end_time)) {
      log('info', `Found active slot: ${slot.name} (${slot.start_time}-${slot.end_time})`)
      return slot
    }
  }
  
  log('info', `No active slot found for time: ${currentTime}`)
  return null
}

const isTimeInSlot = (currentTime, startTime, endTime) => {
  // Simple comparison - assuming times are in HH:MM format
  return currentTime >= startTime && currentTime <= endTime
}

// Add this function to check for slot changes
let lastSlotCheck = ref(null)
let slotCheckInterval = ref(null)

const startSlotMonitoring = () => {
  // Check for slot changes every minute
  slotCheckInterval.value = setInterval(() => {
    const currentSlot = getCurrentTimeSlot()
    const currentSlotName = currentSlot ? currentSlot.name : 'None'
    
    if (lastSlotCheck.value !== currentSlotName) {
      log('info', `Slot changed from ${lastSlotCheck.value} to ${currentSlotName}`)
      lastSlotCheck.value = currentSlotName
      
      // Refresh the playback loop when slot changes
      if (currentSlot && currentSlot.allow_general) {
        initializePlaybackLoop()
      }
    }
  }, 60000) // Check every minute
}

// Add this to the startPlaybackLoop function
const startPlaybackLoop = () => {
  updatePerfumeTimeToday()
  loadBrandBalances() // Load initial balances
  initializePlaybackLoop()
  
  // Start monitoring for slot changes
  startSlotMonitoring()
  
  // Set initial slot
  const currentSlot = getCurrentTimeSlot()
  lastSlotCheck.value = currentSlot ? currentSlot.name : 'None'
  
  playNextInLoop()
  
  // Refresh balances every 5 minutes
  setInterval(loadBrandBalances, 5 * 60 * 1000)
}

// Make sure to clear the interval when unmounting
onBeforeUnmount(() => {
  // Cleanup MQTT connection
  if (mqttClient.value && mqttClient.value.isConnected()) {
    mqttClient.value.disconnect()
  }
  
  // Clear slot monitoring interval
  if (slotCheckInterval.value) {
    clearInterval(slotCheckInterval.value)
  }
  
  // Remove fullscreen event listeners
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
})