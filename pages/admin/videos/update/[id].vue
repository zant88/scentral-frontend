<template>
  <section class="section">
    <div class="section-header">
      <h1>Edit Video</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item"><NuxtLink to="/admin/dashboard">Dashboard</NuxtLink></div>
        <div class="breadcrumb-item"><NuxtLink to="/admin/videos">Video Management</NuxtLink></div>
        <div class="breadcrumb-item active">Edit Video</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Edit Video</h2>
      <p class="section-lead">Update video information and settings</p>
      
      <div class="row" v-if="!loading">
        <div class="col-lg-8 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>Video Details</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateVideo">
                <div class="form-group">
                  <label>Video Title</label>
                  <input type="text" class="form-control" v-model="videoForm.title" placeholder="Enter video title" required>
                </div>
                
                <div class="form-group">
                  <label>Description</label>
                  <textarea class="form-control" v-model="videoForm.description" rows="3" placeholder="Video description"></textarea>
                </div>
                
                <div class="form-group">
                  <label>Brand</label>
                  <select class="form-control" v-model="videoForm.brandId" required>
                    <option value="">Select Brand</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }}
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Ad Type</label>
                  <select class="form-control" v-model="videoForm.adType" required @change="onAdTypeChange">
                    <option value="">Select Ad Type</option>
                    <option value="perfume">Perfume (Machine Triggered)</option>
                    <option value="general">General Brand</option>
                  </select>
                  <small class="form-text text-muted">
                    Perfume ads are triggered by machine interactions, General ads play in scheduled slots
                  </small>
                </div>
                
                <div class="form-group">
                  <label>Current Video File</label>
                  <div class="alert alert-info">
                    <i class="fas fa-video"></i> {{ videoForm.filename || 'No file name available' }}
                    <div class="mt-2">
                      <small>Duration: {{ formatDuration(videoForm.durationSeconds) }} | Size: {{ formatFileSize(videoForm.fileSize) }}</small>
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Replace Video File (Optional)</label>
                  <div class="custom-file">
                    <input type="file" class="custom-file-input" id="videoFile" @change="onFileChange" accept="video/*">
                    <label class="custom-file-label" for="videoFile">{{ selectedFileName || 'Choose new video file...' }}</label>
                  </div>
                  <small class="form-text text-muted">
                    Leave empty to keep current video. Supported formats: MP4, AVI, MOV (Max: 100MB)
                  </small>
                </div>
                
                <div class="form-group" v-if="newDuration">
                  <label>New Video Duration</label>
                  <div class="input-group">
                    <input type="number" class="form-control" v-model="newDuration" readonly>
                    <div class="input-group-append">
                      <span class="input-group-text">seconds</span>
                    </div>
                  </div>
                  <small class="form-text text-muted">{{ formatDuration(newDuration) }}</small>
                </div>
                
                <div class="form-group" v-if="videoForm.durationSeconds">
                  <label>Cost Calculation</label>
                  <div class="alert alert-info">
                    <div class="d-flex justify-content-between">
                      <span>Duration:</span>
                      <span>{{ newDuration || videoForm.durationSeconds }}s</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>15s Units:</span>
                      <span>{{ Math.ceil((newDuration || videoForm.durationSeconds) / 15) }}</span>
                    </div>
                    <div class="d-flex justify-content-between font-weight-bold">
                      <span>Total Cost:</span>
                      <span>{{ Math.ceil((newDuration || videoForm.durationSeconds) / 15) }} balance</span>
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Priority</label>
                  <select class="form-control" v-model="videoForm.priority">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Status</label>
                  <select class="form-control" v-model="videoForm.status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <div class="control-label">Settings</div>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="autoAssign" v-model="videoForm.autoAssign">
                    <label class="custom-control-label" for="autoAssign">Auto-assign to available slots</label>
                  </div>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="skipBalance" v-model="videoForm.skipBalanceCheck">
                    <label class="custom-control-label" for="skipBalance">Skip balance validation (Admin only)</label>
                  </div>
                </div>
                
                <div class="form-group mb-0">
                  <button type="submit" class="btn btn-primary mr-2" :disabled="updating">
                    <i class="fas fa-spinner fa-spin" v-if="updating"></i>
                    <i class="fas fa-save" v-else></i>
                    Update Video
                  </button>
                  <NuxtLink to="/admin/videos" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Video Library
                  </NuxtLink>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>Video Preview</h4>
            </div>
            <div class="card-body">
              <div class="video-preview" v-if="videoForm.filePath">
                <video :src="getVideoUrl(videoForm.filePath)" controls class="w-100" style="max-height: 300px;">
                  Your browser does not support the video tag.
                </video>
              </div>
              <div v-else class="text-center text-muted py-4">
                <i class="fas fa-video fa-3x mb-3"></i>
                <p>No video available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p class="mt-3">Loading video data...</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import { fetchWithAuth } from '~/utils/auth.js';

// Define middleware for admin access
definePageMeta({
  middleware: 'admin'
});

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();
const router = useRouter();
const route = useRoute();

const videoId = route.params.id;

// Form data
const videoForm = ref({
  title: '',
  description: '',
  brandId: '',
  adType: '',
  priority: 'medium',
  status: 'active',
  autoAssign: false,
  skipBalanceCheck: false,
  durationSeconds: null,
  filename: '',
  filePath: '',
  fileSize: 0
});

const brands = ref([]);
const selectedFileName = ref('');
const selectedFile = ref(null);
const newDuration = ref(null);
const loading = ref(true);
const updating = ref(false);

// Methods
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getVideoUrl = (filePath) => {
  return `${apiUrl}/uploads/videos/${filePath}`;
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
    
    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      newDuration.value = Math.round(video.duration);
    };
    video.src = URL.createObjectURL(file);
  }
};

const onAdTypeChange = () => {
  // Handle ad type change logic if needed
};

const getVideoData = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/video/${videoId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    
    if (data.success) {
      const video = data.data;
      videoForm.value = {
        title: video.title || '',
        description: video.description || '',
        brandId: video.brand_id || '',
        adType: video.ad_type || '',
        priority: video.priority || 'medium',
        status: video.status || 'active',
        autoAssign: video.auto_assign || false,
        skipBalanceCheck: video.skip_balance_check || false,
        durationSeconds: video.duration_seconds || 0,
        filename: video.filename || '',
        filePath: video.file_path || '',
        fileSize: video.file_size || 0
      };
    } else {
      $toast.error('Failed to load video data');
      router.push('/admin/videos');
    }
  } catch (error) {
    console.error('Failed to fetch video:', error);
    $toast.error('Failed to load video data');
    router.push('/admin/videos');
  } finally {
    loading.value = false;
  }
};

const updateVideo = async () => {
  updating.value = true;

  try {
    const formData = new FormData();
    
    // Add video file if a new one is selected
    if (selectedFile.value) {
      formData.append('video', selectedFile.value);
      formData.append('duration_seconds', newDuration.value);
    }
    
    formData.append('title', videoForm.value.title);
    formData.append('description', videoForm.value.description);
    formData.append('brand_id', videoForm.value.brandId);
    formData.append('ad_type', videoForm.value.adType);
    formData.append('priority', videoForm.value.priority);
    formData.append('status', videoForm.value.status);
    formData.append('auto_assign', videoForm.value.autoAssign);
    formData.append('skip_balance_check', videoForm.value.skipBalanceCheck);

    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/video/${videoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      $toast.success('Video updated successfully!');
      router.push('/admin/videos');
    } else {
      $toast.error(data.message || 'Failed to update video');
    }
  } catch (error) {
    console.error('Update error:', error);
    $toast.error('Failed to update video');
  } finally {
    updating.value = false;
  }
};

const getBrands = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      brands.value = data.data;
    }
  } catch (error) {
    console.error('Failed to fetch brands:', error);
  }
};

onMounted(async () => {
  await Promise.all([getBrands(), getVideoData()]);
});
</script>

<style scoped>
.custom-file-label::after {
  content: "Browse";
}

.video-preview {
  border-radius: 8px;
  overflow: hidden;
}
</style>