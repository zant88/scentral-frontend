<template>
  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <h4>Update Brand</h4>
          </div>
          <div class="right-action">
            <a href="#" class="btn btn-icon btn-outline-danger note-btn" @click="closeEdit"><i class="fas fa-times"></i></a>
          </div>
        </div>
        <div class="card-body">
          <form method="POST" @submit.prevent="submitForm" class="needs-validation">
            <div class="row">
              <div class="row col-md-6">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label for="brandName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="brandName" tabindex="1" v-model="brandName" required>
                    <div class="invalid-feedback">
                      Please fill in the brand name!
                    </div>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label for="brandDescription" class="form-label">Description</label>
                    <textarea  class="form-control" id="brandDescription" tabindex="2"  v-model="brandDescription"></textarea>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label for="brandActive" class="form-label">Active</label>
                    <input type="checkbox" id="brandActive" v-model="brandActive">
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="brandLogo" class="form-label">Logo (max 512x512px)</label>
                  <div
                    class="drop-area"
                    :class="{ 'drag-over': isDragOver }"
                    @dragover.prevent="onDragOver"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onDrop"
                  >
                    <div v-if="!logoPreview" class="drop-text">
                      <i class="fas fa-cloud-upload-alt fa-2x mb-2"></i><br>
                      <div>Drag & drop image here, or click to select</div>
                      <input type="file" class="d-none" ref="fileInput" accept="image/*" @change="onLogoChange">
                      <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="triggerFileInput">Choose File</button>
                    </div>
                    <div v-else class="drop-preview">
                      <img :src="logoPreview" alt="Logo Preview" style="max-width:128px;max-height:128px;border:1px solid #eee;" />
                      <button type="button" class="btn btn-outline-danger btn-sm mt-2" @click="removeLogo">Remove</button>
                    </div>
                  </div>
                  <div v-if="logoError" class="text-danger mt-1">{{ logoError }}</div>
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
import { fetchWithAuth } from '~/utils/auth.js';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const route = useRoute();
const router = useRouter();
const $toast = useToast();

const brandName = ref('');
const brandDescription = ref('');
const brandActive = ref(true);
const logoFile = ref(null);
const logoPreview = ref('');
const logoError = ref('');
const isDragOver = ref(false);
const fileInput = ref(null);
const currentLogoUrl = ref('');

const triggerFileInput = () => { fileInput.value.click(); };
const onDragOver = () => { isDragOver.value = true; };
const onDragLeave = () => { isDragOver.value = false; };
const onDrop = (e) => {
  isDragOver.value = false;
  const file = e.dataTransfer.files[0];
  handleLogoFile(file);
};
const onLogoChange = (e) => {
  const file = e.target.files[0];
  handleLogoFile(file);
};
const handleLogoFile = (file) => {
  logoError.value = '';
  if (!file) return;
  const img = new window.Image();
  const reader = new FileReader();
  reader.onload = (ev) => {
    img.onload = () => {
      if (img.width > 512 || img.height > 512) {
        logoError.value = 'Image must be max 512x512px.';
        logoFile.value = null;
        logoPreview.value = '';
      } else {
        logoFile.value = file;
        logoPreview.value = ev.target.result;
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};
const removeLogo = () => {
  logoFile.value = null;
  logoPreview.value = currentLogoUrl.value || '';
  logoError.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const fetchBrand = async () => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/brand/${route.params.id}`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch brand');
    const brand = data.data;
    brandName.value = brand.name;
    brandDescription.value = brand.description;
    brandActive.value = brand.is_active;
    if (brand.logo_url) {
      currentLogoUrl.value = brand.logo_url;
      logoPreview.value = brand.logo_url;
    }
  } catch (error) {
    $toast.error(error.message || 'Failed to fetch brand', { duration: 5000, position: 'top-right' });
    router.push('/brand');
  }
};

const submitForm = async () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    try {
      const formData = new FormData();
      formData.append('name', brandName.value);
      formData.append('description', brandDescription.value);
      formData.append('is_active', brandActive.value);
      if (logoFile.value) formData.append('logo', logoFile.value);
      const response = await fetchWithAuth(`${apiUrl}/api/brand/${route.params.id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        $toast.success('Brand updated successfully', { duration: 5000, position: 'top-right' });
        router.push('/brand');
      } else {
        $toast.error(data.message || 'Failed to update brand', { duration: 5000, position: 'top-right' });
      }
    } catch (error) {
      $toast.error('Failed to update brand', { duration: 5000, position: 'top-right' });
    }
  }
  form.classList.add('was-validated');
};

function closeEdit() {
   window.location.href = '/brand'
}

function closeAdd() { router.push('/brand'); }

onMounted(() => { fetchBrand(); });

definePageMeta({
  layout: 'default',
  middleware: 'brand'
});
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
.drop-preview img {
  display: block;
  margin: 0 auto 8px auto;
}
</style>