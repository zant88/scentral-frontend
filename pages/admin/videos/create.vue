<template>
  <section class="section">
    <div class="section-header">
      <h1>Upload New Video</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item"><NuxtLink to="/admin/dashboard">Dashboard</NuxtLink></div>
        <div class="breadcrumb-item"><NuxtLink to="/admin/videos">Videos</NuxtLink></div>
        <div class="breadcrumb-item active">Upload</div>
      </div>
    </div>
    <div class="section-body">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Video Upload Form</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveVideo" enctype="multipart/form-data">
                <div class="form-group">
                  <label>Video Title *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="videoForm.title" 
                    required
                    placeholder="Enter video title"
                  >
                </div>
                
                <div class="form-group">
                  <label>Description</label>
                  <textarea 
                    class="form-control" 
                    v-model="videoForm.description" 
                    rows="4"
                    placeholder="Enter video description"
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label>Brand *</label>
                  <select class="form-control" v-model="videoForm.brandId" required>
                    <option value="">Select Brand</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }}
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Cost Per Play *</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">$</span>
                    </div>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      class="form-control" 
                      v-model="videoForm.costPerPlay" 
                      required
                      placeholder="0.00"
                    >
                  </div>
                  <small class="form-text text-muted">
                    Cost charged per 15-second play unit
                  </small>
                </div>
                
                <div class="form-group">
                  <label>Video File *</label>
                  <input 
                    type="file" 
                    class="form-control-file" 
                    @change="onFileChange" 
                    accept="video/mp4,video/avi,video/mov,video/mkv,video/webm"
                    required
                  >
                  <small class="form-text text-muted">
                    Supported formats: MP4, AVI, MOV, MKV, WEBM. Max size: 500MB
                  </small>
                </div>
                
                <div class="form-group" v-if="selectedFile">
                  <label>Preview</label>
                  <div class="video-preview">
                    <video 
                      :src="previewUrl" 
                      controls 
                      width="300" 
                      height="200"
                      style="border-radius: 8px;"
                    ></video>
                    <p class="mt-2">
                      <strong>File:</strong> {{ selectedFileName }}<br>
                      <strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}<br>
                      <strong>Duration:</strong> {{ formatDuration(videoForm.durationSeconds) }}
                    </p>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Status</label>
                  <select class="form-control" v-model="videoForm.status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="processing">Processing</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="uploading || saving"
                  >
                    <i class="fas fa-upload" v-if="!uploading && !saving"></i>
                    <i class="fas fa-spinner fa-spin" v-if="uploading || saving"></i>
                    {{ uploading || saving ? 'Uploading...' : 'Upload Video' }}
                  </button>
                  <NuxtLink to="/admin/videos" class="btn btn-secondary ml-2">
                    Cancel
                  </NuxtLink>
                </div>
                
                <!-- Upload Progress -->
                <div v-if="uploadProgress > 0" class="form-group">
                  <label>Upload Progress</label>
                  <div class="progress">
                    <div 
                      class="progress-bar" 
                      role="progressbar" 
                      :style="{ width: uploadProgress + '%' }"
                      :aria-valuenow="uploadProgress" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {{ uploadProgress }}%
                    </div>
                  </div>
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
import { useRouter } from 'vue-router'

const router = useRouter()

// Form data matching backend video model
const videoForm = ref({
  title: '',
  description: '',
  brandId: null,
  costPerPlay: 0.00,
  status: 'active',
  durationSeconds: 0
})

// File handling
const selectedFile = ref(null)
const selectedFileName = ref('')
const previewUrl = ref('')
const uploading = ref(false)
const saving = ref(false)
const uploadProgress = ref(0)
const brands = ref([])

// File change handler
const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    selectedFileName.value = file.name
    previewUrl.value = URL.createObjectURL(file)
    
    // Get video duration
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      videoForm.value.durationSeconds = Math.ceil(video.duration)
      URL.revokeObjectURL(video.src)
    }
    video.src = previewUrl.value
  }
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format duration
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Save video
const saveVideo = async () => {
  if (!selectedFile.value) {
    alert('Please select a video file')
    return
  }

  if (!videoForm.value.title.trim()) {
    alert('Please enter a video title')
    return
  }

  if (!videoForm.value.brandId) {
    alert('Please select a brand')
    return
  }

  if (!videoForm.value.costPerPlay || videoForm.value.costPerPlay <= 0) {
    alert('Please enter a valid cost per play')
    return
  }

  saving.value = true
  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('title', videoForm.value.title)
    formData.append('description', videoForm.value.description || '')
    formData.append('brand_id', videoForm.value.brandId)
    formData.append('cost_per_play', videoForm.value.costPerPlay)
    formData.append('status', videoForm.value.status)
    formData.append('duration_seconds', videoForm.value.durationSeconds)

    const response = await $fetch('/api/video/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: (progress) => {
        if (progress.total) {
          uploadProgress.value = Math.round((progress.loaded / progress.total) * 100)
        }
      }
    })

    if (response && (response.success || response.id)) {
      alert('Video uploaded successfully!')
      router.push('/admin/videos')
    } else {
      throw new Error(response?.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('Failed to upload video: ' + (error.message || 'Unknown error'))
  } finally {
    saving.value = false
    uploading.value = false
    uploadProgress.value = 0
  }
}

// Get brands
const getBrands = async () => {
  try {
    const response = await $fetch('/api/brands')
    if (response && response.data) {
      brands.value = response.data
    } else if (Array.isArray(response)) {
      brands.value = response
    } else {
      console.warn('Unexpected brands response format:', response)
      brands.value = []
    }
  } catch (error) {
    console.error('Failed to fetch brands:', error)
    // Add some default brands for testing if API fails
    brands.value = [
      { id: 1, name: 'Default Brand' },
      { id: 2, name: 'Test Brand' }
    ]
  }
}

// Initialize
onMounted(() => {
  getBrands()
})
</script>

<style scoped>
.custom-file-label::after {
  content: "Browse";
}
</style>