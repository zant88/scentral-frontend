<template>
  <section class="section">
    <div class="section-header">
      <h1>Slot Assignments</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Slot Assignments</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Video Slot Assignments</h2>
      <p class="section-lead">
        Manage video assignments to advertisement time slots.
      </p>
      <div class="card" v-if="!isCreateUpdate">
        <div class="card-header actionable">
          <client-only>
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteItem" v-if="anyChecked" data-toggle="tooltip"
                title="Delete Selected"><i class="fa fa-trash"></i></a>
              <a href="#" @click="showAdd" class="btn btn-icon btn-primary note-btn" data-toggle="tooltip"
                title="Add New"><i class="fas fa-plus"></i></a>
            </div>
          </client-only>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="getAssignmentList" class="form-control" placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-3">
              <select v-model="filterSlot" @change="getAssignmentList" class="form-control">
                <option value="">All Slots</option>
                <option v-for="slot in slots" :key="slot.id" :value="slot.id">
                  {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="filterBrand" @change="getAssignmentList" class="form-control">
                <option value="">All Brands</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="filterType" @change="getAssignmentList" class="form-control">
                <option value="">All Types</option>
                <option value="general">General Ads</option>
                <option value="perfume">Perfume Ads</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="filterStatus" @change="getAssignmentList" class="form-control">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th class="number-cell" scope="col">#</th>
                <th scope="col">Video</th>
                <th scope="col">Brand</th>
                <th scope="col">Slot</th>
                <th scope="col">Type</th>
                <th scope="col">Date Range</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in assignmentList" :key="item.id">
                <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="item.id" /></td>
                <td scope="row">{{ i + 1 }}</td>
                <td>
                  <div class="video-info">
                    <strong>{{ item.video?.title || 'N/A' }}</strong>
                    <div class="text-muted small">{{ formatDuration(item.video?.duration_seconds) }}</div>
                  </div>
                </td>
                <td>{{ item.video?.brand?.name || 'N/A' }}</td>
                <td>
                  <div class="slot-info">
                    <strong>{{ formatTime(item.slot?.start_time) }} - {{ formatTime(item.slot?.end_time) }}</strong>
                    <div class="text-muted small">{{ item.slot?.general_percentage }}%G / {{ item.slot?.perfume_percentage }}%P</div>
                  </div>
                </td>
                <td>
                  <span :class="getAdTypeBadgeClass(item.video?.ad_type)" class="badge">
                    {{ item.video?.ad_type?.toUpperCase() || 'N/A' }}
                  </span>
                </td>
                <td>
                  <div class="date-range">
                    <div>{{ formatDate(item.start_date) }}</div>
                    <div class="text-muted small">to {{ formatDate(item.end_date) }}</div>
                  </div>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(item.is_active)" class="badge">
                    {{ item.is_active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <div class="btn-group">
                    <button @click="showEdit(item)" class="btn btn-sm btn-warning" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="toggleStatus(item)" :class="item.is_active ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-success'" :title="item.is_active ? 'Deactivate' : 'Activate'">
                      <i :class="item.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="assignmentList.length === 0" class="text-center py-4">
            <p class="text-muted">No assignments found</p>
          </div>
        </div>
      </div>

      <!-- Create/Update Form -->
      <div class="card" v-if="isCreateUpdate">
        <div class="card-header">
          <h4>{{ isEdited ? 'Edit' : 'Add' }} Slot Assignment</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitForm" class="needs-validation" novalidate>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="video">Video *</label>
                  <select id="video" v-model="assignmentVideo" @change="onVideoChange" class="form-control" required>
                    <option value="">Select Video</option>
                    <option v-for="video in approvedVideos" :key="video.id" :value="video.id">
                      {{ video.title }} ({{ video.brand?.name }}) - {{ video.ad_type }}
                    </option>
                  </select>
                  <div class="invalid-feedback">
                    Please select a video.
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="slot">Slot *</label>
                  <select id="slot" v-model="assignmentSlot" class="form-control" required>
                    <option value="">Select Slot</option>
                    <option v-for="slot in compatibleSlots" :key="slot.id" :value="slot.id">
                      {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }} 
                      ({{ slot.general_percentage }}%G / {{ slot.perfume_percentage }}%P)
                    </option>
                  </select>
                  <div class="invalid-feedback">
                    Please select a slot.
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="startDate">Start Date *</label>
                  <input 
                    type="date" 
                    id="startDate" 
                    v-model="assignmentStartDate" 
                    class="form-control" 
                    required 
                  />
                  <div class="invalid-feedback">
                    Please provide a start date.
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="endDate">End Date *</label>
                  <input 
                    type="date" 
                    id="endDate" 
                    v-model="assignmentEndDate" 
                    class="form-control" 
                    required 
                  />
                  <div class="invalid-feedback">
                    Please provide an end date.
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" v-model="assignmentActive" class="form-control">
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Video Info</label>
                  <div class="form-control-plaintext video-preview" v-if="selectedVideo">
                    <div><strong>Duration:</strong> {{ formatDuration(selectedVideo.duration_seconds) }}</div>
                    <div><strong>Cost/Play:</strong> {{ selectedVideo.cost_per_play }} balance</div>
                    <div><strong>Brand:</strong> {{ selectedVideo.brand?.name }}</div>
                  </div>
                  <div class="form-control-plaintext text-muted" v-else>
                    Select a video to see details
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary">{{ isEdited ? 'Update' : 'Create' }} Assignment</button>
              <button type="button" @click="isCreateUpdate = false" class="btn btn-secondary ml-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
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
const assignmentList = ref([]);
const slots = ref([]);
const brands = ref([]);
const videos = ref([]);
const isCreateUpdate = ref(false);
const isEdited = ref(false);
const $toast = useToast();
const querySearch = ref('');
const filterSlot = ref('');
const filterBrand = ref('');
const filterType = ref('');
const filterStatus = ref('');
const anyChecked = computed(() => checkedItems.value.length > 0);

// Form variables
const assignmentVideo = ref('');
const assignmentSlot = ref('');
const assignmentStartDate = ref('');
const assignmentEndDate = ref('');
const assignmentActive = ref(true);
const assignmentID = ref(null);

// Computed properties
const approvedVideos = computed(() => {
  return videos.value.filter(v => v.status === 'approved');
});

const selectedVideo = computed(() => {
  return videos.value.find(v => v.id === assignmentVideo.value);
});

const compatibleSlots = computed(() => {
  if (!selectedVideo.value) return slots.value;
  
  return slots.value.filter(slot => {
    if (selectedVideo.value.ad_type === 'general') {
      return slot.general_percentage > 0;
    } else if (selectedVideo.value.ad_type === 'perfume') {
      return slot.perfume_percentage > 0;
    }
    return true;
  });
});

const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = assignmentList.value.map(a => a.id);
  } else {
    checkedItems.value = [];
  }
}

const getAssignmentList = async () => {
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/slot-assignment/`;
  const params = new URLSearchParams();
  
  if (querySearch.value) params.append('search', querySearch.value);
  if (filterSlot.value) params.append('slot_id', filterSlot.value);
  if (filterBrand.value) params.append('brand_id', filterBrand.value);
  if (filterType.value) params.append('ad_type', filterType.value);
  if (filterStatus.value) params.append('is_active', filterStatus.value);
  
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
    assignmentList.value = data.data || [];
  } catch (error) {
    console.error('Error fetching assignments:', error);
    $toast.error('Failed to fetch assignments', { duration: 5000, position: 'top-right' });
  }
}

const getSlots = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/slot/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    slots.value = data.data || [];
  } catch (error) {
    console.error('Error fetching slots:', error);
  }
}

const getBrands = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    brands.value = data.data || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
}

const getVideos = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/video/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    videos.value = data.data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
}

onMounted(() => {
  getAssignmentList();
  getSlots();
  getBrands();
  getVideos();
});

function showAdd() {
  clearForm();
  isCreateUpdate.value = true;
  isEdited.value = false;
}

function showEdit(item) {
  isCreateUpdate.value = true;
  isEdited.value = true;
  assignmentID.value = item.id;
  assignmentVideo.value = item.video_id;
  assignmentSlot.value = item.slot_id;
  assignmentStartDate.value = item.start_date;
  assignmentEndDate.value = item.end_date;
  assignmentActive.value = item.is_active;
}

const onVideoChange = () => {
  // Reset slot selection when video changes to ensure compatibility
  if (assignmentSlot.value && !compatibleSlots.value.find(s => s.id === assignmentSlot.value)) {
    assignmentSlot.value = '';
  }
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
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/${strIDs}`, {
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
      getAssignmentList();
    } else {
      $toast.error(data.message || 'Failed to delete assignment(s)', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to delete assignment(s)', { duration: 5000, position: 'top-right' });
  }
}

const createData = async () => {
  let accessToken = localStorage.getItem('access_token');
  console.log('this is executing');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        video_id: assignmentVideo.value,
        slot_id: assignmentSlot.value,
        start_date: assignmentStartDate.value,
        end_date: assignmentEndDate.value,
        is_active: assignmentActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Assignment created successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getAssignmentList();
    } else {
      $toast.error(data.message || 'Failed to create assignment', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to create assignment', { duration: 5000, position: 'top-right' });
  }
}

const updateData = async () => {
  try {
    let accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/${assignmentID.value}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        video_id: assignmentVideo.value,
        slot_id: assignmentSlot.value,
        start_date: assignmentStartDate.value,
        end_date: assignmentEndDate.value,
        is_active: assignmentActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Assignment updated successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getAssignmentList();
    } else {
      $toast.error(data.message || 'Failed to update assignment', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to update assignment', { duration: 5000, position: 'top-right' });
  }
}

const toggleStatus = async (item) => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/${item.id}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    
    const data = await response.json();
    if (data.success) {
      $toast.success(`Assignment ${item.is_active ? 'deactivated' : 'activated'} successfully`, { duration: 5000, position: 'top-right' });
      getAssignmentList();
    } else {
      $toast.error(data.message || 'Failed to toggle assignment status', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to toggle assignment status', { duration: 5000, position: 'top-right' });
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
  assignmentVideo.value = '';
  assignmentSlot.value = '';
  assignmentStartDate.value = '';
  assignmentEndDate.value = '';
  assignmentActive.value = true;
  assignmentID.value = null;
}

// Utility functions
const formatTime = (time) => {
  if (!time) return 'N/A';
  return time.substring(0, 5); // HH:MM format
}

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

const getStatusBadgeClass = (isActive) => {
  return isActive ? 'badge-success' : 'badge-danger';
}

const getAdTypeBadgeClass = (type) => {
  switch (type) {
    case 'general': return 'badge-primary';
    case 'perfume': return 'badge-success';
    default: return 'badge-secondary';
  }
}
</script>

<style scoped>
.video-info {
  min-width: 200px;
}

.slot-info {
  min-width: 150px;
}

.date-range {
  min-width: 120px;
}

.actions-cell {
  text-align: center;
  min-width: 100px;
}

.btn-group {
  display: flex;
  gap: 2px;
}

.video-preview {
  font-size: 0.875rem;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
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
</style>