<template>
  <section class="section">
    <div class="section-header">
      <h1>Upload Video</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Video Management</div>
        <div class="breadcrumb-item">Upload Video</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Upload New Advertisement Video</h2>
      <p class="section-lead">Upload and configure a new video advertisement for the system</p>
      
      <div class="row">
        <div class="col-8">
          <div class="card">
            <div class="card-header">
              <h4>Video Information</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitVideo" class="needs-validation" novalidate>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="title">Video Title *</label>
                      <input 
                        type="text" 
                        id="title" 
                        v-model="videoForm.title" 
                        class="form-control" 
                        placeholder="Enter video title"
                        required 
                      />
                      <div class="invalid-feedback">
                        Please provide a video title.
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="brand">Brand *</label>
                      <select id="brand" v-model="videoForm.brandId" class="form-control" required>
                        <option value="">Select Brand</option>
                        <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                          {{ brand.name }}
                        </option>
                      </select>
                      <div class="invalid-feedback">
                        Please select a brand.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="adType">Ad Type *</label>
                      <select id="adType" v-model="videoForm.adType" class="form-control" required>
                        <option value="">Select Ad Type</option>
                        <option value="general">General Ad</option>
                        <option value="perfume">Perfume Ad</option>
                        <option value="default">Default Ad</option>
                      </select>
                      <div class="invalid-feedback">
                        Please select an ad type.
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="priority">Priority</label>
                      <select id="priority" v-model="videoForm.priority" class="form-control">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="description">Description</label>
                  <textarea 
                    id="description" 
                    v-model="videoForm.description" 
                    class="form-control" 
                    rows="4" 
                    placeholder="Enter video description"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label for="videoFile">Video File *</label>
                  <div
                    class="drop-area"
                    :class="{ 'drag-over': isDragOver }"
                    @dragover.prevent="onDragOver"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onDrop"
                  >
                    <div v-if="!videoPreviewUrl" class="drop-text">
                      <i class="fas fa-cloud-upload-alt fa-2x mb-2"></i><br>
                      <div>Drag & drop video here, or click to select</div>
                      <input type="file" class="d-none" ref="fileInput" accept="video/mp4,video/webm,video/ogg" @change="onFileChange" required>
                      <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="triggerFileInput">Choose File</button>
                    </div>
                    <div v-else class="drop-preview">
                      <video :src="videoPreviewUrl" controls style="max-width:100%;border:1px solid #eee;"></video>
                      <div class="mt-2">
                        <strong>{{ selectedFileName }}</strong>
                        <button type="button" class="btn btn-outline-danger btn-sm ml-2" @click="removeVideo">Remove</button>
                      </div>
                    </div>
                  </div>
                  <small class="form-text text-muted">
                    Supported formats: MP4, WebM, OGG. Maximum file size: 100MB
                  </small>
                  <div class="invalid-feedback">
                    Please select a video file.
                  </div>
                </div>

                <div class="row" v-if="videoDuration > 0">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Duration</label>
                      <div class="form-control-plaintext">
                        {{ formatDuration(videoDuration) }} ({{ videoDuration }} seconds)
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Cost per Play</label>
                      <div class="form-control-plaintext">
                        {{ calculateCostPerPlay(videoDuration) }} balance
                        <small class="text-muted d-block">(Calculated: {{ Math.ceil(videoDuration / 15) }} seconds ÷ 15)</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group mb-0">
                  <button type="submit" class="btn btn-primary" :disabled="uploading">
                    <i v-if="uploading" class="fas fa-spinner fa-spin mr-2"></i>
                    <i v-else class="fas fa-upload mr-2"></i>
                    {{ uploading ? 'Uploading...' : 'Upload Video' }}
                  </button>
                  <button type="button" @click="goBack" class="btn btn-secondary ml-2">
                    <i class="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

definePageMeta({
  middleware: 'admin'
})

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`
const $toast = useToast()

// Reactive data
const brands = ref([])
const uploading = ref(false)
const selectedFileName = ref('')
const videoDuration = ref(0)
const videoPreviewUrl = ref('')
const fileInput = ref(null)
const isDragOver = ref(false)
const selectedFile = ref(null) // Store the actual file object

const videoForm = ref({
  title: '',
  description: '',
  brandId: '',
  adType: '',
  priority: 'medium',
  autoAssign: false,
  skipBalanceCheck: false
})

// Fetch brands
const fetchBrands = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (data.success) {
      brands.value = data.data || []
    } else {
      $toast.error('Failed to fetch brands', { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error fetching brands:', error)
    $toast.error('Failed to fetch brands', { duration: 5000, position: 'top-right' })
  }
}

// File handling
const triggerFileInput = () => {
  fileInput.value.click();
};

const onDragOver = () => {
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

const onDrop = (e) => {
  isDragOver.value = false;
  const file = e.dataTransfer.files[0];
  handleFile(file);
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  handleFile(file);
};

const handleFile = async (file) => {
  if (!file) return;
  
  // Validate file type
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg']
  if (!validTypes.includes(file.type)) {
    $toast.error('Invalid file type. Please select a valid video file.', { duration: 5000, position: 'top-right' })
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    selectedFileName.value = ''
    videoPreviewUrl.value = ''
    videoDuration.value = 0
    selectedFile.value = null
    return
  }

  // Validate file size (100MB)
  if (file.size > 100 * 1024 * 1024) {
    $toast.error('File size too large. Maximum size is 100MB.', { duration: 5000, position: 'top-right' })
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    selectedFileName.value = ''
    videoPreviewUrl.value = ''
    videoDuration.value = 0
    selectedFile.value = null
    return
  }

  selectedFileName.value = file.name
  videoPreviewUrl.value = URL.createObjectURL(file)
  selectedFile.value = file // Store the file object
  
  // Get video duration
  try {
    const duration = await getVideoDuration(file)
    videoDuration.value = Math.round(duration)
  } catch (error) {
    console.error('Error getting video duration:', error)
    $toast.error('Unable to read video duration', { duration: 5000, position: 'top-right' })
  }
}

const removeVideo = () => {
  selectedFileName.value = ''
  videoPreviewUrl.value = ''
  videoDuration.value = 0
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
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

// Submit video
const submitVideo = async () => {
  // Custom validation since browser validation doesn't work with our custom file input
  if (!videoForm.value.title) {
    $toast.error('Please provide a video title', { duration: 5000, position: 'top-right' })
    return
  }
  
  if (!videoForm.value.brandId) {
    $toast.error('Please select a brand', { duration: 5000, position: 'top-right' })
    return
  }
  
  if (!videoForm.value.adType) {
    $toast.error('Please select an ad type', { duration: 5000, position: 'top-right' })
    return
  }
  
  // Check if file is selected using our stored file reference
  if (!selectedFile.value) {
    $toast.error('Please select a video file', { duration: 5000, position: 'top-right' })
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('video', selectedFile.value)
    formData.append('title', videoForm.value.title)
    formData.append('description', videoForm.value.description)
    formData.append('brand_id', videoForm.value.brandId)
    formData.append('ad_type', videoForm.value.adType)
    formData.append('duration_seconds', videoDuration.value)
    formData.append('priority', videoForm.value.priority)
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
      $toast.success('Video uploaded successfully!', { duration: 5000, position: 'top-right' })
      navigateTo('/admin/videos')
    } else {
      $toast.error(data.message || 'Failed to upload video', { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error uploading video:', error)
    $toast.error('Failed to upload video', { duration: 5000, position: 'top-right' })
  } finally {
    uploading.value = false
  }
}

// Utility functions
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const calculateCostPerPlay = (seconds) => {
  if (!seconds) return 0
  return Math.ceil(seconds / 15)
}

const goBack = () => {
  navigateTo('/admin/videos')
}

// Lifecycle
onMounted(() => {
  fetchBrands()
})
</script>

<style scoped>
.form-control-plaintext {
  color: #6c757d;
  font-weight: 500;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.btn-primary {
  background-color: #6777ef;
  border-color: #6777ef;
}

.btn-primary:hover {
  background-color: #5a67d8;
  border-color: #5a67d8;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.drop-area {
  border: 2px dashed #b3b3b3;
  border-radius: 8px;
  padding: 24px 12px;
  text-align: center;
  background: #fafbfc;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  min-height: 120px;
  position: relative;
}

.drop-area.drag-over {
  border-color: #007bff;
  background: #eaf6ff;
}

.drop-text {
  color: #888;
}

.drop-preview video {
  display: block;
  margin: 0 auto 8px auto;
  max-height: 200px;
}
</style>