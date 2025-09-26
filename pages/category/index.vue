<template>
  <section class="section">
    <div class="section-header">
      <h1>Category</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">Category</h2>
      <p class="section-lead">
        Daftar kategori yang terdaftar di sistem.
      </p>
      <div class="card" v-if="!isCreateUpdate">
        <div class="card-header actionable">
          <client-only>
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteItem" v-if="anyChecked" data-toggle="tooltip"
                title="Delete Selected"><i class="fa fa-trash"></i></a>
              <a href="/category/create"  class="btn btn-icon btn-primary note-btn" data-toggle="tooltip"
                title="Add New"><i class="fas fa-plus"></i></a>
            </div>
          </client-only>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="getCategoryList"  class="form-control" placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th class="number-cell" scope="col">#</th>
                <th style="width: 150px;" scope="col">Name</th>
                <th style="width: calc(100% - 250px);"scope="col">Description</th>
                <th scope="col">Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in categoryList" :key="item.id">
                <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="item.id" /></td>
                <td scope="row">{{ i + 1 }}</td>
                <td>
                  <a :href="`/category/update/${item.id}`" >{{ item.name }}</a>
                </td>
                <td>{{ item.description }}</td>
                <td>{{ item.is_active ? 'Yes' : 'No' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '~/utils/auth.js';

import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const checkedItems = ref([]);
const categoryList = ref([]);
const isCreateUpdate = ref(false);
const isEdited = ref(false);
const categoryName = ref('');
const categoryDescription = ref('');
const categoryActive = ref(true);
const categoryID = ref(null);
const $toast = useToast();
const querySearch = ref('');
const anyChecked = computed(() => checkedItems.value.length > 0);

const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = categoryList.value.map(c => c.id);
  } else {
    checkedItems.value = [];
  }
}

const getCategoryList = async () => {
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/category/`;
  if (querySearch.value) {
    url += `?q=${querySearch.value}`;
  }
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  categoryList.value = data.data || [];
}

onMounted(getCategoryList);

function showAdd() {
  clearForm();
  isCreateUpdate.value = true;
  isEdited.value = false;
}

function showEdit(item) {
  isCreateUpdate.value = true;
  isEdited.value = true;
  categoryID.value = item.id;
  categoryName.value = item.name;
  categoryDescription.value = item.description;
  categoryActive.value = item.is_active;
}

function closeAdd() {
  isCreateUpdate.value = false;
  isEdited.value = false;
}

const deleteItem = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteData();
    }
  })
}

const deleteData = async () => {
  let accessToken = localStorage.getItem('access_token');
  try {
    const strIDs = checkedItems.value.join(",");
    const response = await fetchWithAuth(`${apiUrl}/api/category/${strIDs}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    if (data.success) {
      $toast.success(data.message, { duration: 5000, position: 'top-right' });
      checkedItems.value = [];
      getCategoryList();
    }
  } catch (error) {
    $toast.error('Failed to delete category(s)', { duration: 5000, position: 'top-right' });
  }
}

const createData = async () => {
  let accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/category/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
      isCreateUpdate.value = false;
      getCategoryList();
    } else {
      $toast.error(data.message || 'Failed to create category', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to create category', { duration: 5000, position: 'top-right' });
  }
}

const updateData = async () => {
  try {
    let accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/category/${categoryID.value}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: categoryName.value,
        description: categoryDescription.value,
        is_active: categoryActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Category updated successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getCategoryList();
    } else {
      $toast.error(data.message || 'Failed to update category', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to update category', { duration: 5000, position: 'top-right' });
  }
}

const submitForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    if (isEdited.value) {
      updateData();
    } else {
      createData();
    }
  }
  form.classList.add('was-validated');
};

function clearForm() {
  categoryName.value = '';
  categoryDescription.value = '';
  categoryActive.value = true;
  categoryID.value = null;
}
</script>

<style scoped>
</style>