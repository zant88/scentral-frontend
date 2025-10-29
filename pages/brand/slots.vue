<template>
  <section class="section">
    <div class="section-header">
      <h1>Slot Booking</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item"><a href="#" @click="navigateTo('/brand/dashboard')">Dashboard</a></div>
        <div class="breadcrumb-item active">Slot Booking</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Your Advertisement Slots</h2>
      <p class="section-lead">
        View your booked advertisement slots and scheduling information.
      </p>

      <!-- Summary Cards -->
      <div class="row">
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary">
              <i class="fas fa-clock"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Slots</h4>
              </div>
              <div class="card-body">
                {{ slotStats.total_slots }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success">
              <i class="fas fa-play-circle"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Active Today</h4>
              </div>
              <div class="card-body">
                {{ slotStats.active_today }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info">
              <i class="fas fa-eye"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Plays</h4>
              </div>
              <div class="card-body">
                {{ formatNumber(slotStats.total_plays) }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Spent Today</h4>
              </div>
              <div class="card-body">
                {{ formatNumber(slotStats.spent_today) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hourly Timeline View -->
      <div class="card">
        <div class="card-header">
          <h4>{{ getCurrentTabLabel() }} Slots</h4>
          <div class="card-header-action">
            
            <!-- View Mode Toggle -->
            <div class="btn-group" role="group">
              <button
                @click="viewMode = 'timeline'"
                :class="['btn', viewMode === 'timeline' ? 'btn-primary' : 'btn-outline-primary']"
              >
                <i class="fas fa-clock"></i> Timeline
              </button>
              <button
                @click="viewMode = 'list'"
                :class="['btn', viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary']"
              >
                <i class="fas fa-list"></i> List
              </button>
            </div>

          </div>
        </div>
        <div class="card-body">
          

          <!-- Timeline View -->
          <div v-if="viewMode === 'timeline'" class="timeline-container">
            <div v-if="loading" class="text-center py-4">
              <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="text-muted mt-3">Loading {{ getCurrentTabLabel().toLowerCase() }} slots...</p>
              </div>
            </div>
            <div v-else class="slot-timeline">
              <div v-if="availableSlots.length === 0" class="text-center py-5">
                <i class="fas fa-clock fa-4x text-muted mb-3"></i>
                <h5 class="text-muted">No slots available</h5>
                <p class="text-muted">No slots have been configured for booking</p>
              </div>

              <!-- Enhanced List View -->
              <div
                v-for="slot in availableSlots"
                :key="slot.id"
                :class="['slot-item', getSlotItemClass(slot)]"
                @click="showSlotDetails(slot)"
              >
                <div class="slot-time">
                  <div class="time-display">
                    <i class="fas fa-clock"></i>
                    <div class="time-label">{{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}</div>
                  </div>
                  <div v-if="isCurrentSlot(slot)" class="current-slot-indicator">
                    <div class="pulse-dot"></div>
                    <span>NOW</span>
                  </div>
                </div>

                <div class="slot-content">
                  <!-- Slot is available but not booked by current user -->
                  <div v-if="slot.is_available" class="available-slot-info">
                    <div class="slot-header-info">
                      <div class="slot-name">{{ slot.name }}</div>
                      <div class="slot-status-badge available">
                        <i class="fas fa-check-circle"></i> Available
                      </div>
                    </div>
                    <div class="slot-description">
                      <div class="slot-types">
                        <span v-if="slot.allow_perfume" class="type-indicator perfume">
                          <i class="fas fa-leaf"></i> Perfume
                        </span>
                        <span v-if="slot.allow_general" class="type-indicator general">
                          <i class="fas fa-tv"></i> General
                        </span>
                      </div>
                      <div class="duration-info">
                        <i class="fas fa-hourglass-half"></i>
                        Total: {{ formatDuration(slot.perfume_seconds + slot.general_seconds) }}
                      </div>
                    </div>
                    <div class="slot-details">
                      <div class="detail-item">
                        <span class="detail-label">Perfume:</span>
                        <span class="detail-value">{{ formatDuration(slot.perfume_seconds) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">General:</span>
                        <span class="detail-value">{{ formatDuration(slot.general_seconds) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Slot is booked by current user -->
                  <div v-else class="booked-slot-info">
                    <div class="slot-header-info">
                      <div class="slot-name">{{ slot.name }}</div>
                      <div class="slot-status-badge booked">
                        <i class="fas fa-video"></i> Your Video
                      </div>
                    </div>
                    <div class="video-assignment">
                      <div class="video-title">
                        <i class="fas fa-play-circle"></i>
                        {{ slot.video_assignment.title }}
                      </div>
                      <div class="video-meta">
                        <div class="slot-types">
                          <span v-if="slot.allow_perfume" class="type-indicator perfume">
                            <i class="fas fa-leaf"></i> Perfume
                          </span>
                          <span v-if="slot.allow_general" class="type-indicator general">
                            <i class="fas fa-tv"></i> General
                          </span>
                        </div>
                        <div class="duration-info">
                          <i class="fas fa-hourglass-half"></i>
                          {{ formatDuration(slot.perfume_seconds + slot.general_seconds) }}
                        </div>
                      </div>
                      <div class="performance-stats" v-if="slot.video_assignment.plays_count > 0 || slot.video_assignment.amount > 0">
                        <div class="stat-item" v-if="slot.video_assignment.plays_count > 0">
                          <i class="fas fa-play"></i>
                          <span>{{ slot.video_assignment.plays_count }} plays</span>
                        </div>
                        <div class="stat-item" v-if="slot.video_assignment.total_cost > 0">
                          <i class="fas fa-wallet"></i>
                          <span>{{ formatCurrency(slot.video_assignment.total_cost) }} spent</span>
                        </div>
                        <div class="stat-item amount" v-if="slot.video_assignment.amount > 0">
                          <i class="fas fa-money-bill-wave"></i>
                          <span>{{ formatCurrency(slot.video_assignment.amount) }} amount</span>
                        </div>
                      </div>
                    </div>
                    <div class="slot-actions">
                      <button @click.stop="showSlotDetails(slot)" class="details-btn">
                        <i class="fas fa-eye"></i> Details
                      </button>
                      <button v-if="isCurrentSlot(slot)" class="now-playing-btn">
                        <i class="fas fa-play"></i> Now Playing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="slot-list">
            <!-- Filters -->
            <div class="row mb-3">
              <div class="col-md-3">
                <select v-model="filterStatus" @change="filterSlots" class="form-control">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="col-md-3">
                <input 
                  type="date" 
                  v-model="filterDate" 
                  @change="filterSlots"
                  class="form-control"
                />
              </div>
              <div class="col-md-3">
                <select v-model="filterVideo" @change="filterSlots" class="form-control">
                  <option value="">All Videos</option>
                  <option v-for="video in videos" :key="video.id" :value="video.id">
                    {{ video.title }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <div class="input-group">
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    @input="filterSlots"
                    class="form-control" 
                    placeholder="Search..."
                  />
                  <div class="input-group-append">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Slots Table -->
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Video</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Device</th>
                    <th>Duration</th>
                    <th>Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="slot in paginatedSlots" :key="slot.id">
                    <td>{{ formatDate(slot.slot_date) }}</td>
                    <td>{{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}</td>
                    <td>
                      <div class="slot-video-info">
                        <strong>{{ slot.video_title }}</strong>
                        <div class="text-muted small">{{ slot.video_description }}</div>
                      </div>
                    </td>
                    <td>
                      <span :class="getAdTypeBadgeClass(slot.ad_type)" class="badge">
                        {{ slot.ad_type?.toUpperCase() }}
                      </span>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(slot.status)" class="badge">
                        {{ slot.status?.toUpperCase() }}
                      </span>
                    </td>
                    <td>
                      <div class="device-info">
                        <i class="fas fa-microchip text-muted"></i>
                        {{ slot.device_name || 'N/A' }}
                      </div>
                    </td>
                    <td>{{ formatDuration(slot.duration_seconds) }}</td>
                    <td>{{ formatCurrency(slot.cost) }}</td>
                    <td>
                      <button @click="showSlotDetails(slot)" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="filteredSlots.length === 0" class="text-center py-5">
              <i class="fas fa-calendar-times fa-4x text-muted mb-3"></i>
              <h5 class="text-muted">No slots found</h5>
              <p class="text-muted">
                {{ searchQuery || filterStatus || filterDate || filterVideo ? 'Try adjusting your filters' : 'No slots have been booked yet' }}
              </p>
            </div>

            <!-- Pagination -->
            <nav v-if="totalPages > 1" aria-label="Page navigation">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
                </li>
                <li 
                  v-for="page in totalPages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: currentPage === page }"
                >
                  <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- Slot Details Modal -->
  <div v-if="showDetailsModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeDetailsModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Slot Details</h5>
          <button type="button" class="btn-close" @click="closeDetailsModal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedSlot" class="row">
            <div class="col-md-6">
              <h6>Schedule Information</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Date:</strong></td>
                    <td>{{ formatDate(selectedSlot.slot_date) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Time:</strong></td>
                    <td>{{ formatTime(selectedSlot.start_time) }} - {{ formatTime(selectedSlot.end_time) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Duration:</strong></td>
                    <td>{{ formatDuration(selectedSlot.duration_seconds) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Status:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedSlot.status)" class="badge">
                        {{ selectedSlot.status?.toUpperCase() }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Cost:</strong></td>
                    <td>{{ formatCurrency(selectedSlot.cost) }}</td>
                  </tr>
                </tbody>
                
              </table>
            </div>
            <div class="col-md-6">
              <h6>Video Information</h6>
              <div class="video-info">
                <img 
                  :src="selectedSlot.video_thumbnail || '/assets/img/no-image.jpg'" 
                  :alt="selectedSlot.video_title"
                  class="img-fluid rounded mb-2"
                />
                <h6>{{ selectedSlot.video_title }}</h6>
                <p class="text-muted small">{{ selectedSlot.video_description }}</p>
                
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Type:</strong></td>
                      <td>
                        <span :class="getAdTypeBadgeClass(selectedSlot.ad_type)" class="badge">
                          {{ selectedSlot.ad_type?.toUpperCase() }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Device:</strong></td>
                      <td>{{ selectedSlot.device_name || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Created:</strong></td>
                      <td>{{ formatDateTime(selectedSlot.created_at) }}</td>
                    </tr>
                  </tbody>
                  
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeDetailsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'brand'
})

import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Reactive data
const slots = ref([]);
const availableSlots = ref([]);
const videos = ref([]);
const slotStats = ref({
  total_slots: 0,
  active_today: 0,
  total_plays: 0,
  spent_today: 0
});

// View modes
const viewMode = ref('timeline');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(false);

// Filters
const searchQuery = ref('');
const filterStatus = ref('');
const filterDate = ref('');
const filterVideo = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Modals
const showDetailsModal = ref(false);
const selectedSlot = ref(null);

// Tab functionality
const activeTab = ref('today');
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const calendarDays = ref([]);
const currentWeekStart = ref(new Date());

// Date tabs configuration
const dateTabs = [
  { key: 'today', label: 'Today', icon: 'fas fa-calendar-day' },
  { key: 'week', label: 'This Week', icon: 'fas fa-calendar-week' },
  { key: 'month', label: 'This Month', icon: 'fas fa-calendar' },
  { key: 'all', label: 'All', icon: 'fas fa-calendar-alt' }
];


// Navigation function
const navigateTo = (path) => {
  router.push(path);
};

// Fetch available slots with current assignments from API
const fetchAvailableSlots = async (startDate = '', endDate = '') => {
  try {
    loading.value = true;
    const accessToken = localStorage.getItem('access_token');
    
    // Build API URL with date range parameters if provided
    let slotsUrl = `${apiUrl}/api/slots?status=ACTIVE`;
    if (startDate) slotsUrl += `&start_date=${startDate}`;
    if (endDate) slotsUrl += `&end_date=${endDate}`;
    
    // Call the real API endpoint for available slots
    const slotsResponse = await fetchWithAuth(slotsUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const slotsData = await slotsResponse.json();
    console.log('Slots API Response:', slotsData);
    
    // Also fetch booked slots with user video amounts
    let bookedUrl = `${apiUrl}/api/brand/dashboard/slots`;
    if (startDate) bookedUrl += `?start_date=${startDate}`;
    if (endDate) bookedUrl += bookedUrl.includes('?') ? `&end_date=${endDate}` : `?end_date=${endDate}`;
    
    const bookedResponse = await fetchWithAuth(bookedUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const bookedData = await bookedResponse.json();
    console.log('Booked Slots API Response:', bookedData);
    
    if (slotsData.success) {
      // Create a map of booked slots by slot_id for easy lookup
      const bookedSlotsMap = {};
      if (bookedData.success && bookedData.data) {
        bookedData.data.forEach(bookedSlot => {
          bookedSlotsMap[bookedSlot.slot_id] = bookedSlot;
        });
      }
      
      // Process the slots data to match our expected format
      const processedSlots = (slotsData.data || []).map(slot => {
        // Check if this slot has a video assignment for the current brand
        const bookedSlot = bookedSlotsMap[slot.id];
        const hasAssignment = bookedSlot && bookedSlot.video_id;
        
        return {
          id: slot.id,
          name: slot.name || `Slot ${slot.id}`,
          start_time: slot.start_time,
          end_time: slot.end_time,
          perfume_seconds: slot.perfume_seconds || 0,
          general_seconds: slot.general_seconds || 0,
          status: slot.status || "ACTIVE",
          priority: slot.priority || "MEDIUM",
          allow_perfume: slot.allow_perfume || false,
          allow_general: slot.allow_general || false,
          is_available: !hasAssignment,
          video_assignment: hasAssignment ? {
            id: bookedSlot.video_id,
            title: bookedSlot.video_title || "Untitled Video",
            status: bookedSlot.status || "ACTIVE",
            plays_count: bookedSlot.plays_count || 0,
            total_cost: bookedSlot.total_cost || 0.0,
            amount: bookedSlot.amount || 0.0 // Include the amount for booked user videos
          } : null,
          plays_count: bookedSlot?.plays_count || 0,
          total_cost: bookedSlot?.total_cost || 0.0,
          amount: bookedSlot?.amount || 0.0, // Include the amount at slot level
          // Add fields needed for list view
          slot_date: slot.slot_date || startDate || new Date().toISOString().split('T')[0],
          video_title: hasAssignment ? bookedSlot.video_title : '',
          video_description: hasAssignment ? bookedSlot.video_description || '' : '',
          video_id: hasAssignment ? bookedSlot.video_id : null,
          ad_type: hasAssignment ? bookedSlot.ad_type || 'general' : '',
          device_name: hasAssignment ? bookedSlot.device_name || '' : '',
          duration_seconds: (slot.perfume_seconds || 0) + (slot.general_seconds || 0),
          cost: hasAssignment ? bookedSlot.cost || 0 : 0,
          video_thumbnail: hasAssignment ? bookedSlot.video_thumbnail || '' : '',
          created_at: hasAssignment ? bookedSlot.created_at || new Date().toISOString() : new Date().toISOString()
        };
      });
      
      availableSlots.value = processedSlots;
      console.log('Processed slots:', availableSlots.value.length);
      calculateStats();
    } else {
      console.error('API Error:', slotsData.message);
      $toast.error(slotsData.message || 'Failed to fetch slots', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    console.error('Error fetching slots:', error);
    $toast.error('Failed to load slots', { duration: 5000, position: 'top-right' });
  } finally {
    loading.value = false;
  }
};

// Fetch slot assignments (for list view)
const fetchSlots = async () => {
  try {
    // Check if we have an access token
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found. Please log in again.');
    }
    
    console.log('Fetching brand dashboard slots from:', `${apiUrl}/api/brand/dashboard/slots`);
    
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/slots`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Brand Dashboard Slots Response:', data);
    
    if (data.success) {
      // Process the slots data to match our expected format
      const processedSlots = (data.data || []).map(slot => {
        return {
          id: slot.id,
          slot_date: slot.slot_date || selectedDate.value,
          video_title: slot.video_title || '',
          video_description: slot.video_description || '',
          video_id: slot.video_id,
          ad_type: slot.ad_type || 'general',
          status: slot.status || 'active',
          device_name: slot.device_name || '',
          duration_seconds: slot.duration_seconds || 0,
          cost: slot.cost || 0,
          video_thumbnail: slot.video_thumbnail || '',
          created_at: slot.created_at || new Date().toISOString(),
          // Add fields needed for timeline view
          name: slot.name || `Slot ${slot.id}`,
          start_time: slot.start_time || '00:00',
          end_time: slot.end_time || '00:00',
          perfume_seconds: slot.perfume_seconds || 0,
          general_seconds: slot.general_seconds || 0,
          priority: slot.priority || "MEDIUM",
          allow_perfume: slot.allow_perfume || false,
          allow_general: slot.allow_general || false,
          is_available: false, // These are booked slots, so not available
          video_assignment: slot.video_id ? {
            id: slot.video_id,
            title: slot.video_title || "Untitled Video",
            status: slot.status || "ACTIVE",
            plays_count: slot.plays_count || 0,
            total_cost: slot.total_cost || 0.0,
            amount: slot.amount || 0.0
          } : null,
          plays_count: slot.plays_count || 0,
          total_cost: slot.total_cost || 0.0,
          amount: slot.amount || 0.0
        };
      });
      
      slots.value = processedSlots;
      console.log('Processed list slots:', slots.value.length);
      calculateStats();
      
      // Show success message for debugging
      if (processedSlots.length > 0) {
        $toast.success(`Loaded ${processedSlots.length} booked slots`, { duration: 2000, position: 'top-right' });
      }
    } else {
      console.error('API Error:', data.message);
      $toast.error(data.message || 'Failed to fetch booked slots', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    console.error('Error fetching slots:', error);
    $toast.error(`Failed to fetch booked slots: ${error.message}`, { duration: 5000, position: 'top-right' });
  }
};

// Fetch videos for filter
const fetchVideos = async () => {
  try {
    // Check if we have an access token
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found. Please log in again.');
    }
    
    console.log('Fetching brand videos from:', `${apiUrl}/api/brand/videos`);
    
    const response = await fetchWithAuth(`${apiUrl}/api/brand/videos`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Brand Videos Response:', data);
    
    if (data.success) {
      videos.value = data.data || [];
      console.log('Loaded videos for filter:', videos.value.length);
    } else {
      console.error('API Error:', data.message);
      $toast.error(data.message || 'Failed to fetch videos', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    $toast.error(`Failed to fetch videos: ${error.message}`, { duration: 5000, position: 'top-right' });
  }
};

// Calculate statistics
const calculateStats = () => {
  // Count only actual booked slots (not available)
  const bookedSlots = availableSlots.value.filter(s => !s.is_available);
  
  // Calculate total plays and spent from booked slots
  const totalPlays = bookedSlots.reduce((sum, slot) => sum + (slot.plays_count || 0), 0);
  const totalSpent = bookedSlots.reduce((sum, slot) => sum + (slot.total_cost || 0), 0);
  
  slotStats.value = {
    total_slots: availableSlots.value.length,
    active_today: bookedSlots.length,
    total_plays: totalPlays,
    spent_today: totalSpent
  };
};

// Slot-based functions
const getCurrentHour = () => {
  return new Date().getHours();
};

const getSlotItemClass = (slot) => {
  if (isCurrentSlot(slot)) return 'current-slot';
  if (!slot.is_available) return 'booked-slot';
  return 'available-slot';
};

const canBookSlot = (slot) => {
  const currentHour = getCurrentHour();
  const slotHour = parseInt(slot.start_time.split(':')[0]);

  // Can't book past slots or already booked slots
  if (slotHour < currentHour || !slot.is_available) return false;

  return true;
};

const isCurrentSlot = (slot) => {
  const currentHour = getCurrentHour();
  const startHour = parseInt(slot.start_time.split(':')[0]);
  const endHour = parseInt(slot.end_time.split(':')[0]);

  return currentHour >= startHour && currentHour < endHour;
};

const showSlotDetails = (slot) => {
  selectedSlot.value = slot;
  showDetailsModal.value = true;
};

const bookSlot = (slot) => {
  // This would open a booking modal with slot data
  console.log('Booking slot:', slot);
  // TODO: Implement booking modal
  $toast.info(`Booking feature for ${slot.name} will be available soon`, { duration: 3000, position: 'top-right' });
};

const fetchSlotsForDate = async () => {
  await fetchAvailableSlots();
};

// Get date range for current tab
const getTabDateRange = () => {
  const today = new Date();
  
  switch (activeTab.value) {
    case 'today':
      return today.toLocaleDateString();
    case 'week':
      return getWeekRange();
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return `${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`;
    case 'all':
      return 'All time';
    default:
      return '';
  }
};


// Filter and sort slots
const filteredSlots = computed(() => {
  // Use availableSlots for both timeline and list views
  let filtered = [...availableSlots.value];
  
  // For list view, only show booked slots (not available)
  if (viewMode.value === 'list') {
    filtered = filtered.filter(slot => !slot.is_available);
  }
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(slot =>
      slot.video_title?.toLowerCase().includes(query) ||
      slot.video_description?.toLowerCase().includes(query) ||
      slot.device_name?.toLowerCase().includes(query) ||
      slot.name?.toLowerCase().includes(query)
    );
  }
  
  // Status filter
  if (filterStatus.value) {
    filtered = filtered.filter(slot => {
      if (filterStatus.value === 'active') return slot.status === 'active' || slot.status === 'ACTIVE';
      if (filterStatus.value === 'scheduled') return slot.status === 'scheduled';
      if (filterStatus.value === 'completed') return slot.status === 'completed';
      if (filterStatus.value === 'cancelled') return slot.status === 'cancelled';
      return true;
    });
  }
  
  // Date filter
  if (filterDate.value) {
    filtered = filtered.filter(slot => slot.slot_date === filterDate.value);
  }
  
  // Video filter
  if (filterVideo.value) {
    filtered = filtered.filter(slot => slot.video_id === filterVideo.value);
  }
  
  // Sort by date and time
  filtered.sort((a, b) => {
    const dateA = new Date(a.slot_date + ' ' + a.start_time);
    const dateB = new Date(b.slot_date + ' ' + b.start_time);
    return dateB - dateA;
  });
  
  return filtered;
});

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredSlots.value.length / itemsPerPage);
});

const paginatedSlots = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredSlots.value.slice(start, end);
});

// Filter slots
const filterSlots = () => {
  currentPage.value = 1;
};

// Close modals
const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedSlot.value = null;
};

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
};

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rp${Math.round(numAmount).toLocaleString('id-ID')}`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  return timeString.substring(0, 5); // HH:MM format
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const getAdTypeBadgeClass = (type) => {
  switch (type) {
    case 'general': return 'badge-primary';
    case 'perfume': return 'badge-success';
    default: return 'badge-secondary';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active': return 'badge-success';
    case 'scheduled': return 'badge-primary';
    case 'completed': return 'badge-info';
    case 'cancelled': return 'badge-danger';
    default: return 'badge-secondary';
  }
};

// Enhanced functionality functions
const getCurrentTabLabel = () => {
  const tab = dateTabs.find(t => t.key === activeTab.value);
  return tab ? tab.label : 'Today';
};

const fetchSlotsForTab = async (tab) => {
  loading.value = true;
  try {
    let startDate, endDate;
    const today = new Date();

    switch (tab) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        selectedDate.value = startDate;
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        endDate = weekEnd.toISOString().split('T')[0];
        selectedDate.value = startDate;
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate = monthEnd.toISOString().split('T')[0];
        selectedDate.value = startDate;
        break;
      case 'all':
        startDate = '';
        endDate = '';
        break;
    }

    await fetchAvailableSlots(startDate, endDate);
    if (tab === 'week') {
      generateCalendarDays();
    }
  } catch (error) {
    console.error('Error fetching slots for tab:', error);
  } finally {
    loading.value = false;
  }
};

// Tab switching function
const switchTab = async (tabKey) => {
  if (activeTab.value === tabKey) return; // Don't do anything if clicking the same tab
  
  activeTab.value = tabKey;
  currentPage.value = 1; // Reset pagination when switching tabs
  
  // Fetch slots for the selected tab
  await fetchSlotsForTab(tabKey);
};

// Calendar functions
const generateCalendarDays = () => {
  const weekStart = new Date(currentWeekStart.value);
  const days = [];

  for (let i = 0; i < 35; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);

    const dayOfWeek = currentDate.getDay();
    const isCurrentMonth = currentDate.getMonth() === new Date().getMonth();

    // Get slots for this date
    const daySlots = availableSlots.value.filter(slot => {
      // This would need to be enhanced to check if slot date matches current date
      // For now, we'll simulate based on time
      return true; // Placeholder - would need actual date comparison
    });

    days.push({
      day: currentDate.getDate(),
      date: currentDate.toISOString().split('T')[0],
      dayOfWeek: dayOfWeek,
      isCurrentMonth: isCurrentMonth,
      isToday: currentDate.toDateString() === new Date().toDateString(),
      slots: daySlots,
      totalSlots: daySlots.length
    });
  }

  calendarDays.value = days;
};

const getWeekRange = () => {
  const start = new Date(currentWeekStart.value);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${formatDate(start.toISOString().split('T')[0])} - ${formatDate(end.toISOString().split('T')[0])}`;
};

const previousWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7);
  generateCalendarDays();
};

const nextWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7);
  generateCalendarDays();
};

const selectCalendarDay = (day) => {
  if (day.slots.length > 0) {
    selectedDate.value = day.date;
    // Fetch slots for selected date
    fetchAvailableSlots();
    // Optionally switch to timeline view
    viewMode.value = 'timeline';
  }
};

// Enhanced styling functions
const getCalendarDayClass = (day) => {
  return {
    'calendar-day-today': day.isToday,
    'calendar-day-other-month': !day.isCurrentMonth,
    'calendar-day-has-slots': day.slots.length > 0,
    'calendar-day-clickable': day.slots.length > 0
  };
};

const getSlotDotClass = (slot) => {
  if (slot.is_available) {
    return 'slot-dot-available';
  } else if (slot.video_assignment) {
    return 'slot-dot-booked';
  } else {
    return 'slot-dot-unavailable';
  }
};


// Watch for tab changes to refresh data
watch(activeTab, async (newTab) => {
  await fetchSlotsForTab(newTab);
});

// Watch for view mode changes
watch(viewMode, async (newMode) => {
  if (newMode === 'list' && slots.value.length === 0) {
    await fetchSlots();
  }
});

// Lifecycle
onMounted(async () => {
  // Initialize with today's slots
  await fetchSlotsForTab('today');
  await fetchVideos();
  await fetchSlots(); // Also fetch slots for list view
  generateCalendarDays();
});
</script>

<style scoped>
.card-statistic-1 {
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.card-statistic-1 .card-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  border-radius: 0 0 0 100%;
  margin: 0;
}

.card-statistic-1 .card-wrap {
  padding: 1.5rem 1.5rem 1.5rem 1.8rem;
}

.card-statistic-1 .card-header h4 {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
}

.card-statistic-1 .card-body {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

/* Loading Spinner */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Timeline Styles */
.timeline-container {
  padding: 20px 0;
}

/* .slot-timeline {
  max-height: 800px;
  overflow-y: auto;
} */

/* Enhanced List Styles */
.slot-item {
  display: flex;
  align-items: stretch;
  padding: 0;
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.slot-item:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.slot-item.current-slot {
  border-color: #007bff;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  box-shadow: 0 6px 20px rgba(0,123,255,0.15);
}

.slot-item.booked-slot {
  border-color: #28a745;
  background: linear-gradient(135deg, #f0f8f0 0%, #ffffff 100%);
}

.slot-item.available-slot {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fffef0 0%, #ffffff 100%);
}

.slot-time {
  width: 140px;
  min-width: 140px;
  background: rgba(0, 0, 0, 0.02);
  border-right: 1px solid #e9ecef;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.time-display i {
  color: #007bff;
  font-size: 1.5rem;
}

.time-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
  line-height: 1.3;
}

.current-slot-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #007bff;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 6px 10px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 20px;
}

.slot-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.slot-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.slot-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  line-height: 1.3;
}

.slot-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.slot-status-badge.available {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.slot-status-badge.booked {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.slot-description {
  margin-bottom: 12px;
}

.slot-types {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.type-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-indicator.perfume {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.type-indicator.general {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  font-size: 0.9rem;
}

.slot-details {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 600;
}

.book-slot-btn {
  align-self: flex-start;
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.book-slot-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.video-assignment {
  flex: 1;
}

.video-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #333;
}

.video-title i {
  color: #007bff;
}

.video-meta {
  margin-bottom: 12px;
}

.performance-stats {
  display: flex;
  gap: 20px;
  padding: 12px;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #495057;
}

.stat-item i {
  color: #28a745;
}

.stat-item.amount i {
  color: #ffc107;
}

.stat-item.amount {
  background: rgba(255, 193, 7, 0.1);
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.slot-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.details-btn {
  padding: 8px 16px;
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.details-btn:hover {
  background: rgba(0, 123, 255, 0.2);
}

.now-playing-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.now-playing-btn:hover {
  background: #218838;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

/* List Styles */
.slot-video-info {
  min-width: 200px;
}

.device-info {
  font-size: 0.875rem;
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
</style>

/* Tab Navigation Styles */
.card-header-action {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-group.mr-3 {
  margin-right: 1rem;
}

.btn-group .btn {
  position: relative;
  transition: all 0.2s ease;
}

.btn-group .btn:hover {
  z-index: 1;
}

.btn-group .btn.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-group .btn.btn-outline-primary {
  background-color: transparent;
  border-color: #007bff;
  color: #007bff;
}

.btn-group .btn.btn-outline-primary:hover {
  background-color: #007bff;
  color: white;
}

/* Tab-specific content styling */
.tab-content {
  padding: 1rem 0;
}

.tab-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #007bff;
}

.tab-info h6 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.tab-info .date-range {
  color: #6c757d;
  font-size: 0.875rem;
}

/* Enhanced timeline for different tabs */
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.timeline-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.timeline-stats {
  display: flex;
  gap: 1.5rem;
}

.timeline-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.timeline-stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #007bff;
}

.timeline-stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Calendar view for week tab */
.calendar-container {
  margin-top: 1.5rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calendar-nav {
  display: flex;
  gap: 0.5rem;
}

.calendar-nav button {
  padding: 0.5rem 0.75rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-nav button:hover {
  background: #e9ecef;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  color: #495057;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: white;
}

.calendar-day:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.calendar-day-today {
  background: #e3f2fd;
  border-color: #007bff;
  font-weight: bold;
}

.calendar-day-other-month {
  color: #adb5bd;
  background: #f8f9fa;
}

.calendar-day-has-slots {
  border-color: #28a745;
}

.calendar-day-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.calendar-day-number {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.calendar-day-slots {
  display: flex;
  gap: 2px;
  margin-top: 0.25rem;
}

.slot-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.slot-dot-available {
  background: #ffc107;
}

.slot-dot-booked {
  background: #28a745;
}

.slot-dot-unavailable {
  background: #6c757d;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header-action {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .btn-group {
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
  }
  
  .timeline-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .calendar-grid {
    gap: 0.25rem;
  }
  
  .calendar-day {
    font-size: 0.75rem;
  }
}
