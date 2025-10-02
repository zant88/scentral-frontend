<template>
  <section class="section">
    <div class="section-header">
      <h1>Upload New APK</h1>
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
              <form @submit.prevent="submitForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="app_name">App Name <span class="text-danger">*</span></label>
                      <input type="text" id="app_name" v-model="form.app_name" class="form-control"
                        :class="{ 'is-invalid': errors.app_name }" placeholder="e.g., Scentral App" required>
                      <div v-if="errors.app_name" class="invalid-feedback">
                        {{ errors.app_name }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="version_code">Version Code <span class="text-danger">*</span></label>
                      <input type="number" id="version_code" v-model="form.version_code" class="form-control"
                        :class="{ 'is-invalid': errors.version_code }" placeholder="e.g., 1" required>
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
                      <input type="text" id="version_name" v-model="form.version_name" class="form-control"
                        :class="{ 'is-invalid': errors.version_name }" placeholder="e.g., 1.0.0" required>
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
                      <small class="form-text text-muted">If marked as latest, all previous versions of the same app
                        will be marked as not latest</small>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="release_notes">Release Notes</label>
                  <textarea id="release_notes" v-model="form.release_notes" class="form-control" rows="4"
                    placeholder="Describe what's new in this version..."></textarea>
                </div>

                <div class="form-group">
                  <label for="apk_file">APK File <span class="text-danger">*</span></label>
                  <div class="custom-file">
                    <input type="file" id="apk_file" class="custom-file-input"
                      :class="{ 'is-invalid': errors.apk_file }" @change="handleFileChange" accept=".apk" required>
                    <label class="custom-file-label" for="apk_file">
                      {{ fileName || 'Choose file...' }}
                    </label>
                    <div v-if="errors.apk_file" class="invalid-feedback">
                      {{ errors.apk_file }}
                    </div>
                  </div>
                  <small class="form-text text-muted">Only .apk files are allowed</small>
                </div>

                <div class="form-group">
                  <button type="submit" class="btn btn-primary" :disabled="submitting">
                    <span v-if="submitting" class="spinner-border spinner-border-sm mr-2" role="status"
                      aria-hidden="true"></span>
                    <i v-else class="fas fa-upload mr-2"></i>
                    {{ submitting ? 'Uploading...' : 'Upload APK' }}
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
import { ref, reactive } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const router = useRouter();

const form = reactive({
  app_name: '',
  version_code: '',
  version_name: '',
  release_notes: '',
  is_latest: true,
  apk_file: null
});

const errors = reactive({
  app_name: '',
  version_code: '',
  version_name: '',
  apk_file: ''
});

const fileName = ref('');
const submitting = ref(false);

function handleFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.apk')) {
      errors.apk_file = 'Only .apk files are allowed';
      form.apk_file = null;
      fileName.value = '';
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      errors.apk_file = 'File size must be less than 100MB';
      form.apk_file = null;
      fileName.value = '';
      return;
    }

    errors.apk_file = '';
    form.apk_file = file;
    fileName.value = file.name;
  } else {
    form.apk_file = null;
    fileName.value = '';
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

  // Validate APK file
  if (!form.apk_file) {
    errors.apk_file = 'APK file is required';
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
    const formData = new FormData();
    formData.append('app_name', form.app_name);
    formData.append('version_code', form.version_code);
    formData.append('version_name', form.version_name);
    formData.append('release_notes', form.release_notes);
    formData.append('is_latest', form.is_latest);
    formData.append('apk_file', form.apk_file);

    const response = await fetchWithAuth(`${apiUrl}/api/apk-release`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showNotification('success', 'APK uploaded successfully');
      router.push('/admin/apk-releases');
    } else {
      showNotification('error', data.message || 'Failed to upload APK');
    }
  } catch (error) {
    console.error('Error uploading APK:', error);
    showNotification('error', 'An error occurred while uploading the APK');
  } finally {
    submitting.value = false;
  }
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