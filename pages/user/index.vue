<template>
  <section class="section">
    <div class="section-header">
      <h1>User</h1>
      
    </div>
    <div class="section-body">
      <h2 class="section-title">User</h2>
      <p class="section-lead">
        Daftar user yang terdaftar di sistem.
      </p>
      <div class="card" v-if="!isCreateUpdate">
        <div class="card-header actionable">
          <client-only>
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteItem" v-if="anyChecked" data-toggle="tooltip"
                title="Delete Selected"><i class="fa fa-trash"></i></a>
              <a href="/user/create" class="btn btn-icon btn-primary note-btn" data-toggle="tooltip"
                title="Add New"><i class="fas fa-plus"></i></a>
            </div>
          </client-only>
            <div class="right-action">
              <input type="search" v-model="querySearch" @keyup.enter="handleSearch"  class="form-control" placeholder="Type then press enter" />
            </div>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">
                  &nbsp;
                </th>
                <th class="number-cell" scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in userList" :key="item.ID">
                <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="item.id" /></td>
                <td scope="row">{{ (currentPage - 1) * perPage + i + 1 }}</td>
                <td>
                  <NuxtLink :to="`/user/update/${item.id}`" class="d-block">
                    {{ getDisplayNameWithLinks(item) }}
                  </NuxtLink>
                </td>
                <td>{{ item.email }}</td>
                <td>{{ item.phone }}</td>
              </tr>

            </tbody>
          </table>
          <ul class="pagination" v-if="pagination">
            <li class="page-item" :class="{ disabled: !pagination.has_prev }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page - 1)" aria-label="Previous">
                <span aria-hidden="true">«</span>
                <span class="sr-only">Previous</span>
              </a>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === pagination.current_page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: !pagination.has_next }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)" aria-label="Next">
                <span aria-hidden="true">»</span>
                <span class="sr-only">Next</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="isCreateUpdate" class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header actionable">
              <div class="left-action">
                <h4 v-if="!isEdited">Create User</h4>
                <h4 v-if="isEdited">Update User</h4>
              </div>
              <div class="right-action">
                <a href="#" class="btn btn-icon btn-outline-danger note-btn" @click="closeAdd" data-toggle="tooltip"
                  title="Add New"><i class="fas fa-times"></i></a>
              </div>
            </div>
            <div class="card-body">
              <form method="POST" @submit.prevent="submitForm" class="needs-validation">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="userName" class="form-label">Name</label>
                      <input type="text" class="form-control" id="userName" tabindex="1" v-model="userName" required>
                      <div class="invalid-feedback">
                        Please fill in your name!
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="userEmail" class="form-label">Email</label>
                      <input type="email" class="form-control" id="userEmail" tabindex="2" v-model="userEmail" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="userPhone" class="form-label">Phone</label>
                      <input type="text" class="form-control" id="userPhone" tabindex="3" v-model="userPhone" required>
                    </div>
                  </div>
                  <div v-if="isEdited" class="col-md-12">
                    <div class="mb-3">
                      <input type="checkbox" @change="toggleIsChangePassword" /> Edit Password
                    </div>
                  </div>
                  <div v-if="!isEdited || isChangePassword" class="col-md-6">
                    <div class="mb-3">
                      <label for="userPassword" class="form-label">Password</label>
                      <input type="password" class="form-control" id="userPassword" tabindex="4" v-model="userPassword" required>
                    </div>
                  </div>
                  <div v-if="!isEdited || isChangePassword" class="col-md-6">
                    <div class="mb-3">
                      <label for="userRePassword" class="form-label">Re-Password</label>
                      <input type="password" class="form-control" id="userRePassword" tabindex="5" v-model="userRePassword" required>
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
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { fetchWithAuth } from '~/utils/auth.js';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const checkedItems = ref([]);
const userList = ref([]);
const pagination = ref(null);
const isCreateUpdate = ref(false);
const isEdited = ref(false);
const isChangePassword = ref(false);
const userName = ref('');
const userEmail = ref('');
const userPhone = ref('');
const userPassword = ref('');
const userRePassword = ref('');
const userID = ref(null);
const $toast = useToast();
const querySearch = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const anyChecked = computed(() => checkedItems.value.length > 0);

const visiblePages = computed(() => {
  if (!pagination.value) return [];
  
  const current = pagination.value.current_page;
  const total = pagination.value.total_pages;
  const delta = 2; // Number of pages to show before and after current page
  
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  });

  return rangeWithDots;
});
const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = Array.from({ length: 100 }, (_, i) => i + 1);
  } else {
    checkedItems.value = [];
  }
}

const toggleIsChangePassword = (e) => {
  if (e.target.checked) {
    isChangePassword.value = true;
  }else {
    isChangePassword.value = false;x
  }
}

const getNewToken = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${apiUrl}/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        refresh_token: localStorage.getItem('refresh_token')
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    localStorage.setItem('access_token', data.access_token);
  } catch (error) {
    console.log('this is executed')
    console.log(error);
  }
}


const getUserList = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: perPage.value.toString(),
    });
    
    if (querySearch.value != '') {
      params.append('q', querySearch.value);
    }
    
    const url = `${apiUrl}/api/user/?${params.toString()}`;
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(response.status);
    }
    userList.value = data.data;
    pagination.value = data.meta.pagination;
  } catch (error) {
    $toast.error('You are not authorized to access this page!', {
      duration: 5000,
      position: 'top-right'
    });
  }
}

const changePage = (page) => {
  if (page === '...' || !pagination.value) return;
  
  if (page >= 1 && page <= pagination.value.total_pages) {
    currentPage.value = page;
    getUserList();
  }
}

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page when searching
  getUserList();
}

const getUser = async (id) => {
  const accessToken = localStorage.getItem('access_token');
  userID.value = id;
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(response.status);
    }
    userName.value = data.data.user.name;
    userEmail.value = data.data.user.email;
    userPhone.value = data.data.user.phone;
  } catch (error) {
    $toast.error('Error getting user data!', {
      duration: 5000,
      position: 'top-right'
    });
  }
}

onMounted(async () => {
  getUserList();

});

function showAdd() {
  clearForm();
  isCreateUpdate.value = true;
}

function showEdit(id) {
  isCreateUpdate.value = true;
  isEdited.value = true;
  console.log(id);
  getUser(id);
}

function closeAdd() {
  isCreateUpdate.value = false;
  isEdited.value = false;
}

function deleteItem() {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    // confirmButtonColor: '#3085d6',
    // cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteData();
    }
  })
}

const deleteData = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const strIDs = checkedItems.value.join(",");
    console.log(strIDs);
    const response = await fetchWithAuth(`${apiUrl}/api/user/${strIDs}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (data.meta.success) {
      let instance = $toast.success(data.meta.message, {
        duration: 5000,
        position: 'top-right'
      })
      checkedItems.value = [];
      getUserList();
    }
  }catch {
    $toast.error('Error deleting the data!', {
      duration: 5000,
      position: 'top-right'
    });
  }
}
const createData = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch(`${apiUrl}/api/user/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        full_name: userName.value,
        email: userEmail.value,
        phone: userPhone.value, 
        password: userPassword.value
      })
    });
    const data = await response.json();
    if (!response.ok) {
      let instance = $toast.error(data.meta.message, {
        duration: 5000,
        position: 'top-right'
      })
      throw new Error(response.statusText);
    }

    if (data.meta.success) {
      let instance = $toast.success(data.meta.message, {
        duration: 5000,
        position: 'top-right'
      })
      isCreateUpdate.value = false;
      getUserList();
    }
  }catch (error) {
    $toast.error('Error creating the data!', {
      duration: 5000,
      position: 'top-right'
    });
  }
}

const updateData = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch(`${apiUrl}/api/user/${userID.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        full_name: userName.value,
        email: userEmail.value,
        phone: userPhone.value, 
        password: userPassword.value
      })
    });
    const data = await response.json();
    if (!response.ok) {
      let instance = $toast.error(data.meta.message, {
        duration: 5000,
        position: 'top-right'
      })
      throw new Error(response.statusText);
    }

    if (data.meta.success) {
      let instance = $toast.success(data.meta.message, {
        duration: 5000,
        position: 'top-right'
      })
      isCreateUpdate.value = false;
      getUserList();
    }
  }catch (error) {
    $toast.error('Error updating the data!', {
      duration: 5000,
      position: 'top-right'
    });
  }
}

const submitForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    if (isEdited.value) {
      console.log('edited');
      if (isChangePassword.value) {
        if (userPassword.value !== userRePassword.value) {
          let instance = $toast.error('Password and Re-Password did not match!', {
            duration: 5000,
            position: 'top-right'
          })
        }else {
          updateData();
        }
      }else {
        console.log('not change password');
        updateData();
      }
    }else {
      if (userPassword.value !== userRePassword.value) {
        let instance = $toast.error('Password and Re-Password did not match!', {
          duration: 5000,
          position: 'top-right'
        })
      }else {
        createData();
      }
    }
    
  }
  form.classList.add('was-validated');
};

function clearForm() {
  userName.value = '';
  userEmail.value = '';
  userPhone.value = '';
  userPassword.value = '';
  userRePassword.value = '';
};

function getDisplayName(item) {
  // Check if full_name exists and is not empty
  if (item.full_name && item.full_name.trim() !== '') {
    return item.full_name;
  }
  
  // Check if username exists and is not empty
  if (item.username && item.username.trim() !== '') {
    return item.username;
  }
  
  // Fallback to email if available
  if (item.email && item.email.trim() !== '') {
    return item.email;
  }
  
  // Final fallback to phone if available
  if (item.phone && item.phone.trim() !== '') {
    return item.phone;
  }
  
  // If nothing is available, show placeholder
  return 'No Name';
}

function getDisplayNameWithLinks(item) {
  // Check if full_name exists and is not empty
  if (item.full_name && item.full_name.trim() !== '') {
    return item.full_name;
  }
  
  // If name is blank, use email (display only, not clickable)
  if (item.email && item.email.trim() !== '') {
    return item.email;
  }
  
  // If email is also blank, use phone number (display only, not clickable)
  if (item.phone && item.phone.trim() !== '') {
    return item.phone;
  }
  
  // If nothing is available, show placeholder
  return 'No Name';
}

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
</script>
