<template>
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
          <label for="productSKU" class="form-label">SKU</label>
          <input type="text" class="form-control" id="productSKU" v-model="productSKU" required>
        </div>
        <div class="mb-3">
          <label for="productBarcode" class="form-label">Barcode</label>
          <input type="text" class="form-control" id="productBarcode" v-model="productBarcode" required>
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
          <label for="productImage" class="form-label">Image (max 512x512px)</label>
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
</template>

<script setup>
// This is a shared form component for product create/update
// Props and emits should be defined in the parent page
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
