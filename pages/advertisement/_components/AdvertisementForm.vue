<template>
  <form @submit.prevent="handleSubmit" class="needs-validation">
    <div class="row">
      <div class="col-md-6">
        <div class="mb-3">
          <label for="adTitle" class="form-label">Title</label>
          <input type="text" class="form-control" id="adTitle" v-model="ad.title" required>
          <div class="invalid-feedback">Please fill in the title!</div>
        </div>
        <div class="mb-3">
          <label for="adDescription" class="form-label">Description</label>
          <textarea class="form-control" id="adDescription" v-model="ad.description"></textarea>
        </div>
        <div class="mb-3">
          <label for="adBrand" class="form-label">Brand</label>
          <select class="form-control" id="adBrand" v-model="ad.brand_id">
            <option :value="null">-- Select a brand --</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
          </select>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="adPublishDate" class="form-label">Publish Date</label>
              <input type="date" class="form-control" id="adPublishDate" v-model="ad.publish_date">
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="adExpiryDate" class="form-label">Expiry Date</label>
              <input type="date" class="form-control" id="adExpiryDate" v-model="ad.expiry_date">
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="adStartTime" class="form-label">Start Time</label>
              <input type="time" class="form-control" id="adStartTime" v-model="ad.start_time">
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="adEndTime" class="form-label">End Time</label>
              <input type="time" class="form-control" id="adEndTime" v-model="ad.end_time">
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label for="adActive" class="form-label">Active</label>
          <input type="checkbox" id="adActive" v-model="ad.is_active">
        </div>
      </div>
      <div class="col-md-6">
        <div class="mb-3">
          <label for="adVideo" class="form-label">Video</label>
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
              <input type="file" class="d-none" ref="fileInput" accept="video/*" @change="onFileChange">
              <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="triggerFileInput">Choose File</button>
            </div>
            <div v-else class="drop-preview">
              <video :src="videoPreviewUrl" controls style="max-width:100%;border:1px solid #eee;"></video>
              <button type="button" class="btn btn-outline-danger btn-sm mt-2" @click="removeVideo">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-3">
      <button type="submit" class="btn btn-primary">{{ ad.id ? 'Update' : 'Create' }}</button>
      <NuxtLink to="/advertisement" class="btn btn-secondary ms-2">Cancel</NuxtLink>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';

import { fetchWithAuth } from '~/utils/auth.js';

const props = defineProps({
  ad: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
      brand_id: null,
      video_url: '',
      publish_date: '',
      expiry_date: '',
      start_time: '',
      end_time: '',
      is_active: true
    })
  }
});

const emit = defineEmits(['submit', 'file-change']);

// Initialize form data with proper date formatting
const initializeAdData = (adData) => {
  if (!adData || Object.keys(adData).length === 0) {
    return {
      title: '',
      description: '',
      brand_id: null,
      video_url: '',
      publish_date: '',
      expiry_date: '',
      start_time: '',
      end_time: '',
      is_active: true
    };
  }
  
  const formattedAd = { ...adData };
  
  // Format dates for HTML date inputs (YYYY-MM-DD)
  if (adData.publish_date) {
    formattedAd.publish_date = new Date(adData.publish_date).toISOString().split('T')[0];
  }
  if (adData.expire_date) {
    formattedAd.expiry_date = new Date(adData.expire_date).toISOString().split('T')[0];
  }
  
  return formattedAd;
};

const ad = ref(initializeAdData(props.ad));
const videoFile = ref(null);
const videoPreviewUrl = ref(props.ad?.video_url || '');
const fileInput = ref(null);
const isDragOver = ref(false);
const brands = ref([]);

watch(() => props.ad, (newVal) => {
  ad.value = initializeAdData(newVal);
  videoPreviewUrl.value = newVal?.video_url || '';
}, { deep: true, immediate: true });

const fetchBrands = async () => {
  try {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiBase;
    const response = await fetchWithAuth(`${apiUrl}/api/brand/all`);
    const data = await response.json();
    if (data.success) {
      brands.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
};

onMounted(() => {
  fetchBrands();
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const onDragOver = () => { isDragOver.value = true; };
const onDragLeave = () => { isDragOver.value = false; };

const onDrop = (e) => {
  isDragOver.value = false;
  const file = e.dataTransfer.files[0];
  handleFile(file);
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  handleFile(file);
};

const handleFile = (file) => {
  if (file) {
    videoFile.value = file;
    videoPreviewUrl.value = URL.createObjectURL(file);
    emit('file-change', file);
  }
};

const removeVideo = () => {
  videoFile.value = null;
  videoPreviewUrl.value = '';
  ad.value.video_url = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  emit('file-change', null);
};

const handleSubmit = async () => {
  // Format dates to ISO format to prevent parsing errors
  const formattedAd = {
    ...ad.value,
    videoFile: videoFile.value
  };
  
  // Convert date strings to ISO format if they exist
  if (formattedAd.publish_date) {
    formattedAd.publish_date = new Date(formattedAd.publish_date).toISOString();
  }
  
  if (formattedAd.expiry_date) {
    formattedAd.expire_date = new Date(formattedAd.expiry_date).toISOString();
    // Remove the expiry_date field as the backend expects expire_date
    delete formattedAd.expiry_date;
  }
  
  emit('submit', formattedAd);
};
</script>

<style scoped>
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
}
</style>