<template>
  <section class="section">
    <div class="section-header">
      <h1>Create Category</h1>
    </div>
    <div class="section-body">
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header actionable">
              <div class="left-action">
                <h4>Create Category</h4>
              </div>
              <div class="right-action">
                <NuxtLink to="/category" class="btn btn-icon btn-outline-danger note-btn" data-toggle="tooltip" title="Cancel">
                  <i class="fas fa-times"></i>
                </NuxtLink>
              </div>
            </div>
            <div class="card-body">
              <form method="POST" @submit.prevent="submitForm" class="needs-validation">
                <div class="row">
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label for="categoryName" class="form-label">Name</label>
                      <input type="text" class="form-control" id="categoryName" tabindex="1" v-model="categoryName" required>
                      <div class="invalid-feedback">
                        Please fill in the category name!
                      </div>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label for="categoryDescription" class="form-label">Description</label>
                      <textarea  class="form-control" id="categoryDescription" tabindex="2"  v-model="categoryDescription"></textarea>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="mb-3">
                      <label for="categoryActive" class="form-label">Active</label>
                      <input type="checkbox" id="categoryActive" v-model="categoryActive">
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

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { fetchWithAuth } from '~/utils/auth.js';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();
const categoryName = ref('');
const categoryDescription = ref('');
const categoryActive = ref(true);

const createData = async () => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/category/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: categoryName.value,
        description: categoryDescription.value,
        is_active: categoryActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Category created successfully', { duration: 5000, position: 'top-right' });
      navigateTo('/category');
    } else {
      $toast.error(data.message || 'Failed to create category', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to create category', { duration: 5000, position: 'top-right' });
  }
}

const submitForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    createData();
  }
  form.classList.add('was-validated');
};
</script>

<style scoped>
</style>