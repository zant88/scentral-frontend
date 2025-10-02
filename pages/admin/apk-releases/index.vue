<template>
  <section class="section">
    <div  class="section-header"><h1>Apk Release Manager</h1></div>

    <div class="section-body mt-4">
      <div class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <!-- <h3 class="card-title">APK Releases</h3> -->
            <div class="d-flex align-items-center">
              <div class="input-group">
                <input type="text" v-model="searchQuery" class="form-control" placeholder="Search by app name, version name, or version code...">
                <div class="input-group-append">
                  <button class="btn btn-primary" type="button" @click="searchAPKReleases">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <NuxtLink to="/admin/apk-releases/create" class="btn btn-primary">
                <i class="fas fa-plus mr-2"></i> Add APK
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-2">Loading APK releases...</p>
          </div>
          <div v-else-if="apkReleases.length === 0" class="text-center py-5">
            <i class="fas fa-mobile-alt fa-3x text-muted mb-3"></i>
            <h5>No APK releases found</h5>
            <p class="text-muted">Upload your first APK release to get started.</p>
            <NuxtLink to="/admin/apk-releases/create" class="btn btn-primary">
              <i class="fas fa-plus mr-2"></i> Upload APK
            </NuxtLink>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>App Name</th>
                  <th>Version</th>
                  <th>File Size</th>
                  <th>Status</th>
                  <th>Uploaded By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="apk in apkReleases" :key="apk.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="fas fa-mobile-alt fa-2x text-primary mr-3"></i>
                      <div>
                        <div class="font-weight-bold">{{ apk.app_name }}</div>
                        <div class="text-muted small">{{ apk.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="font-weight-bold">{{ apk.version_name }}</div>
                    <div class="text-muted small">Code: {{ apk.version_code }}</div>
                  </td>
                  <td>{{ formatFileSize(apk.file_size_bytes) }}</td>
                  <td>
                    <span v-if="apk.is_latest" class="badge badge-success">Latest</span>
                    <span v-if="apk.is_deprecated" class="badge badge-danger">Deprecated</span>
                    <span v-if="!apk.is_latest && !apk.is_deprecated" class="badge badge-secondary">Old Version</span>
                  </td>
                  <td>{{ apk.uploaded_by_user_id }}</td>
                  <td>{{ formatDate(apk.created_at) }}</td>
                  <td>
                    <div class="btn-group">
                      <NuxtLink :to="`/admin/apk-releases/update/${apk.id}`" class="btn btn-sm btn-info">
                        <i class="fas fa-edit"></i>
                      </NuxtLink>
                      <a :href="apk.download_url" class="btn btn-sm btn-primary" target="_blank">
                        <i class="fas fa-download"></i>
                      </a>
                      <button @click="confirmDelete(apk)" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this APK release?</p>
            <p class="font-weight-bold">{{ selectedAPK?.app_name }} - {{ selectedAPK?.version_name }}</p>
            <p class="text-danger">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteAPK">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const apkReleases = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedAPK = ref(null);

onMounted(async () => {
  await loadAPKReleases();
});

async function loadAPKReleases() {
  loading.value = true;
  try {
    let url = `${apiUrl}/api/apk-release`;
    if (searchQuery.value) {
      url += `?app_name=${encodeURIComponent(searchQuery.value)}&version_name=${encodeURIComponent(searchQuery.value)}&version_code=${encodeURIComponent(searchQuery.value)}`;
    }
    
    const response = await fetchWithAuth(url);
    const data = await response.json();
    
    if (response.ok && data.success) {
      apkReleases.value = data.data;
    } else {
      console.error('Failed to load APK releases:', data.message);
      apkReleases.value = [];
    }
  } catch (error) {
    console.error('Error loading APK releases:', error);
    apkReleases.value = [];
  } finally {
    loading.value = false;
  }
}

async function searchAPKReleases() {
  await loadAPKReleases();
}

function confirmDelete(apk) {
  selectedAPK.value = apk;
  $('#deleteModal').modal('show');
}

async function deleteAPK() {
  if (!selectedAPK.value) return;
  
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/apk-release/${selectedAPK.value.id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Close modal
      $('#deleteModal').modal('hide');
      
      // Reload list
      await loadAPKReleases();
      
      // Show success message
      showNotification('success', 'APK release deleted successfully');
    } else {
      showNotification('error', data.message || 'Failed to delete APK release');
    }
  } catch (error) {
    console.error('Error deleting APK release:', error);
    showNotification('error', 'An error occurred while deleting the APK release');
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showNotification(type, message) {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '9999';
  notification.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
</script>