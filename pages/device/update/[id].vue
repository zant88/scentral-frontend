<template>
  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <h4>Update Device</h4>
          </div>
          <div class="right-action">
            <a href="#" class="btn btn-icon btn-outline-danger note-btn" @click="closeAdd"><i class="fas fa-times"></i></a>
          </div>
        </div>
        <div class="card-body">
          <form method="POST" @submit.prevent="submitForm" class="needs-validation">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="machineCode" class="form-label">Machine Code</label>
                  <input type="text" class="form-control" id="machineCode" tabindex="1" v-model="machineCode" required>
                  <div class="invalid-feedback">Please fill in your machine code!</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="postition" class="form-label">Position</label>
                  <textarea class="form-control" id="position" tabindex="2" v-model="position" required></textarea>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="latitude" class="form-label">Latitude</label>
                  <input type="text" class="form-control" id="latitude" tabindex="3" v-model="latitude">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="longitude" class="form-label">Longitude</label>
                  <input type="text" class="form-control" id="longitude" tabindex="3" v-model="longitude">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="machineCode" class="form-label">Volume Sprayed (ml)</label>
                  <input type="number" class="form-control" id="volumeSprayed" tabindex="3" v-model="volumeSprayed">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="status" class="form-label">Status</label>
                  <select class="form-control" id="status" tabindex="4" v-model="status">
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="BROKEN">Broken</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="defaultVideo" class="form-label">Default Video</label>
                  <select class="form-control" id="defaultVideo" tabindex="5" v-model="defaultVideoID">
                    <option :value="null">No Default Video</option>
                    <option v-for="video in videos" :key="video.id" :value="video.id">
                      {{ video.title }} ({{ video.ad_type }})
                    </option>
                  </select>
                  <small class="text-muted">This video will be displayed when no slot assignments exist for this device.</small>
                </div>
              </div>

            </div>
            <div class="mb-3">
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const route = useRoute();
const router = useRouter();
const $toast = useToast();

// Ensure all refs are defined at the top level
const code = ref('');
const machineCode = ref('');
const position = ref('');
const status = ref('');
const latitude = ref('');
const longitude = ref('');
const volumeSprayed = ref(0);
const defaultVideoID = ref(null);
const videos = ref([]);

function clearForm() {
  machineCode.value = '';
  position.value = '';
  status.value = '';
  latitude.value = '';
  longitude.value = '';
  volumeSprayed.value = 0;
  defaultVideoID.value = null;
}

const fetchVideos = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/video?status=active&ad_type=default`, {
      method: 'GET',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch videos');
    }
    videos.value = data.data || [];
  } catch (error) {
    $toast.error(error.message || 'Failed to fetch videos', {
      duration: 5000,
      position: 'top-right'
    });
  }
};

const fetchDevice = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/device/${route.params.id}`, {
      method: 'GET',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.meta?.message || 'Failed to fetch device');
    }
    code.value = data.data.code;
    machineCode.value = data.data.machine_code;
    position.value = data.data.position;
    status.value = data.data.status;
    latitude.value = data.data.latitude;
    longitude.value = data.data.longitude;
    volumeSprayed.value = data.data.volume_sprayed || 0;
    defaultVideoID.value = data.data.default_video_id || null;
  } catch (error) {
    $toast.error(error.message || 'Failed to fetch device', {
      duration: 5000,
      position: 'top-right'
    });
    router.push('/device');
  }
};

const changeDeviceState = async (state) => {
  const accessToken = localStorage.getItem('access_token');
  try {
    let deviceState = 'online';
    if (state == 'ACTIVE') {
      deviceState = 'online';
    } else if (state == 'MAINTENANCE') {
      deviceState = 'maintenance';
    } else if (state == 'BROKEN') {
      deviceState = 'maintenance';
    }
    const response = await fetchWithAuth(`${apiUrl}/api/device/${code.value}/state?state=${deviceState}`, {
      method: 'POST',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.meta?.message || 'Failed to change device state');
    }
    $toast.success(data.meta.message, {
      duration: 5000,
      position: 'top-right'
    });
  } catch (error) {
    $toast.error(error.message || 'Failed to change device state', {
      duration: 5000,
      position: 'top-right'
    });
  }
};

const submitForm = async () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    try {
      const accessToken = localStorage.getItem('access_token');
      const body = {
        machine_code: machineCode.value,
        position: position.value,
        status: status.value,
        volume_sprayed: volumeSprayed.value,
        latitude: latitude.value.toString(),
        longitude: longitude.value.toString(),
        default_video_id: defaultVideoID.value,
      };
      const response = await fetchWithAuth(`${apiUrl}/api/device/${route.params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        $toast.error(data.meta.message, {
          duration: 5000,
          position: 'top-right'
        });
        throw new Error(response.statusText);
      }
      if (data.meta.success) {
        $toast.success(data.meta.message, {
          duration: 5000,
          position: 'top-right'
        });
        router.push('/device');
      }
    } catch (error) {
      $toast.error(error.message || 'Failed to update device', {
        duration: 5000,
        position: 'top-right'
      });
    }
  }
  form.classList.add('was-validated');
};

function closeAdd() {
   window.location.href = '/device'
  clearForm();
}

onMounted(() => {
  fetchVideos();
  fetchDevice();
});

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
</script>
