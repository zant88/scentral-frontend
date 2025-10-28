<template>
  <section class="section">
    <div class="section-header">
      <h1>Brand Profile</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item"><a href="#" @click="navigateTo('/brand/dashboard')">Dashboard</a></div>
        <div class="breadcrumb-item active">Brand Profile</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Your Brand Information</h2>
      <p class="section-lead">
        View your brand profile information. Contact admin to make changes.
      </p>

      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4>Brand Details</h4>
              <div class="card-header-action">
                <span class="badge" :class="getActiveClass(brandInfo.is_active)">
                  {{ brandInfo.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label text-muted">Brand Name</label>
                    <div class="form-control-plaintext">{{ brandInfo.name || 'N/A' }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label text-muted">Status</label>
                    <div class="form-control-plaintext">
                      <span class="badge" :class="getActiveClass(brandInfo.is_active)">
                        {{ brandInfo.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label text-muted">Description</label>
                    <div class="form-control-plaintext">{{ brandInfo.description || 'No description provided' }}</div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label text-muted">Created Date</label>
                    <div class="form-control-plaintext">{{ formatDate(brandInfo.created_at) }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label text-muted">Last Updated</label>
                    <div class="form-control-plaintext">{{ formatDate(brandInfo.updated_at) }}</div>
                  </div>
                </div>
              </div>

              <div class="alert alert-info">
                <i class="fas fa-info-circle mr-2"></i>
                <strong>Note:</strong> This is a read-only view of your brand profile. 
                To make changes to your brand information, please contact the system administrator.
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h4>Brand Logo</h4>
            </div>
            <div class="card-body text-center">
              <div class="brand-logo-container">
                <img 
                  :src="brandInfo.logo_url || '/assets/img/no-image.jpg'" 
                  :alt="brandInfo.name"
                  class="brand-logo"
                />
              </div>
              <p class="text-muted mt-3">Current Logo</p>
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Logo updates require admin approval.
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card">
            <div class="card-header">
              <h4>Quick Stats</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-6">
                  <div class="text-center">
                    <h5 class="text-primary">{{ brandStats.total_videos || 0 }}</h5>
                    <small class="text-muted">Total Videos</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center">
                    <h5 class="text-success">{{ brandStats.active_slots || 0 }}</h5>
                    <small class="text-muted">Active Slots</small>
                  </div>
                </div>
              </div>
              <hr>
              <div class="row">
                <div class="col-6">
                  <div class="text-center">
                    <h5 class="text-info">{{ brandStats.total_plays || 0 }}</h5>
                    <small class="text-muted">Total Plays</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center">
                    <h5 class="text-warning">{{ formatCurrency(brandStats.total_spend) }}</h5>
                    <small class="text-muted">Total Spend</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="card">
        <div class="card-header">
          <h4>Contact Information</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label text-muted">Email</label>
                <div class="form-control-plaintext">
                  <i class="fas fa-envelope mr-2"></i>
                  {{ brandInfo.email || 'N/A' }}
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label text-muted">Phone</label>
                <div class="form-control-plaintext">
                  <i class="fas fa-phone mr-2"></i>
                  {{ brandInfo.phone || 'N/A' }}
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label class="form-label text-muted">Website</label>
                <div class="form-control-plaintext">
                  <i class="fas fa-globe mr-2"></i>
                  <a v-if="brandInfo.website" :href="brandInfo.website" target="_blank" class="text-primary">
                    {{ brandInfo.website }}
                  </a>
                  <span v-else>N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h4>Recent Activity</h4>
          <div class="card-header-action">
            <button @click="navigateTo('/brand/reports')" class="btn btn-sm btn-primary">
              <i class="fas fa-chart-bar mr-1"></i>View Full Reports
            </button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="recentActivities.length > 0" class="activity-timeline">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                <i :class="getActivityIcon(activity.type)"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-time">{{ formatDateTime(activity.created_at) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <i class="fas fa-history fa-3x text-muted mb-3"></i>
            <p class="text-muted">No recent activity found</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: 'brand'
})

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Reactive data
const brandInfo = ref({
  name: '',
  description: '',
  logo_url: '',
  is_active: true,
  email: '',
  phone: '',
  website: '',
  created_at: '',
  updated_at: ''
});

const brandStats = ref({
  total_videos: 0,
  active_slots: 0,
  total_plays: 0,
  total_spend: 0
});

const recentActivities = ref([]);

// Navigation function
const navigateTo = (path) => {
  router.push(path);
};

// Fetch brand information
const fetchBrandInfo = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/profile`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      brandInfo.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching brand info:', error);
    $toast.error('Failed to fetch brand information', { duration: 5000, position: 'top-right' });
  }
};

// Fetch brand statistics
const fetchBrandStats = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/stats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      brandStats.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching brand stats:', error);
  }
};

// Fetch recent activities
const fetchRecentActivities = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/activities?limit=5`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      recentActivities.value = data.data || [];
    }
  } catch (error) {
    console.error('Error fetching recent activities:', error);
  }
};

// Utility functions
const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rp${Math.round(numAmount).toLocaleString('id-ID')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const getActiveClass = (isActive) => {
  return isActive ? 'badge-success' : 'badge-danger';
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'video_uploaded': return 'fas fa-video';
    case 'slot_booked': return 'fas fa-clock';
    case 'payment_made': return 'fas fa-dollar-sign';
    case 'video_approved': return 'fas fa-check-circle';
    case 'video_rejected': return 'fas fa-times-circle';
    default: return 'fas fa-info-circle';
  }
};

const getActivityIconClass = (type) => {
  switch (type) {
    case 'video_uploaded': return 'bg-primary';
    case 'slot_booked': return 'bg-warning';
    case 'payment_made': return 'bg-success';
    case 'video_approved': return 'bg-success';
    case 'video_rejected': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchBrandInfo(),
    fetchBrandStats(),
    fetchRecentActivities()
  ]);
});
</script>

<style scoped>
.brand-logo-container {
  margin-bottom: 20px;
}

.brand-logo {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  object-fit: cover;
}

.activity-timeline {
  position: relative;
  padding-left: 30px;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.activity-item {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
}

.activity-icon {
  position: absolute;
  left: -22px;
  top: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.activity-description {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.activity-time {
  color: #6c757d;
  font-size: 0.75rem;
}

.bg-primary { background-color: #007bff; }
.bg-success { background-color: #28a745; }
.bg-warning { background-color: #ffc107; }
.bg-danger { background-color: #dc3545; }
.bg-info { background-color: #17a2b8; }
.bg-secondary { background-color: #6c757d; }

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-success { background-color: #28a745; }
.badge-danger { background-color: #dc3545; }

.form-control-plaintext {
  padding: 0.375rem 0;
  border: none;
  background: transparent;
  color: #495057;
}
</style>
