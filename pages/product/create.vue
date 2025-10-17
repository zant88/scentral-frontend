<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { fetchWithAuth } from '~/utils/auth.js';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();
const productName = ref('');
const productBrand = ref('');
const productSKU = ref('');
const productBarcode = ref('');
const productDescription = ref('');
const productNote = ref('');
const productActive = ref(true);
const brandList = ref([]);
const categoryList = ref([]);
const productCategory = ref('');
const volume = ref('');
const imageFile = ref(null);
const imagePreview = ref('');
const imageError = ref('');
const isDragOver = ref(false);
const fileInput = ref(null);

const triggerFileInput = () => { fileInput.value.click(); };
const onDragOver = () => { isDragOver.value = true; };
const onDragLeave = () => { isDragOver.value = false; };
const onDrop = (e) => {
  isDragOver.value = false;
  const file = e.dataTransfer.files[0];
  handleImageFile(file);
};
const onImageChange = (e) => {
  const file = e.target.files[0];
  handleImageFile(file);
};
const handleImageFile = (file) => {
  imageError.value = '';
  if (!file) return;
  const img = new window.Image();
  const reader = new FileReader();
  reader.onload = (ev) => {
    img.onload = () => {
      if (img.width > 1920 || img.height > 1920) {
        imageError.value = 'Image must be max 1920x1920.';
        imageFile.value = null;
        imagePreview.value = '';
      } else {
        imageFile.value = file;
        imagePreview.value = ev.target.result;
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};
const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = '';
  imageError.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const fetchBrands = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      brandList.value = data.data;
    }
  } catch {}
};

const fetchCategories = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/category/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      categoryList.value = data.data;
    }
  } catch {}
};

const createData = async () => {
  try {
    const formData = new FormData();
    formData.append('name', productName.value);
    formData.append('brand_id', productBrand.value);
    formData.append('category_id', productCategory.value);
    formData.append('sku', productSKU.value);
    formData.append('barcode', productBarcode.value);
    formData.append('volume', volume.value);
    formData.append('description', productDescription.value);
    formData.append('note', productNote.value);
    formData.append('is_active', productActive.value);
    if (imageFile.value) {
      formData.append('image', imageFile.value);
    }
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/product/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Product created successfully', { duration: 5000, position: 'top-right' });
      navigateTo('/product');
    } else {
      $toast.error(data.message || 'Failed to create product', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to create product', { duration: 5000, position: 'top-right' });
  }
};

const submitForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    createData();
  }
  form.classList.add('was-validated');
};

onMounted(() => {
  fetchBrands();
  fetchCategories();
});
</script>

<template>
  <section class="section">
    <div class="section-header">
      <h1>Create Product</h1>
    </div>
    <div class="section-body">
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header actionable">
              <div class="left-action">
                <h4>Create Product</h4>
              </div>
              <div class="right-action">
                <NuxtLink to="/product" class="btn btn-icon btn-outline-danger note-btn" title="Cancel">
                  <i class="fas fa-times"></i>
                </NuxtLink>
              </div>
            </div>
            <div class="card-body">
              <form method="POST" @submit.prevent="submitForm" class="needs-validation">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="productName" class="form-label">Name</label>
                      <input type="text" class="form-control" id="productName" v-model="productName" required>
                      <div class="invalid-feedback">Please fill in the product name!</div>
                    </div>
                    <div class="mb-3">
                      <label for="productBrand" class="form-label">Brand</label>
                      <select class="form-control" id="productBrand" v-model="productBrand" required>
                        <option value="">Select Brand</option>
                        <option v-for="brand in brandList" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                      </select>
                    </div>
                    <div class="mb-3">
                      <label for="productCategory" class="form-label">Category</label>
                      <select class="form-control" id="productCategory" v-model="productCategory" required>
                        <option value="">Select Category</option>
                        <option v-for="category in categoryList" :key="category.id" :value="category.id">{{ category.name }}</option>
                      </select>
                    </div>
                    <div class="mb-3">
                      <label for="productSKU" class="form-label">SKU</label>
                      <input type="text" class="form-control" id="productSKU" v-model="productSKU" required>
                    </div>
                    <div class="mb-3">
                      <label for="productBarcode" class="form-label">Barcode</label>
                      <input type="text" class="form-control" id="productBarcode" v-model="productBarcode">
                    </div>
                    <div class="mb-3">
                      <label for="volume" class="form-label">Volume</label>
                      <input type="number" class="form-control" id="volume" v-model="volume">
                    </div>
                    <div class="mb-3">
                      <label for="productDescription" class="form-label">Description</label>
                      <textarea class="form-control" id="productDescription" v-model="productDescription"></textarea>
                    </div>
                    <div class="mb-3">
                      <label for="productNote" class="form-label">Note</label>
                      <textarea class="form-control" id="productNote" v-model="productNote"></textarea>
                    </div>
                    <div class="mb-3">
                      <label for="productActive" class="form-label">Active</label>
                      <input type="checkbox" id="productActive" v-model="productActive">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="productImage" class="form-label">Image (max 1920x1920px)</label>
                      <div
                        class="drop-area"
                        :class="{ 'drag-over': isDragOver }"
                        @dragover.prevent="onDragOver"
                        @dragleave.prevent="onDragLeave"
                        @drop.prevent="onDrop"
                      >
                        <div v-if="!imagePreview" class="drop-text">
                          <i class="fas fa-cloud-upload-alt fa-2x mb-2"></i><br>
                          <div>Drag & drop image here, or click to select</div>
                          <input type="file" class="d-none" ref="fileInput" accept="image/*" @change="onImageChange">
                          <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="triggerFileInput">Choose File</button>
                        </div>
                        <div v-else class="drop-preview">
                          <img :src="imagePreview" alt="Image Preview" style="max-width:128px;max-height:128px;border:1px solid #eee;" />
                          <button type="button" class="btn btn-outline-danger btn-sm mt-2" @click="removeImage">Remove</button>
                        </div>
                      </div>
                      <div v-if="imageError" class="text-danger mt-1">{{ imageError }}</div>
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
    </div>
  </section>
</template>

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
