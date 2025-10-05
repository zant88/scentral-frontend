<template>
  <section class="section 1">
    <div class="section-header">
      <h1>Slot Management</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Slot Management</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Advertisement Slots</h2>
      <p class="section-lead">
        Manage time slots for advertisement scheduling.
      </p>
      <div class="card" v-if="!isCreateUpdate">
        <div class="card-header actionable">
          <client-only>
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteItem" v-if="anyChecked"
                data-toggle="tooltip" title="Delete Selected"><i class="fa fa-trash"></i></a>
              <a href="#" @click="showAdd" class="btn btn-icon btn-primary note-btn" data-toggle="tooltip"
                title="Add New"><i class="fas fa-plus"></i></a>
              <a href="#" @click="generateDefaultSlots" class="btn btn-icon btn-info note-btn" data-toggle="tooltip"
                title="Generate Default Slots"><i class="fas fa-clock"></i></a>
            </div>
          </client-only>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="getSlotList" class="form-control"
              placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <select v-model="filterStatus" @change="getSlotList" class="form-control">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="col-md-4">
              <select v-model="sortBy" @change="getSlotList" class="form-control">
                <option value="start_time">Sort by Start Time</option>
                <option value="end_time">Sort by End Time</option>
                <option value="general_percentage">Sort by General %</option>
                <option value="perfume_percentage">Sort by Perfume %</option>
              </select>
            </div>
            <div class="col-md-4">
              <button @click="getSlotList" class="btn btn-primary">
                <i class="fas fa-search mr-2"></i>Search
              </button>
            </div>
          </div>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th class="number-cell" scope="col">#</th>
                <th scope="col">Time Range</th>
                <th scope="col">General %</th>
                <th scope="col">Perfume %</th>
                <th scope="col">Status</th>
                <th scope="col">Utilization</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in slotList" :key="item.id">
                <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="item.id" /></td>
                <td scope="row">{{ i + 1 }}</td>
                <td>
                  <div class="time-range">
                    <strong>{{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}</strong>
                    <div class="text-muted small">{{ calculateDuration(item.start_time, item.end_time) }} hours</div>
                  </div>
                </td>
                <td>
                  <div class="percentage-display">
                    <div class="progress" style="height: 20px;">
                      <div class="progress-bar bg-primary" :style="{ width: item.general_percentage + '%' }">
                        {{ item.general_percentage }}%
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="percentage-display">
                    <div class="progress" style="height: 20px;">
                      <div class="progress-bar bg-success" :style="{ width: item.perfume_percentage + '%' }">
                        {{ item.perfume_percentage }}%
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(item.is_active)" class="badge">
                    {{ item.is_active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td>
                  <div class="utilization-info">
                    <div class="text-muted small">General: {{ item.utilization?.general_seconds || 0 }}s</div>
                    <div class="text-muted small">Perfume: {{ item.utilization?.perfume_seconds || 0 }}s</div>
                  </div>
                </td>
                <td class="actions-cell">
                  <div class="btn-group">
                    <button @click="showEdit(item)" class="btn btn-sm btn-warning" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="viewAssignments(item)" class="btn btn-sm btn-info" title="View Assignments">
                      <i class="fas fa-list"></i>
                    </button>
                    <button @click="toggleStatus(item)"
                      :class="item.is_active ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-success'"
                      :title="item.is_active ? 'Deactivate' : 'Activate'">
                      <i :class="item.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="slotList.length === 0" class="text-center py-4">
            <p class="text-muted">No slots found</p>
          </div>
        </div>
      </div>

      <!-- Create/Update Form -->
      <div class="card" v-if="isCreateUpdate">
        <div class="card-header">
          <h4>{{ isEdited ? 'Edit' : 'Add' }} Slot</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitForm" class="needs-validation" novalidate>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="startTime">Start Time *</label>
                  <input type="time" id="startTime" v-model="slotStartTime" class="form-control" required />
                  <div class="invalid-feedback">
                    Please provide a start time.
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="endTime">End Time *</label>
                  <input type="time" id="endTime" v-model="slotEndTime" class="form-control" required />
                  <div class="invalid-feedback">
                    Please provide an end time.
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="generalPercentage">General Percentage *</label>
                  <div class="input-group">
                    <input type="number" id="generalPercentage" v-model="slotGeneralPercentage" class="form-control"
                      min="0" max="100" required />
                    <div class="input-group-append">
                      <span class="input-group-text">%</span>
                    </div>
                  </div>
                  <div class="invalid-feedback">
                    Please provide a valid percentage (0-100).
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="perfumePercentage">Perfume Percentage *</label>
                  <div class="input-group">
                    <input type="number" id="perfumePercentage" v-model="slotPerfumePercentage" class="form-control"
                      min="0" max="100" required />
                    <div class="input-group-append">
                      <span class="input-group-text">%</span>
                    </div>
                  </div>
                  <div class="invalid-feedback">
                    Please provide a valid percentage (0-100).
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" v-model="slotActive" class="form-control">
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Total Percentage</label>
                  <div class="form-control-plaintext">
                    <span :class="totalPercentage === 100 ? 'text-success' : 'text-danger'">
                      {{ totalPercentage }}%
                    </span>
                    <small v-if="totalPercentage !== 100" class="text-danger d-block">
                      Total must equal 100%
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary" :disabled="totalPercentage !== 100">
                {{ isEdited ? 'Update' : 'Create' }} Slot
              </button>
              <button type="button" @click="isCreateUpdate = false" class="btn btn-secondary ml-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>


    </div>
  </section>
  <!-- Slot Assignments Modal -->
  <div v-if="isAssignmentsModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);"
    @click.self="closeAssignmentsModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Slot Assignments - {{ currentSlot?.start_time }} - {{ currentSlot?.end_time }}</h5>
          <button type="button" class="btn-close" @click="closeAssignmentsModal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <button @click="showAddAssignment" class="btn btn-primary btn-sm">
              <i class="fas fa-plus mr-2"></i>Add Assignment
            </button>
          </div>

          <!-- Add Assignment Form -->
          <div class="card mb-3" v-if="isAddAssignment">
            <div class="card-header">
              <h5>Add New Assignment</h5>
            </div>
            <div class="card-body">
              <form id="assignmentForm" @submit.prevent="submitAssignment" class="needs-validation" novalidate>
                <div class="row">
                  <div class="col-12 col-md-6">
                    <div class="form-group">
                      <label for="video">Video *</label>
                      <select id="video" v-model="newAssignment.video_id" class="form-control" required>
                        <option value="">Select Video</option>
                        <option v-for="video in allVideos" :key="video.id" :value="video.id">
                          {{ video.title }} ({{ video.brand?.name }}) - {{ video.ad_type }}
                        </option>
                      </select>
                      <small class="form-text text-muted">Videos: {{ allVideos.length }}</small>
                      <div class="invalid-feedback">
                        Please select a video.
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="form-group">
                      <label for="slot">Slot *</label>
                      <select id="slot" v-model="newAssignment.slot_id" class="form-control" required>
                        <option value="">Select Slot</option>
                        <option v-for="slot in allSlots" :key="slot.id" :value="slot.id">
                          {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
                          ({{ slot.general_percentage }}%G / {{ slot.perfume_percentage }}%P)
                        </option>
                      </select>
                      <small class="form-text text-muted">Slots: {{ allSlots.length }}</small>
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
                      <input type="date" id="startDate" v-model="newAssignment.start_date" class="form-control"
                        required />
                      <div class="invalid-feedback">
                        Please provide a start date.
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="form-group">
                      <label for="endDate">End Date *</label>
                      <input type="date" id="endDate" v-model="newAssignment.end_date" class="form-control" required />
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
                      <select id="status" v-model="newAssignment.is_active" class="form-control">
                        <option :value="true">Active</option>
                        <option :value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <button type="submit" class="btn btn-primary">Create Assignment</button>
                  <button type="button" @click="cancelAddAssignment" class="btn btn-secondary ml-2">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <table class="table table-sm">
            <thead>
              <tr>
                <th>Video</th>
                <th>Brand</th>
                <th>Type</th>
                <th>Date Range</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="assignment in slotAssignments" :key="assignment.id">
                <td>{{ assignment.video?.title || 'N/A' }}</td>
                <td>{{ assignment.video?.brand?.name || 'N/A' }}</td>
                <td>
                  <span :class="getAdTypeBadgeClass(assignment.video?.ad_type)" class="badge">
                    {{ assignment.video?.ad_type?.toUpperCase() || 'N/A' }}
                  </span>
                </td>
                <td>{{ formatDate(assignment.start_date) }} - {{ formatDate(assignment.end_date) }}</td>
                <td>
                  <span :class="getStatusBadgeClass(assignment.is_active)" class="badge">
                    {{ assignment.is_active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td>
                  <button @click="deleteAssignment(assignment)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="slotAssignments.length === 0" class="text-center py-3">
            <p class="text-muted">No assignments found for this slot</p>
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
const slotList = ref([]);
const isCreateUpdate = ref(false);
const isEdited = ref(false);
const isAssignmentsModal = ref(false);
const currentSlot = ref(null);
const slotAssignments = ref([]);
const allVideos = ref([]);
const allSlots = ref([]);
const isAddAssignment = ref(false);
const newAssignment = ref({
  video_id: '',
  slot_id: '',
  start_date: '',
  end_date: '',
  is_active: true
});
const $toast = useToast();
const querySearch = ref('');
const filterStatus = ref('');
const sortBy = ref('start_time');
const anyChecked = computed(() => checkedItems.value.length > 0);

// Form variables
const slotStartTime = ref('');
const slotEndTime = ref('');
const slotGeneralPercentage = ref(70);
const slotPerfumePercentage = ref(30);
const slotActive = ref(true);
const slotID = ref(null);

const totalPercentage = computed(() => {
  return (parseInt(slotGeneralPercentage.value) || 0) + (parseInt(slotPerfumePercentage.value) || 0);
});

const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = slotList.value.map(s => s.id);
  } else {
    checkedItems.value = [];
  }
}

const getSlotList = async () => {
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/slot/`;
  const params = new URLSearchParams();

  if (querySearch.value) params.append('search', querySearch.value);
  if (filterStatus.value) params.append('is_active', filterStatus.value === 'active');
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
    slotList.value = data.data || [];
  } catch (error) {
    console.error('Error fetching slots:', error);
    $toast.error('Failed to fetch slots', { duration: 5000, position: 'top-right' });
  }
}

onMounted(getSlotList);

function showAdd() {
  clearForm();
  isCreateUpdate.value = true;
  isEdited.value = false;
}

function showEdit(item) {
  isCreateUpdate.value = true;
  isEdited.value = true;
  slotID.value = item.id;
  slotStartTime.value = item.start_time;
  slotEndTime.value = item.end_time;
  slotGeneralPercentage.value = item.general_percentage;
  slotPerfumePercentage.value = item.perfume_percentage;
  slotActive.value = item.is_active;
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
    const response = await fetchWithAuth(`${apiUrl}/api/slot/${strIDs}`, {
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
      getSlotList();
    } else {
      $toast.error(data.message || 'Failed to delete slot(s)', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to delete slot(s)', { duration: 5000, position: 'top-right' });
  }
}

const createData = async () => {
  console.log('this is create data');
  let accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/slot/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        start_time: slotStartTime.value,
        end_time: slotEndTime.value,
        general_percentage: parseInt(slotGeneralPercentage.value),
        perfume_percentage: parseInt(slotPerfumePercentage.value),
        is_active: slotActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Slot created successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getSlotList();
    } else {
      $toast.error(data.message || 'Failed to create slot', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to create slot', { duration: 5000, position: 'top-right' });
  }
}

const updateData = async () => {
  try {
    let accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/slot/${slotID.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        start_time: slotStartTime.value,
        end_time: slotEndTime.value,
        general_percentage: parseInt(slotGeneralPercentage.value),
        perfume_percentage: parseInt(slotPerfumePercentage.value),
        is_active: slotActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Slot updated successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getSlotList();
    } else {
      $toast.error(data.message || 'Failed to update slot', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to update slot', { duration: 5000, position: 'top-right' });
  }
}

const generateDefaultSlots = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/slot/generate-default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const data = await response.json();
    if (data.success) {
      $toast.success('Default slots generated successfully', { duration: 5000, position: 'top-right' });
      getSlotList();
    } else {
      $toast.error(data.message || 'Failed to generate default slots', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to generate default slots', { duration: 5000, position: 'top-right' });
  }
}

const toggleStatus = async (item) => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/slot/${item.id}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const data = await response.json();
    if (data.success) {
      $toast.success(`Slot ${item.is_active ? 'deactivated' : 'activated'} successfully`, { duration: 5000, position: 'top-right' });
      getSlotList();
    } else {
      $toast.error(data.message || 'Failed to toggle slot status', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to toggle slot status', { duration: 5000, position: 'top-right' });
  }
}

const viewAssignments = async (item) => {
  console.log('Opening assignments modal for slot:', item);
  currentSlot.value = item;
  isAssignmentsModal.value = true;

  try {
    const accessToken = localStorage.getItem('access_token');
    console.log('Access token:', accessToken ? 'Present' : 'Missing');

    // Fetch assignments for the current slot
    console.log('Fetching assignments for slot:', item.id);
    const assignmentsResponse = await fetchWithAuth(`${apiUrl}/api/slot-assignment/slot/${item.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const assignmentsData = await assignmentsResponse.json();
    slotAssignments.value = assignmentsData.data || [];

    // Fetch all videos for the dropdown
    console.log('Fetching all videos');
    const videosResponse = await fetchWithAuth(`${apiUrl}/api/video/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const videosData = await videosResponse.json();
    allVideos.value = videosData.data || [];
    console.log('Videos response:', videosData);
    console.log('Videos:', allVideos.value);

    // Fetch all slots for the dropdown
    console.log('Fetching all slots');
    const slotsResponse = await fetchWithAuth(`${apiUrl}/api/slot/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const slotsData = await slotsResponse.json();
    allSlots.value = slotsData.data || [];
    console.log('Slots response:', slotsData);
    console.log('Slots:', allSlots.value);

  } catch (error) {
    console.error('Error fetching assignments:', error);
    $toast.error('Failed to fetch assignments', { duration: 5000, position: 'top-right' });
  }
}

const showAddAssignment = () => {
  console.log('Showing add assignment form');
  isAddAssignment.value = true;
  // Reset the form
  newAssignment.value = {
    video_id: '',
    slot_id: '',
    start_date: '',
    end_date: '',
    is_active: true
  };
}

const cancelAddAssignment = () => {
  isAddAssignment.value = false;
}

const submitAssignment = async () => {
  const form = document.querySelector('#assignmentForm');
  if (form.checkValidity()) {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newAssignment.value)
      });

      const data = await response.json();
      if (data.success) {
        $toast.success('Assignment created successfully', { duration: 5000, position: 'top-right' });
        isAddAssignment.value = false;
        viewAssignments(currentSlot.value); // Refresh assignments
      } else {
        $toast.error(data.message || 'Failed to create assignment', { duration: 5000, position: 'top-right' });
      }
    } catch (error) {
      $toast.error('Failed to create assignment', { duration: 5000, position: 'top-right' });
    }
  }
  form.classList.add('was-validated');
}

const closeAssignmentsModal = () => {
  isAssignmentsModal.value = false;
  currentSlot.value = null;
  slotAssignments.value = [];
  isAddAssignment.value = false;
}

const deleteAssignment = async (assignment) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/${assignment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const data = await response.json();
      if (data.success) {
        $toast.success('Assignment deleted successfully', { duration: 5000, position: 'top-right' });
        viewAssignments(currentSlot.value); // Refresh assignments
      } else {
        $toast.error(data.message || 'Failed to delete assignment', { duration: 5000, position: 'top-right' });
      }
    } catch (error) {
      $toast.error('Failed to delete assignment', { duration: 5000, position: 'top-right' });
    }
  }
}

const submitForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity() && totalPercentage.value === 100) {
    if (isEdited.value) {
      updateData();
    } else {
      createData();
    }
  }
  form.classList.add('was-validated');
};

function clearForm() {
  slotStartTime.value = '';
  slotEndTime.value = '';
  slotGeneralPercentage.value = 70;
  slotPerfumePercentage.value = 30;
  slotActive.value = true;
  slotID.value = null;
}

// Utility functions
const formatTime = (time) => {
  if (!time) return 'N/A';
  return time.substring(0, 5); // HH:MM format
}

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '0';

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const durationMinutes = endMinutes - startMinutes;
  return (durationMinutes / 60).toFixed(1);
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
.time-range {
  min-width: 120px;
}

.percentage-display {
  min-width: 100px;
}

.utilization-info {
  min-width: 100px;
  font-size: 0.875rem;
}

.actions-cell {
  text-align: center;
  min-width: 120px;
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

.badge-primary {
  background-color: #007bff;
}

.badge-success {
  background-color: #28a745;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-danger {
  background-color: #dc3545;
}

.badge-info {
  background-color: #17a2b8;
}

.badge-secondary {
  background-color: #6c757d;
}

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  color: white;
  font-size: 0.75rem;
  line-height: 20px;
}
</style>