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
              <form @submit.prevent="uploadVideo" enctype="multipart/form-data">
                <div class="form-group">
                  <label>Video Title</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="videoData.title" 
                    required
                    placeholder="Enter video title"
                  >
                </div>
                
                <div class="form-group">
                  <label>Description</label>
                  <textarea 
                    class="form-control" 
                    v-model="videoData.description" 
                    rows="4"
                    placeholder="Enter video description"
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label>Category</label>
                  <select class="form-control" v-model="videoData.category" required>
                    <option value="">Select Category</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="demo">Demo</option>
                    <option value="presentation">Presentation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Video File</label>
                  <input 
                    type="file" 
                    class="form-control-file" 
                    @change="handleFileSelect" 
                    accept="video/*"
                    required
                  >
                  <small class="form-text text-muted">
                    Supported formats: MP4, AVI, MOV, WMV. Max size: 500MB
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
                      <strong>File:</strong> {{ selectedFile.name }}<br>
                      <strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}<br>
                      <strong>Type:</strong> {{ selectedFile.type }}
                    </p>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Tags (Optional)</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="videoData.tags" 
                    placeholder="Enter tags separated by commas"
                  >
                  <small class="form-text text-muted">
                    Example: tutorial, javascript, web development
                  </small>
                </div>
                
                <div class="form-group">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      v-model="videoData.isPublic" 
                      id="isPublic"
                    >
                    <label class="form-check-label" for="isPublic">
                      Make this video public
                    </label>
                  </div>
                </div>
                
                <div class="form-group">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="isUploading"
                  >
                    <i class="fas fa-upload" v-if="!isUploading"></i>
                    <i class="fas fa-spinner fa-spin" v-if="isUploading"></i>
                    {{ isUploading ? 'Uploading...' : 'Upload Video' }}
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

// Form data
const videoData = ref({
  title: '',
  description: '',
  category: '',
  tags: '',
  isPublic: false
});

const selectedFile = ref(null);
const previewUrl = ref('');
const isUploading = ref(false);
const uploadProgress = ref(0);

// Methods
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
    
    // Create preview URL
    previewUrl.value = URL.createObjectURL(file);
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const uploadVideo = async () => {
  if (!selectedFile.value) {
    $toast.error('Please select a video file');
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const formData = new FormData();
    formData.append('video', selectedFile.value);
    formData.append('title', videoData.value.title);
    formData.append('description', videoData.value.description);
    formData.append('category', videoData.value.category);
    formData.append('tags', videoData.value.tags);
    formData.append('is_public', videoData.value.isPublic);

    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/video/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData,
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      }
    });

    const data = await response.json();
    
    if (data.success) {
      $toast.success('Video uploaded successfully!');
      uploadProgress.value = 100;
      setTimeout(() => {
        router.push('/admin/videos');
      }, 1000);
    } else {
      $toast.error(data.message || 'Failed to upload video');
    }
  } catch (error) {
    console.error('Upload error:', error);
    $toast.error('Failed to upload video');
  } finally {
    isUploading.value = false;
  }
};

onMounted(() => {
  console.log('Create.vue component mounted!')
});
</script>

<style scoped>
.custom-file-label::after {
  content: "Browse";
}
</style>