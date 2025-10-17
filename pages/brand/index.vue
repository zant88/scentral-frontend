<template>
  <section class="section">
    <div class="section-header">
      <h1>Brand</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">Brand</h2>
      <p class="section-lead">
        Daftar brand yang terdaftar di sistem.
      </p>
      <div class="card" v-if="!isCreateUpdate">
        <div class="card-header actionable">
          <client-only>
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteItem" v-if="anyChecked" data-toggle="tooltip"
                title="Delete Selected"><i class="fa fa-trash"></i></a>
              <a href="javascript:void(0)" @click="navigateTo('/brand/create')" class="btn btn-icon btn-primary note-btn" data-toggle="tooltip"
                title="Add New"><i class="fas fa-plus"></i></a>
            </div>
          </client-only>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="getBrandList"  class="form-control" placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th class="number-cell" scope="col">#</th>
                <th style="width: 150px;" scope="col">Name</th>
                <th style="width: calc(100% - 400px);" scope="col">Description</th>
                <th scope="col">Balance</th>
                <th scope="col">Active</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in brandList" :key="item.id">
                <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="item.id" /></td>
                <td scope="row">{{ i + 1 }}</td>
                <td class="image-container">
                  <img :src="item.logo_url" class="logo" />
                  <a href="#" @click="showEdit(item)" >{{ item.name }}</a>
                </td>
                <td>{{ item.description }}</td>
                <td class="balance-cell">{{ formatCurrency(item.balance || 0) }}</td>
                <td>{{ item.is_active ? 'Yes' : 'No' }}</td>
                <td class="actions-cell">
                  <button @click="showTopUp(item)" class="btn btn-sm btn-success" title="Top Up Balance">
                    <i class="fas fa-plus"></i> Top Up
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Up Balance Modal -->
      <div v-if="isTopUpModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeTopUp">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Top Up Balance - {{ topUpBrandName }}</h5>
              <button type="button" class="btn-close" @click="closeTopUp"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitTopUp" class="needs-validation" novalidate>
                <div class="row">
                  <div class="col-12 mb-3">
                    <label class="form-label">Current Balance</label>
                    <div class="form-control-plaintext">{{ formatCurrency(currentBalance) }}</div>
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label">Top Up Amount *</label>
                    <div class="input-group">
                      <span class="input-group-text">Rp</span>
                      <input 
                        type="text" 
                        v-model="topUpAmountFormatted" 
                        @input="handleAmountInput"
                        class="form-control" 
                        placeholder="Enter amount" 
                        required 
                      />
                    </div>
                    <div class="invalid-feedback">
                      Please enter a valid amount.
                    </div>
                  </div>
                  <div class="col-12 mb-3" v-if="topUpAmount">
                    <label class="form-label">New Balance (Preview)</label>
                    <div class="form-control-plaintext text-success font-weight-bold">
                      {{ formatCurrency(currentBalance + parseFloat(topUpAmount || 0)) }}
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeTopUp">Cancel</button>
                  <button type="submit" class="btn btn-success">Top Up Balance</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Update Form -->
      <div class="card" v-if="isCreateUpdate">
        <div class="card-header">
          <h4>{{ isEdited ? 'Edit' : 'Add' }} Brand</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitForm" class="needs-validation" novalidate>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Brand Name *</label>
                  <input type="text" v-model="brandName" class="form-control" required />
                  <div class="invalid-feedback">
                    Please provide a valid brand name.
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Active</label>
                  <select v-model="brandActive" class="form-control">
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label>Description</label>
                  <textarea v-model="brandDescription" class="form-control" rows="4"></textarea>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary">{{ isEdited ? 'Update' : 'Create' }}</button>
              <button type="button" @click="isCreateUpdate = false" class="btn btn-secondary ml-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: 'brand'
})

import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '~/utils/auth.js';

import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const checkedItems = ref([]);
const brandList = ref([]);
const isCreateUpdate = ref(false);
const isEdited = ref(false);
const brandName = ref('');
const brandDescription = ref('');
const brandActive = ref(true);
const brandID = ref(null);
const $toast = useToast();
const querySearch = ref('');
const anyChecked = computed(() => checkedItems.value.length > 0);

// Currency formatting function
const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rp${Math.round(numAmount).toLocaleString('id-ID')}`;
};

// Top-up related variables
const isTopUpModal = ref(false);
const topUpBrandID = ref(null);
const topUpBrandName = ref('');
const topUpAmount = ref('');
const topUpAmountFormatted = ref('');
const currentBalance = ref(0);

// Handle amount input formatting
const handleAmountInput = (event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  topUpAmount.value = value;
  topUpAmountFormatted.value = value ? parseInt(value).toLocaleString('id-ID') : '';
};

const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = brandList.value.map(b => b.id);
  } else {
    checkedItems.value = [];
  }
}

const getBrandList = async () => {
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/brand/`;
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
  brandList.value = data.data || [];
}

onMounted(getBrandList);

function showAdd() {
  clearForm();
  isCreateUpdate.value = true;
  isEdited.value = false;
}

function showEdit(item) {
  isCreateUpdate.value = true;
  isEdited.value = true;
  brandID.value = item.id;
  brandName.value = item.name;
  brandDescription.value = item.description;
  brandActive.value = item.is_active;
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
    const response = await fetchWithAuth(`${apiUrl}/api/brand/${strIDs}`, {
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
      getBrandList();
    }
  } catch (error) {
    $toast.error('Failed to delete brand(s)', { duration: 5000, position: 'top-right' });
  }
}

const createData = async () => {
  let accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/brand/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: brandName.value,
        description: brandDescription.value,
        is_active: brandActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Brand created successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getBrandList();
    } else {
      $toast.error(data.message || 'Failed to create brand', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to create brand', { duration: 5000, position: 'top-right' });
  }
}

const updateData = async () => {
  try {
    let accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/${brandID.value}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: brandName.value,
        description: brandDescription.value,
        is_active: brandActive.value
      })
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Brand updated successfully', { duration: 5000, position: 'top-right' });
      isCreateUpdate.value = false;
      getBrandList();
    } else {
      $toast.error(data.message || 'Failed to update brand', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to update brand', { duration: 5000, position: 'top-right' });
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
  brandName.value = '';
  brandDescription.value = '';
  brandActive.value = true;
  brandID.value = null;
}

function showTopUp(item) {
  isTopUpModal.value = true;
  topUpBrandID.value = item.id;
  topUpBrandName.value = item.name;
  currentBalance.value = item.balance || 0;
  topUpAmount.value = '';
  topUpAmountFormatted.value = '';
}

function closeTopUp() {
  isTopUpModal.value = false;
  topUpBrandID.value = null;
  topUpBrandName.value = '';
  topUpAmount.value = '';
  topUpAmountFormatted.value = '';
  currentBalance.value = 0;
}

const submitTopUp = async () => {
  if (!topUpAmount.value || parseFloat(topUpAmount.value) <= 0) {
    $toast.error('Please enter a valid amount', { duration: 5000, position: 'top-right' });
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/${topUpBrandID.value}/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: parseFloat(topUpAmount.value)
      })
    });
    
    const data = await response.json();
    if (data.success) {
      $toast.success(`Balance topped up successfully! New balance: ${formatCurrency(data.new_balance)}`, { duration: 5000, position: 'top-right' });
      closeTopUp();
      getBrandList(); // Refresh the list to show updated balance
    } else {
      $toast.error(data.message || 'Failed to top up balance', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to top up balance', { duration: 5000, position: 'top-right' });
  }
};
</script>

<style scoped>
.image-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: auto !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  /* width: 80px; */
}
.image-container .logo {
  height: 50px;
}
.image-container a {
  text-align: center;
}

.balance-cell {
  font-weight: bold;
  color: #28a745;
}

.actions-cell {
  text-align: center;
}

.modal {
  z-index: 1050;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 0.75;
}
</style>