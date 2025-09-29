<template>
  <section class="section">
    <div class="section-header">
      <h1>Video Management</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Video Management</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Advertising Video Management</h2>
      <p class="section-lead">Upload, manage, and assign advertising videos to slots</p>
      
      <!-- Video Statistics -->
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-video"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Videos</h4></div>
              <div class="card-body">{{ videoStats.totalVideos }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-leaf"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Perfume Videos</h4></div>
              <div class="card-body">{{ videoStats.perfumeVideos }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-tv"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>General Videos</h4></div>
              <div class="card-body">{{ videoStats.generalVideos }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-play"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Active Videos</h4></div>
              <div class="card-body">{{ videoStats.activeVideos }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Library -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header actionable">
              <div class="left-action">
                <button class="btn btn-icon btn-primary note-btn" @click="goToCreatePage" style="cursor: pointer;"><i class="fas fa-plus"></i></button>
              </div>
              <div class="right-action">
                <div class="input-group">
                  <select class="form-control" v-model="filterType">
                    <option value="">All Types</option>
                    <option value="perfume">Perfume</option>
                    <option value="general">General</option>
                  </select>
                  <select class="form-control ml-2" v-model="filterStatus">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                  <input type="text" class="form-control ml-2" placeholder="Search videos..." v-model="searchQuery">
                  <div class="input-group-btn">
                    <button class="btn btn-primary"><i class="fas fa-search"></i></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Brand</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Cost</th>
                      <th>Status</th>
                    <th>Slot Assignment</th>
                    <th>Plays</th>
                    <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="video in filteredVideos" :key="video.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="video-thumbnail mr-3">
                            <video v-if="video.file_path" :src="getVideoUrl(video.file_path)" class="thumbnail-video" muted></video>
                            <div v-else class="thumbnail-placeholder">
                              <i class="fas fa-video"></i>
                            </div>
                          </div>
                          <div>
                            <div class="font-weight-600">{{ video.title }}</div>
                            <div class="text-muted small">{{ video.description }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="font-weight-600">{{ getBrandName(video) }}</div>
                        <div class="text-muted small">ID: {{ video.brand_id }}</div>
                      </td>
                      <td>
                        <span class="badge" :class="video.ad_type === 'perfume' ? 'badge-primary' : 'badge-success'">
                          {{ video.ad_type }}
                        </span>
                      </td>
                      <td>
                        <div>{{ formatDuration(video.duration_seconds) }}</div>
                        <div class="text-muted small">{{ video.duration_seconds }}s</div>
                      </td>
                      <td>
                        <div class="font-weight-600">{{ Math.ceil(video.duration_seconds / 15) }}</div>
                        <div class="text-muted small">balance</div>
                      </td>
                      <td>
                        <span class="badge" :class="getStatusClass(video.status)">
                          {{ video.status }}
                        </span>
                      </td>
                      <td>
                        <div v-if="video.slot_assignments && video.slot_assignments.length > 0">
                          <div v-for="assignment in video.slot_assignments" :key="assignment.id" class="mb-1">
                            <small class="badge badge-info">
                              <i class="fas fa-calendar mr-1"></i>
                              {{ assignment.slot ? assignment.slot.name : `Slot ${assignment.slot_id}` }}
                            </small>
                          </div>
                        </div>
                        <small v-else class="text-muted">Not assigned</small>
                      </td>
                      <td>
                        <div class="text-center">
                          <div class="font-weight-600">{{ video.playCount || 0 }}</div>
                          <div class="text-muted small">plays</div>
                        </div>
                      </td>
                      <td>
                        <div class="dropdown">
                          <a href="#" data-toggle="dropdown" class="btn btn-sm btn-outline-primary dropdown-toggle">Actions</a>
                          <div class="dropdown-menu">
                            <NuxtLink :to="`/admin/videos/update/${video.id}`" class="dropdown-item">Edit</NuxtLink>
                            <a href="#" class="dropdown-item" @click="previewVideo(video)">Preview</a>
                            <a href="#" class="dropdown-item" @click="assignToSlot(video)">Assign to Slot</a>
                            <a href="#" class="dropdown-item" @click="viewAnalytics(video.id)">View Analytics</a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item text-danger" @click="deleteVideo(video.id)">Delete</a>
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

  <!-- Video Preview Modal -->
  <div v-if="showPreviewModal" class="modal-overlay" @click.self="closePreviewModal">
    <div class="modal-dialog modal-lg" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Video Preview</h5>
          <button type="button" class="close-btn" @click="closePreviewModal">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body text-center">
          <div v-if="previewVideoData" class="video-container">
            <div v-if="!videoError">
              <video 
                id="previewVideoElement"
                class="preview-video" 
                controls 
                preload="metadata"
                @error="handleVideoError"
                @loadstart="handleVideoLoadStart"
                @canplay="handleVideoCanPlay"
              >
                <source :src="getVideoUrl(previewVideoData.file_path)" type="video/mp4">
                <source :src="getVideoUrl(previewVideoData.file_path)" type="video/webm">
                <source :src="getVideoUrl(previewVideoData.file_path)" type="video/ogg">
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div v-if="videoError" class="video-error">
              <i class="fas fa-exclamation-triangle"></i>
              <p>Unable to load video</p>
              <p>Please check if the video file exists and is accessible.</p>
              <small>{{ getVideoUrl(previewVideoData.file_path) }}</small>
            </div>
            
            <div v-if="videoLoading && !videoError" class="text-center p-4">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-2">Loading video...</p>
            </div>
          </div>
          <div class="mt-3" v-if="previewVideoData">
            <h6>{{ previewVideoData.title }}</h6>
            <p class="text-muted">{{ previewVideoData.description }}</p>
            <div class="row">
              <div class="col-md-4">
                <strong>Duration:</strong> {{ formatDuration(previewVideoData.duration_seconds) }}
              </div>
              <div class="col-md-4">
                <strong>Cost:</strong> {{ Math.ceil((previewVideoData.duration_seconds || 0) / 15) }} balance
              </div>
              <div class="col-md-4">
                <strong>Brand:</strong> {{ getBrandName(previewVideoData) }}
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-12">
                <strong>File Path:</strong> <small class="text-muted">{{ previewVideoData.file_path || 'N/A' }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Slot Assignment Modal -->
  <div v-if="showSlotAssignmentModal" class="modal-overlay" @click="closeSlotAssignmentModal">
    <div class="modal-dialog" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Assign Video to Slot</h5>
          <button type="button" class="close-btn" @click="closeSlotAssignmentModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedVideoForSlot" class="mb-4">
            <h6 class="text-muted mb-2">Selected Video:</h6>
            <div class="d-flex align-items-center">
              <div class="video-thumbnail mr-3">
                <i class="fas fa-play thumbnail-placeholder"></i>
              </div>
              <div>
                <div class="font-weight-bold">{{ selectedVideoForSlot.title }}</div>
                <small class="text-muted">{{ selectedVideoForSlot.description }}</small>
              </div>
            </div>
          </div>

          <form @submit.prevent="submitSlotAssignment">
            <div class="form-group">
              <label for="slotSelect">Select Slot *</label>
              <select 
                id="slotSelect" 
                v-model="slotAssignmentForm.slotId" 
                class="form-control" 
                :disabled="loadingSlots"
                required
              >
                <option value="">{{ loadingSlots ? 'Loading slots...' : 'Choose a slot' }}</option>
                <option 
                  v-for="slot in availableSlots" 
                  :key="slot.id || slot.ID" 
                  :value="slot.id || slot.ID"
                >
                  {{ slot.name }} 
                  <span v-if="slot.machine_name">({{ slot.machine_name }})</span>
                  - {{ slot.perfume_seconds }}s perfume, {{ slot.general_seconds }}s general
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="prioritySelect">Priority</label>
              <select id="prioritySelect" v-model="slotAssignmentForm.priority" class="form-control">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="startDate">Start Date (Optional)</label>
                  <input 
                    id="startDate" 
                    v-model="slotAssignmentForm.startDate" 
                    type="date" 
                    class="form-control"
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="endDate">End Date (Optional)</label>
                  <input 
                    id="endDate" 
                    v-model="slotAssignmentForm.endDate" 
                    type="date" 
                    class="form-control"
                  >
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <button 
                type="button" 
                class="btn btn-secondary mr-2" 
                @click="closeSlotAssignmentModal"
                :disabled="assigningToSlot"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="assigningToSlot || !slotAssignmentForm.slotId"
              >
                <i v-if="assigningToSlot" class="fas fa-spinner fa-spin mr-2"></i>
                {{ assigningToSlot ? 'Assigning...' : 'Assign to Slot' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'

definePageMeta({
  middleware: 'auth'
})

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Reactive data
const videos = ref([])
const brands = ref([])
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const editingVideo = ref(null)
const uploading = ref(false)
const saving = ref(false)
const selectedFile = ref(null)
const selectedFileName = ref('')
const previewVideoData = ref(null)
const showPreviewModal = ref(false)
const videoError = ref(false)
const videoLoading = ref(false)

const videoStats = ref({
  totalVideos: 0,
  perfumeVideos: 0,
  generalVideos: 0,
  activeVideos: 0
})

const videoForm = ref({
  title: '',
  description: '',
  brandId: '',
  adType: '',
  durationSeconds: 0,
  priority: 'medium',
  status: 'active',
  autoAssign: false,
  skipBalanceCheck: false
})

// Computed properties
const filteredVideos = computed(() => {
  let filtered = videos.value
  
  if (filterType.value) {
    filtered = filtered.filter(video => video.adType === filterType.value)
  }
  
  if (filterStatus.value) {
    filtered = filtered.filter(video => video.status === filterStatus.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// Fetch data
const fetchVideos = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/video?include_assignments=true`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (data.success) {
      videos.value = data.data || []
      calculateStats()
    }
  } catch (error) {
    console.error('Error fetching videos:', error)
  }
}

const fetchBrands = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    console.log('Brands response:', data) // Debug log
    
    if (data.success && data.data) {
      brands.value = data.data
      console.log('Brands loaded:', brands.value) // Debug log
    } else if (data.data) {
      // Handle case where success field might be missing
      brands.value = Array.isArray(data.data) ? data.data : []
      console.log('Brands loaded (no success field):', brands.value) // Debug log
    } else {
      console.warn('No brand data received:', data)
      brands.value = []
    }
  } catch (error) {
    console.error('Error fetching brands:', error)
    brands.value = []
  }
}

// Calculate statistics
const calculateStats = () => {
  const perfumeVideos = videos.value.filter(v => v.adType === 'perfume').length
  const generalVideos = videos.value.filter(v => v.adType === 'general').length
  const activeVideos = videos.value.filter(v => v.status === 'active').length
  
  videoStats.value = {
    totalVideos: videos.value.length,
    perfumeVideos,
    generalVideos,
    activeVideos
  }
}

// File handling
const onFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  selectedFile.value = file
  selectedFileName.value = file.name
  
  // Get video duration
  try {
    const duration = await getVideoDuration(file)
    videoForm.value.durationSeconds = Math.round(duration)
  } catch (error) {
    console.error('Error getting video duration:', error)
  }
}

const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

// Save video
const saveVideo = async () => {
  try {
    if (editingVideo.value) {
      await updateVideo()
    } else {
      await uploadVideo()
    }
  } catch (error) {
    console.error('Error saving video:', error)
  }
}

const uploadVideo = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('video', selectedFile.value)
    formData.append('title', videoForm.value.title)
    formData.append('description', videoForm.value.description)
    formData.append('brand_id', videoForm.value.brandId)
    formData.append('ad_type', videoForm.value.adType)
    formData.append('duration_seconds', videoForm.value.durationSeconds)
    formData.append('priority', videoForm.value.priority)
    formData.append('status', videoForm.value.status)
    formData.append('auto_assign', videoForm.value.autoAssign)
    formData.append('skip_balance_check', videoForm.value.skipBalanceCheck)
    
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/video/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    })
    
    const data = await response.json()
    if (data.success) {
      await fetchVideos()
      resetForm()
      alert('Video uploaded successfully!')
    } else {
      alert('Error uploading video: ' + (data.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error uploading video:', error)
    alert('Error uploading video')
  } finally {
    uploading.value = false
  }
}

const updateVideo = async () => {
  saving.value = true
  
  try {
    const formData = new FormData()
    if (selectedFile.value) {
      formData.append('video', selectedFile.value)
    }
    formData.append('title', videoForm.value.title)
    formData.append('description', videoForm.value.description)
    formData.append('brand_id', videoForm.value.brandId)
    formData.append('ad_type', videoForm.value.adType)
    formData.append('duration_seconds', videoForm.value.durationSeconds)
    formData.append('priority', videoForm.value.priority)
    formData.append('status', videoForm.value.status)
    
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/video/${editingVideo.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    })
    
    const data = await response.json()
    if (data.success) {
      await fetchVideos()
      resetForm()
      alert('Video updated successfully!')
    } else {
      alert('Error updating video: ' + (data.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error updating video:', error)
    alert('Error updating video')
  } finally {
    saving.value = false
  }
}

// Delete video
const deleteVideo = async (videoId) => {
  if (!confirm('Are you sure you want to delete this video?')) return
  
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/video/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      await fetchVideos()
      alert('Video deleted successfully!')
    } else {
      alert('Error deleting video: ' + (data.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error deleting video:', error)
    alert('Error deleting video')
  }
}

// Edit video
const editVideo = (video) => {
  editingVideo.value = video
  videoForm.value = {
    title: video.title,
    description: video.description,
    brandId: video.brand_id,
    adType: video.ad_type,
    durationSeconds: video.duration_seconds,
    priority: video.priority || 'medium',
    status: video.status,
    autoAssign: false,
    skipBalanceCheck: false
  }
  selectedFileName.value = ''
}

// Reset form
const resetForm = () => {
  editingVideo.value = null
  selectedFile.value = null
  selectedFileName.value = ''
  videoForm.value = {
    title: '',
    description: '',
    brandId: '',
    adType: '',
    durationSeconds: 0,
    priority: 'medium',
    status: 'active',
    autoAssign: false,
    skipBalanceCheck: false
  }
}

// Utility functions
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active': return 'badge-success'
    case 'inactive': return 'badge-secondary'
    case 'pending': return 'badge-warning'
    default: return 'badge-secondary'
  }
}

const getBrandName = (video) => {
  if (!video.brand_id) return 'No Brand'
  const brand = brands.value.find(b => (b.id || b.ID) === video.brand_id)
  return brand ? brand.name : `Brand ${video.brand_id}`
}

const getVideoUrl = (filePath) => {
  if (!filePath) return ''
  return `${apiUrl}${filePath}`
}

// Navigation
const goToCreatePage = () => {
  navigateTo('/admin/videos/create')
}

// Video preview
const previewVideo = (video) => {
  previewVideoData.value = video
  showPreviewModal.value = true
  videoError.value = false
  videoLoading.value = true
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  previewVideoData.value = null
  videoError.value = false
  videoLoading.value = false
  
  // Stop video if playing
  const videoElement = document.getElementById('previewVideoElement')
  if (videoElement) {
    videoElement.pause()
    videoElement.currentTime = 0
  }
}

const handleVideoError = () => {
  videoError.value = true
  videoLoading.value = false
}

const handleVideoLoadStart = () => {
  videoLoading.value = true
  videoError.value = false
}

const handleVideoCanPlay = () => {
  videoLoading.value = false
}

// Slot assignment
const showSlotAssignmentModal = ref(false)
const selectedVideoForSlot = ref(null)
const availableSlots = ref([])
const loadingSlots = ref(false)
const assigningToSlot = ref(false)

const slotAssignmentForm = ref({
  slotId: '',
  priority: 'medium',
  startDate: '',
  endDate: ''
})

const assignToSlot = async (video) => {
  selectedVideoForSlot.value = video
  showSlotAssignmentModal.value = true
  await fetchAvailableSlots()
}

const closeSlotAssignmentModal = () => {
  showSlotAssignmentModal.value = false
  selectedVideoForSlot.value = null
  slotAssignmentForm.value = {
    slotId: '',
    priority: 'medium',
    startDate: '',
    endDate: ''
  }
}

const fetchAvailableSlots = async () => {
  loadingSlots.value = true
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slot/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (data.success) {
      availableSlots.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching slots:', error)
  } finally {
    loadingSlots.value = false
  }
}

const submitSlotAssignment = async () => {
  if (!selectedVideoForSlot.value || !slotAssignmentForm.value.slotId) return
  
  assigningToSlot.value = true
  
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_id: selectedVideoForSlot.value.id,
        slot_id: parseInt(slotAssignmentForm.value.slotId),
        priority: slotAssignmentForm.value.priority,
        start_date: slotAssignmentForm.value.startDate || null,
        end_date: slotAssignmentForm.value.endDate || null
      })
    })
    
    const data = await response.json()
    if (data.success) {
      await fetchVideos() // Refresh videos to show new assignments
      closeSlotAssignmentModal()
      alert('Video assigned to slot successfully!')
    } else {
      alert('Error assigning video to slot: ' + (data.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error assigning video to slot:', error)
    alert('Error assigning video to slot')
  } finally {
    assigningToSlot.value = false
  }
}

// Analytics
const viewAnalytics = (videoId) => {
  navigateTo(`/admin/analytics/video/${videoId}`)
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchVideos(),
    fetchBrands()
  ])
})
</script>

<style scoped>
.video-thumbnail {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  color: #6c757d;
  font-size: 18px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.preview-video {
  max-width: 100%;
  max-height: 400px;
}

.video-error {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.video-error i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.actionable {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-action, .right-action {
  display: flex;
  align-items: center;
}
</style>