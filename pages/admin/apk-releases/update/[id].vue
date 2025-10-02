<template>
  <section class="section">
    <div class="section-header">
      <h1>Update APK Release</h1>
    </div>

    <div class="section-body mt-4">
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header actionable">
              <div class="left-action">&nbsp;</div>
              <div class="right-action">
                <NuxtLink to="/admin/apk-releases" class="btn btn-icon btn-outline-danger note-btn">
                  <i class="fas fa-times"></i>
                </NuxtLink>
              </div>
            </div>
            <div class="card-body">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-2">Loading APK release information...</p>
            </div>
            <div v-else-if="!apkRelease" class="text-center py-5">
              <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
              <h5>APK Release Not Found</h5>
              <p class="text-muted">The requested APK release could not be found.</p>
              <NuxtLink to="/admin/apk-releases" class="btn btn-primary">
                <i class="fas fa-arrow-left mr-2"></i> Back to APK Releases
              </NuxtLink>
            </div>
            <form v-else @submit.prevent="submitForm">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="app_name">App Name <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      id="app_name" 
                      v-model="form.app_name" 
                      class="form-control" 
                      :class="{ 'is-invalid': errors.app_name }"
                      placeholder="e.g., Scentral App"
                      required
                    >
                    <div v-if="errors.app_name" class="invalid-feedback">
                      {{ errors.app_name }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="version_code">Version Code <span class="text-danger">*</span></label>
                    <input 
                      type="number" 
                      id="version_code" 
                      v-model="form.version_code" 
                      class="form-control" 
                      :class="{ 'is-invalid': errors.version_code }"
                      placeholder="e.g., 1"
                      required
                    >
                    <div v-if="errors.version_code" class="invalid-feedback">
                      {{ errors.version_code }}
                    </div>
                    <small class="form-text text-muted">Internal version number (integer)</small>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="version_name">Version Name <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      id="version_name" 
                      v-model="form.version_name" 
                      class="form-control" 
                      :class="{ 'is-invalid': errors.version_name }"
                      placeholder="e.g., 1.0.0"
                      required
                    >
                    <div v-if="errors.version_name" class="invalid-feedback">
                      {{ errors.version_name }}
                    </div>
                    <small class="form-text text-muted">User-friendly version name (e.g., 1.0.0)</small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="is_latest">Mark as Latest Version</label>
                    <select id="is_latest" v-model="form.is_latest" class="form-control">
                      <option :value="true">Yes - This is the latest version</option>
                      <option :value="false">No - This is not the latest version</option>
                    </select>
                    <small class="form-text text-muted">If marked as latest, all previous versions of the same app will be marked as not latest</small>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="is_deprecated">Mark as Deprecated</label>
                    <select id="is_deprecated" v-model="form.is_deprecated" class="form-control">
                      <option :value="true">Yes - This version is deprecated</option>
                      <option :value="false">No - This version is not deprecated</option>
                    </select>
                    <small class="form-text text-muted">Mark this version as deprecated if it should no longer be used</small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Current APK File</label>
                    <div class="form-control-plaintext">
                      <a :href="apkRelease.download_url" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-download mr-1"></i> Download APK
                      </a>
                      <span class="ml-2">{{ formatFileSize(apkRelease.file_size_bytes) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="release_notes">Release Notes</label>
                <textarea 
                  id="release_notes" 
                  v-model="form.release_notes" 
                  class="form-control" 
                  rows="4"
                  placeholder="Describe what's new in this version..."
                ></textarea>
              </div>

              <div class="form-group">
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  <i v-else class="fas fa-upload mr-2"></i>
                  {{ submitting ? 'Updating...' : 'Update APK Release' }}
                </button>
                <NuxtLink to="/admin/apk-releases" class="btn btn-secondary ml-2">Cancel</NuxtLink>
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
import { ref, reactive, onMounted } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;

const form = reactive({
  app_name: '',
  version_code: '',
  version_name: '',
  release_notes: '',
  is_latest: false,
  is_deprecated: false
});

const errors = reactive({
  app_name: '',
  version_code: '',
  version_name: ''
});

const apkRelease = ref(null);
const loading = ref(true);
const submitting = ref(false);

onMounted(async () => {
  await loadAPKRelease();
});

async function loadAPKRelease() {
  loading.value = true;
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/apk-release/${route.params.id}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      apkRelease.value = data.data;
      
      // Populate form with existing data
      form.app_name = apkRelease.value.app_name;
      form.version_code = apkRelease.value.version_code;
      form.version_name = apkRelease.value.version_name;
      form.release_notes = apkRelease.value.release_notes;
      form.is_latest = apkRelease.value.is_latest;
      form.is_deprecated = apkRelease.value.is_deprecated;
    } else {
      console.error('Failed to load APK release:', data.message);
      apkRelease.value = null;
    }
  } catch (error) {
    console.error('Error loading APK release:', error);
    apkRelease.value = null;
  } finally {
    loading.value = false;
  }
}

function validateForm() {
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // Validate app name
  if (!form.app_name.trim()) {
    errors.app_name = 'App name is required';
    isValid = false;
  }
  
  // Validate version code
  if (!form.version_code) {
    errors.version_code = 'Version code is required';
    isValid = false;
  } else if (isNaN(parseInt(form.version_code)) || parseInt(form.version_code) <= 0) {
    errors.version_code = 'Version code must be a positive integer';
    isValid = false;
  }
  
  // Validate version name
  if (!form.version_name.trim()) {
    errors.version_name = 'Version name is required';
    isValid = false;
  }
  
  return isValid;
}

async function submitForm() {
  if (!validateForm()) {
    return;
  }
  
  submitting.value = true;
  
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/apk-release/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_name: form.app_name,
        version_code: parseInt(form.version_code),
        version_name: form.version_name,
        release_notes: form.release_notes,
        is_latest: form.is_latest,
        is_deprecated: form.is_deprecated
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification('success', 'APK release updated successfully');
      router.push('/admin/apk-releases');
    } else {
      showNotification('error', data.message || 'Failed to update APK release');
    }
  } catch (error) {
    console.error('Error updating APK release:', error);
    showNotification('error', 'An error occurred while updating the APK release');
  } finally {
    submitting.value = false;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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