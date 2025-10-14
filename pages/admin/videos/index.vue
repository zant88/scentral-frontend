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
      <h2 class="section-title">Advertisement Videos</h2>
      <p class="section-lead">
        Manage advertisement videos for the vending machine system.
      </p>
      <div class="card" v-if="!isCreateUpdate">
        <div class="card-header actionable">
          <client-only>
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteItem" v-if="anyChecked" data-toggle="tooltip"
                title="Delete Selected"><i class="fa fa-trash"></i></a>
              <a href="javascript:void(0)" @click="navigateTo('/admin/videos/create')" class="btn btn-icon btn-primary note-btn" data-toggle="tooltip"
                title="Upload New"><i class="fas fa-plus"></i></a>
             
              
            </div>
          </client-only>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="getVideoList" class="form-control" placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-3">
              <select v-model="filterBrand" @change="getVideoList" class="form-control">
                <option value="">All Brands</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="filterType" @change="getVideoList" class="form-control">
                <option value="">All Types</option>
                <option value="general">General Ads</option>
                <option value="perfume">Perfume Ads</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="filterStatus" @change="getVideoList" class="form-control">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="sortBy" @change="getVideoList" class="form-control">
                <option value="created_at">Sort by Created</option>
                <option value="title">Sort by Title</option>
                <option value="duration_seconds">Sort by Duration</option>
                <option value="cost_per_play">Sort by Cost</option>
              </select>
            </div>
          </div>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th class="number-cell" scope="col">#</th>
                <th scope="col">Title</th>
                <th scope="col">Brand</th>
                <th scope="col">Type</th>
                <th scope="col">Duration</th>
                <th scope="col">Cost/Play</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in videoList" :key="item.id">
                <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="item.id" /></td>
                <td scope="row">{{ i + 1 }}</td>
                <td>
                  <div class="video-title">
                    <strong>{{ item.title }}</strong>
                    <div class="video-description text-muted small">{{ item.description || 'No description' }}</div>
                  </div>
                </td>
                <td>{{ item.brand?.name || 'N/A' }}</td>
                <td>
                  <span :class="getAdTypeBadgeClass(item.ad_type)" class="badge">
                    {{ item.ad_type?.toUpperCase() || 'N/A' }}
                  </span>
                </td>
                <td>{{ item.duration_seconds }}</td>
                <td>{{ item.cost_per_play || 0 }} balance</td>
                <td>
                  <span :class="getStatusBadgeClass(item.status)" class="badge">
                    {{ item.status?.toUpperCase() || 'UNKNOWN' }}
                  </span>
                </td>
                <td>
                  <span :class="getPriorityBadgeClass(item.priority)" class="badge">
                    {{ item.priority?.toUpperCase() || 'MEDIUM' }}
                  </span>
                </td>
                <td>
                  <div class="dropdown">
                    <a href="#" data-toggle="dropdown" class="btn btn-sm btn-outline-primary dropdown-toggle">Actions</a>
                    <div class="dropdown-menu">
                      <a href="#" class="dropdown-item" @click="playVideo(item)">
                        <i class="fas fa-play mr-2"></i>Play Video
                      </a>
                      <a href="#" class="dropdown-item" @click="viewVideoLogs(item)">
                        <i class="fas fa-list mr-2"></i>View Logs
                      </a>
                      <a href="#" class="dropdown-item" @click="navigateTo(`/admin/videos/update/${item.id}`)">
                        <i class="fas fa-edit mr-2"></i>Edit
                      </a>
                      <div class="dropdown-divider"></div>
                      <a href="#"
                         v-if="item.status === 'active'"
                         class="dropdown-item"
                         @click="deactivateVideo(item)">
                        <i class="fas fa-times mr-2"></i>Inactivate
                      </a>
                      <a href="#"
                         v-if="item.status === 'inactive'"
                         class="dropdown-item"
                         @click="activateVideo(item)">
                        <i class="fas fa-check mr-2"></i>Activate
                      </a>
                      <div class="dropdown-divider"></div>
                      <a href="#" class="dropdown-item text-danger" @click="deleteVideo(item)">
                        <i class="fas fa-trash mr-2"></i>Delete
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="videoList.length === 0" class="text-center py-4">
            <p class="text-muted">No videos found</p>
          </div>
        </div>
      </div>

      <!-- Create/Update Form -->
      <div class="card" v-if="isCreateUpdate">
        <div class="card-header">
          <h4>{{ isEdited ? 'Edit' : 'Add' }} Video</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitForm" class="needs-validation" novalidate>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Video Title *</label>
                  <input type="text" v-model="videoTitle" class="form-control" required />
                  <div class="invalid-feedback">
                    Please provide a video title.
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Brand *</label>
                  <select v-model="videoBrand" class="form-control" required>
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
              <div class="col-12 col-md-4">
                <div class="form-group">
                  <label>Ad Type *</label>
                  <select v-model="videoType" class="form-control" required>
                    <option value="">Select Type</option>
                    <option value="general">General Ad</option>
                    <option value="perfume">Perfume Ad</option>
                  </select>
                  <div class="invalid-feedback">
                    Please select an ad type.
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="form-group">
                  <label>Status *</label>
                  <select v-model="videoStatus" class="form-control" required>
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div class="invalid-feedback">
                    Please select a status.
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="form-group">
                  <label>Priority</label>
                  <select v-model="videoPriority" class="form-control">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Duration (seconds)</label>
                  <input type="number" v-model="videoDuration" class="form-control" min="1" />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Cost per Play</label>
                  <input type="number" v-model="videoCost" class="form-control" min="0" />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label>Description</label>
                  <textarea v-model="videoDescription" class="form-control" rows="4"></textarea>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary">{{ isEdited ? 'Update' : 'Create' }}</button>
              <button type="button" @click="isCreateUpdate = false" class="btn btn-secondary ml-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Video Player Modal -->
      <div v-if="isVideoModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeVideoModal">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ currentVideo?.title }}</h5>
              <button type="button" class="btn-close" @click="closeVideoModal"></button>
            </div>
            <div class="modal-body">
              <video
                v-if="currentVideo"
                :src="getVideoSrc(currentVideo.file_path)"
                controls
                class="w-100"
                @error="onVideoError"
              >
                Your browser does not support the video tag.
              </video>
              <div v-if="currentVideo" class="mt-3">
                <p><strong>Brand:</strong> {{ currentVideo.brand?.name || 'N/A' }}</p>
                <p><strong>Type:</strong> {{ currentVideo.ad_type?.toUpperCase() || 'N/A' }}</p>
                <p><strong>Duration:</strong> {{ formatDuration(currentVideo.duration_seconds) }}</p>
                <p><strong>Cost per Play:</strong> {{ currentVideo.cost_per_play || 0 }} balance</p>
                <p><strong>Description:</strong> {{ currentVideo.description || 'No description' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- Video Logs Modal -->
  <div v-if="showVideoLogsModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeVideoLogsModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Playback Logs for {{ currentVideoForLogs?.title }}</h5>
          <button type="button" class="btn-close" @click="closeVideoLogsModal"></button>
        </div>
        <div class="modal-body">
          <!-- Filters -->
          <div class="row mb-3">
            <div class="col-md-3">
              <select v-model="logsFilter.device" @change="getVideoLogs" class="form-control">
                <option value="">All Devices</option>
                <option v-for="device in uniqueDevices" :key="device" :value="device">
                  {{ device }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="logsFilter.status" @change="getVideoLogs" class="form-control">
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="interrupted">Interrupted</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div class="col-md-3">
              <input type="date" v-model="logsFilter.startDate" @change="getVideoLogs" class="form-control" />
            </div>
            <div class="col-md-3">
              <input type="date" v-model="logsFilter.endDate" @change="getVideoLogs" class="form-control" />
            </div>
          </div>

          <!-- Logs Table -->
          <div class="table-responsive logs-table-container">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Played At</th>
                  <th>Device</th>
                  <th>Duration</th>
                  <th>Played</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Credit Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in videoLogs" :key="log.id">
                  <td>{{ formatDateTime(log.played_at) }}</td>
                  <td>{{ log.device_id }}</td>
                  <td>{{ formatDuration(log.duration) }}</td>
                  <td>{{ formatDuration(log.duration_played) }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(log.status)" class="badge">
                      {{ log.status?.toUpperCase() || 'UNKNOWN' }}
                    </span>
                  </td>
                  <td>{{ log.cost || 0 }} balance</td>
                  <td>
                    <span :class="getCreditStatusBadgeClass(log.credit_deduction_status)" class="badge">
                      {{ log.credit_deduction_status?.toUpperCase() || 'UNKNOWN' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="videoLogs.length === 0" class="text-center py-3">
              <p class="text-muted">No playback logs found for this video</p>
            </div>
          </div>

          <!-- Pagination -->
          <div class="d-flex flex-column align-items-center mt-3">
            <div class="text-muted mb-2">
              Showing {{ videoLogs.length }} logs
            </div>
            <div class="btn-group">
              <button
                class="btn btn-sm btn-outline-primary"
                @click="loadMoreLogs"
                :disabled="loadingMoreLogs || !hasMoreLogs"
              >
                <i class="fas fa-plus mr-1"></i>
                Load More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})

import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const checkedItems = ref([]);
const videoList = ref([]);
const brands = ref([]);
const isCreateUpdate = ref(false);
const isEdited = ref(false);
const isVideoModal = ref(false);
const currentVideo = ref(null);
const currentVideoForLogs = ref(null);
const showVideoLogsModal = ref(false);
const videoLogs = ref([]);
const uniqueDevices = ref([]);
const loadingMoreLogs = ref(false);
const logsLimit = ref(20);
const logsOffset = ref(0);
const hasMoreLogs = ref(true);
const $toast = useToast();
const querySearch = ref('');
const filterBrand = ref('');
const filterType = ref('');
const filterStatus = ref('');
const sortBy = ref('created_at');
const anyChecked = computed(() => checkedItems.value.length > 0);

// Video logs filter
const logsFilter = ref({
  device: '',
  status: '',
  startDate: '',
  endDate: ''
});

// Form variables
const videoTitle = ref('');
const videoDescription = ref('');
const videoBrand = ref('');
const videoType = ref('');
const videoStatus = ref('');
const videoPriority = ref('medium');
const videoDuration = ref(0);
const videoCost = ref(0);
const videoID = ref(null);

const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = videoList.value.map(v => v.id);
  } else {
    checkedItems.value = [];
  }
}

const getVideoList = async () => {
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/video/`;
  const params = new URLSearchParams();

  console.log('Token used:', accessToken); // Debugging line
  
  if (querySearch.value) params.append('search', querySearch.value);
  if (filterBrand.value) params.append('brand_id', filterBrand.value);
  if (filterType.value) params.append('ad_type', filterType.value);
  if (filterStatus.value) params.append('status', filterStatus.value);
  if (sortBy.value) params.append('sort_by', sortBy.value);
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  try {
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    videoList.value = data.data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    $toast.error('Failed to fetch videos', { duration: 5000, position: 'top-right' });
  }
}

const getBrands = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    brands.value = data.data || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
}

onMounted(() => {
  getVideoList();
  getBrands();
});

function showEdit(item) {
  isCreateUpdate.value = true;
  isEdited.value = true;
  videoID.value = item.id;
  videoTitle.value = item.title;
  videoDescription.value = item.description;
  videoBrand.value = item.brand_id;
  videoType.value = item.ad_type;
  videoStatus.value = item.status;
  videoPriority.value = item.priority;
  videoDuration.value = item.duration_seconds;
  videoCost.value = item.cost_per_play;
}

function playVideo(item) {
  currentVideo.value = item;
  isVideoModal.value = true;
}

function closeVideoModal() {
  isVideoModal.value = false;
  currentVideo.value = null;
}

function onVideoError() {
  $toast.error('Failed to load video', { duration: 5000, position: 'top-right' });
  closeVideoModal();
}

const deleteItem = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteData();
    }
  })
}

const deleteData = async () => {
  let accessToken = localStorage.getItem('access_token');
  try {
    const strIDs = checkedItems.value.join(",");
    const response = await fetchWithAuth(`${apiUrl}/api/video/${strIDs}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    if (data.success) {
      $toast.success(data.message, { duration: 5000, position: 'top-right' });
      checkedItems.value = [];
      getVideoList();
    } else {
      $toast.error(data.message || 'Failed to delete video(s)', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to delete video(s)', { duration: 5000, position: 'top-right' });
  }
}

const createData = async () => {
  let accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/video/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: videoTitle.value,
        description: videoDescription.value,
        brand_id: videoBrand.value,
        ad_type: videoType.value,
        status: videoStatus.value,
        priority: videoPriority.value,
        duration_seconds: videoDuration.value,
        cost_per_play: videoCost.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Video created successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getVideoList();
    } else {
      $toast.error(data.message || 'Failed to create video', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to create video', { duration: 5000, position: 'top-right' });
  }
}

const updateData = async () => {
  try {
    let accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/video/${videoID.value}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: videoTitle.value,
        description: videoDescription.value,
        brand_id: videoBrand.value,
        ad_type: videoType.value,
        status: videoStatus.value,
        priority: videoPriority.value,
        duration_seconds: videoDuration.value,
        cost_per_play: videoCost.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Video updated successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getVideoList();
    } else {
      $toast.error(data.message || 'Failed to update video', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to update video', { duration: 5000, position: 'top-right' });
  }
}

const submitForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    if (isEdited.value) {
      updateData();
    } else {
      createData();
    }
  }
  form.classList.add('was-validated');
};

function clearForm() {
  videoTitle.value = '';
  videoDescription.value = '';
  videoBrand.value = '';
  videoType.value = '';
  videoStatus.value = '';
  videoPriority.value = 'medium';
  videoDuration.value = 0;
  videoCost.value = 0;
  videoID.value = null;
}

// Utility functions
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const getAdTypeBadgeClass = (type) => {
  switch (type) {
    case 'general': return 'badge-primary';
    case 'perfume': return 'badge-success';
    default: return 'badge-secondary';
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'rejected': return 'badge-danger';
    default: return 'badge-secondary';
  }
}

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'high': return 'badge-danger';
    case 'medium': return 'badge-warning';
    case 'low': return 'badge-info';
    default: return 'badge-secondary';
  }
}

const activateVideo = async (item) => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/video/${item.id}/activate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Video activated successfully', { duration: 5000, position: 'top-right' });
      getVideoList();
    } else {
      $toast.error(data.message || 'Failed to activate video', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to activate video', { duration: 5000, position: 'top-right' });
  }
}

const deactivateVideo = async (item) => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/video/${item.id}/deactivate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Video deactivated successfully', { duration: 5000, position: 'top-right' });
      getVideoList();
    } else {
      $toast.error(data.message || 'Failed to deactivate video', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to deactivate video', { duration: 5000, position: 'top-right' });
  }
}

// Video logs functions
const viewVideoLogs = async (item) => {
  currentVideoForLogs.value = item;
  showVideoLogsModal.value = true;
  
  // Reset filters
  logsFilter.value = {
    device: '',
    status: '',
    startDate: '',
    endDate: ''
  };
  
  // Set default date range to last 7 days
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  logsFilter.value.endDate = today.toISOString().split('T')[0];
  logsFilter.value.startDate = weekAgo.toISOString().split('T')[0];
  
  await getVideoLogs();
}

const closeVideoLogsModal = () => {
  showVideoLogsModal.value = false;
  currentVideoForLogs.value = null;
  videoLogs.value = [];
  uniqueDevices.value = [];
  logsOffset.value = 0;
  hasMoreLogs.value = true;
}

const getVideoLogs = async (resetOffset = true) => {
  if (!currentVideoForLogs.value) return;
  
  // Reset offset if this is a new search (filter changed)
  if (resetOffset) {
    logsOffset.value = 0;
    videoLogs.value = [];
  }
  
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/analytics/playback-logs?video_id=${currentVideoForLogs.value.id}&limit=${logsLimit.value}&offset=${logsOffset.value}`;
  
  // Add filters to URL
  if (logsFilter.value.device) {
    url += `&device_id=${logsFilter.value.device}`;
  }
  if (logsFilter.value.status) {
    url += `&status=${logsFilter.value.status}`;
  }
  if (logsFilter.value.startDate) {
    url += `&start_date=${logsFilter.value.startDate}T00:00:00Z`;
  }
  if (logsFilter.value.endDate) {
    url += `&end_date=${logsFilter.value.endDate}T23:59:59Z`;
  }
  
  console.log('Fetching video logs from URL:', url);
  
  try {
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      const newLogs = data.data || [];
      
      if (resetOffset) {
        videoLogs.value = newLogs;
      } else {
        videoLogs.value = [...videoLogs.value, ...newLogs];
      }
      
      // Check if there are more logs to load
      hasMoreLogs.value = newLogs.length === logsLimit.value;
      
      // Extract unique devices for filter dropdown
      const devices = [...new Set(videoLogs.value.map(log => log.device_id))];
      uniqueDevices.value = devices;
      
      if (videoLogs.value.length === 0) {
        $toast.info('No playback logs found for this video in the selected date range', { duration: 5000, position: 'top-right' });
      }
    } else {
      $toast.error(data.message || 'Failed to fetch video logs', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    console.error('Error fetching video logs:', error);
    $toast.error(`Failed to fetch video logs: ${error.message}`, { duration: 5000, position: 'top-right' });
  }
}

const loadMoreLogs = async () => {
  if (!currentVideoForLogs.value || loadingMoreLogs.value || !hasMoreLogs.value) return;
  
  loadingMoreLogs.value = true;
  logsOffset.value += logsLimit.value; // Increase offset to load next page
  
  try {
    await getVideoLogs(false); // Don't reset offset when loading more
  } finally {
    loadingMoreLogs.value = false;
  }
}

const deleteVideo = async (item) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      // Check if the item is already in checkedItems
      const wasChecked = checkedItems.value.includes(item.id);
      
      // If not checked, add it to checkedItems temporarily for deletion
      if (!wasChecked) {
        checkedItems.value = [item.id];
      }
      
      deleteData();
    }
  })
}

// Utility functions for video logs
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

const getCreditStatusBadgeClass = (status) => {
  switch (status) {
    case 'success': return 'badge-success';
    case 'failed': return 'badge-danger';
    case 'pending': return 'badge-warning';
    case 'skipped': return 'badge-info';
    default: return 'badge-secondary';
  }
}

// Function to handle video source URL construction
const getVideoSrc = (filePath) => {
  if (!filePath) return '';
  
  // If the path starts with /public, remove the /public prefix
  if (filePath.startsWith('/public')) {
    const relativePath = filePath.substring(8); // Remove '/public' prefix
    console.log('Relative Path:', relativePath); // Debugging line
    return `${apiUrl}/${relativePath}`;
  }
  
  // Otherwise, use the path as-is
  return `${apiUrl}${filePath}`;
}
</script>

<style scoped>
.video-title {
  max-width: 200px;
}

.video-description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions-cell {
  text-align: center;
  min-width: 150px;
}

.btn-group {
  display: flex;
  gap: 2px;
}

.modal {
  z-index: 1050;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 0.75;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-primary { background-color: #007bff; }
.badge-success { background-color: #28a745; }
.badge-warning { background-color: #ffc107; color: #212529; }
.badge-danger { background-color: #dc3545; }
.badge-info { background-color: #17a2b8; }
.badge-secondary { background-color: #6c757d; }

.logs-table-container {
  overflow-x: auto;
  max-height: 400px;
}

.logs-table-container table {
  min-width: 800px;
}
</style>
