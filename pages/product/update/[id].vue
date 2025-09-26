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
const productName = ref('');
const productBrand = ref('');
const productSKU = ref('');
const productBarcode = ref('');
const productDescription = ref('');
const productActive = ref(true);
const brandList = ref([]);
const categoryList = ref([]);
const productCategory = ref('');
const imageFile = ref(null);
const imagePreview = ref('');
const imageError = ref('');
const isDragOver = ref(false);
const fileInput = ref(null);
const currentImageUrl = ref('');
const productBackgroundColor = ref('');
const productVolume = ref(0);

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
        imageError.value = 'Image must be max 1920x1920px.';
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
  imagePreview.value =  '';
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

const fetchProduct = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/product/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch product');
    const product = data.data;
    productName.value = product.name;
    productBrand.value = product.brand_id;
    productCategory.value = product.category_id;
    productSKU.value = product.sku;
    productBarcode.value = product.barcode;
    productDescription.value = product.description;
    productActive.value = product.is_active;
    productVolume.value = product.volume;
    // Ensure the background color is in hex format (add # if missing)
    productBackgroundColor.value = product.background_color && !product.background_color.startsWith('#') 
      ? `#${product.background_color}` 
      : product.background_color || '#ffffff';
    if (product.image_url) {
      currentImageUrl.value = product.image_url;
      imagePreview.value = product.image_url;
    }
  } catch (error) {
    $toast.error(error.message || 'Failed to fetch product', { duration: 5000, position: 'top-right' });
  }
};

const updateData = async () => {
  try {
    const formData = new FormData();
    formData.append('name', productName.value);
    formData.append('brand_id', productBrand.value);
    formData.append('category_id', productCategory.value);
    formData.append('sku', productSKU.value);
    formData.append('barcode', productBarcode.value);
    formData.append('volume', productVolume.value);
    formData.append('background_color', productBackgroundColor.value);
    formData.append('description', productDescription.value);
    formData.append('is_active', productActive.value);
    if (imageFile.value) {
      formData.append('image', imageFile.value);
    }
    const accessToken = localStorage.getItem('access_token');
    // Append _method=PUT to the form data for servers that don't support PUT directly
    const response = await fetchWithAuth(`${apiUrl}/api/product/${route.params.id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type header when sending FormData, let the browser set it with the correct boundary
      },
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Product updated successfully', { duration: 5000, position: 'top-right' });
      router.push('/product');
    } else {
      $toast.error(data.message || 'Failed to update product', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to update product', { duration: 5000, position: 'top-right' });
  }
};

const submitForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    updateData();
  }
  form.classList.add('was-validated');
};

function closeEdit() { 
  window.location.href = '/product'
}

onMounted(() => {
  fetchBrands();
  fetchCategories();
  fetchProduct();
});
</script>

<template>
  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <h4>Update Product</h4>
          </div>
          <div class="right-action">
            <a href="#" class="btn btn-icon btn-outline-danger note-btn" @click="closeEdit"><i class="fas fa-times"></i></a>
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
                  <label for="productBackgroundColor" class="form-label">Background Color</label>
                  <input type="color" class="form-control" id="productBackgroundColor" v-model="productBackgroundColor" required>
                </div>
                <div class="mb-3">
                  <label for="productBarcode" class="form-label">Barcode</label>
                  <input type="text" class="form-control" id="productBarcode" v-model="productBarcode">
                </div>
                <div class="mb-3">
                  <label for="productVolume" class="form-label">Volume (ml)</label>
                  <input type="number" class="form-control" id="productVolume" v-model="productVolume">
                </div>
                <div class="mb-3">
                  <label for="productDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="productDescription" v-model="productDescription"></textarea>
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
