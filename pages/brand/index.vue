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
            <div class="filter-controls">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input type="search" v-model="filters.q" @keyup.enter="applyFilters" class="form-control search-input" placeholder="Search brands..." />
              </div>
              <div class="filters-wrapper">
                <select v-model="filters.is_active" @change="applyFilters" class="form-control filter-select">
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <select v-model="filters.sort" @change="applyFilters" class="form-control filter-select">
                  <option value="name">Name</option>
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="balance">Balance</option>
                  <option value="is_active">Status</option>
                </select>
                <button class="btn btn-light sort-btn" @click="toggleOrder" :title="filters.order === 'asc' ? 'Ascending' : 'Descending'">
                  <i class="fas" :class="filters.order === 'asc' ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
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
                <tr v-if="loading">
                  <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                    Loading...
                  </td>
                </tr>
                <tr v-else-if="brandList.length === 0">
                  <td colspan="7" class="text-center text-muted">
                    No brands found
                  </td>
                </tr>
                <tr v-else v-for="(item, i) in brandList" :key="item.id">
                  <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="item.id" /></td>
                  <td scope="row">{{ ((pagination.page - 1) * pagination.limit) + i + 1 }}</td>
                  <td class="image-container">
                    <img :src="item.logo_url" class="logo" />
                    <NuxtLink :to="`/brand/update/${item.id}`" class="d-block">
                      {{ item.name }}
                    </NuxtLink>
                  </td>
                  <td>{{ item.description }}</td>
                  <td class="balance-cell">{{ item.balance || 0 }}</td>
                  <td>{{ item.is_active ? 'Yes' : 'No' }}</td>
                  <td class="actions-cell">
                    <button @click="showTopUp(item)" class="btn btn-sm btn-success" title="Top Up Balance">
                      <i class="fas fa-plus"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-3" v-if="pagination.total">
            <div class="text-muted">
              Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of {{ pagination.total }} entries
            </div>
            <ul class="pagination mb-0" v-if="pagination.pages > 1">
              <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(pagination.page - 1)" aria-label="Previous">
                  <span aria-hidden="true">«</span>
                  <span class="sr-only">Previous</span>
                </a>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === pagination.page }">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.page >= pagination.pages }">
                <a class="page-link" href="#" @click.prevent="changePage(pagination.page + 1)" aria-label="Next">
                  <span aria-hidden="true">»</span>
                  <span class="sr-only">Next</span>
                </a>
              </li>
            </ul>
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
  <!-- Top Up Balance Modal -->
  <div v-if="isTopUpModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeTopUp">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Top Up Credit - {{ topUpBrandName }}</h5>
          <button type="button" class="btn-close" @click="closeTopUp"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitTopUp" class="needs-validation" novalidate>
            <div class="row">
              <div class="col-12 mb-3">
                <label class="form-label">Current Credit</label>
                <div class="form-control-plaintext">{{ formatNumber(currentBalance) }}</div>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label">Top Up Amount *</label>
                <div class="input-group">
                  
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
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary mr-2" @click="closeTopUp">Cancel</button>
              <button type="submit" class="btn btn-success">Top Up Balance</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
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
const { $mqtt } = useNuxtApp();

// Debug MQTT client availability
console.log('MQTT client in brand page:', $mqtt);
console.log('MQTT client publish method:', $mqtt?.publish);
console.log('MQTT client connected status:', $mqtt?.connected);
const checkedItems = ref([]);
const brandList = ref([]);
const isCreateUpdate = ref(false);
const isEdited = ref(false);
const brandName = ref('');
const brandDescription = ref('');
const brandActive = ref(true);
const brandID = ref(null);
const $toast = useToast();
const loading = ref(false);
const filters = ref({
  q: '',
  sort: 'name',
  order: 'asc',
  is_active: '',
  page: 1,
  limit: 20
});
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
  from: 0,
  to: 0
});
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

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
};

const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = brandList.value.map(b => b.id);
  } else {
    checkedItems.value = [];
  }
}

const getBrandList = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.keys(filters.value).forEach(key => {
      if (filters.value[key] !== '' && filters.value[key] !== null) {
        params.append(key, filters.value[key]);
      }
    });

    const response = await fetchWithAuth(`${apiUrl}/api/brand/?${params.toString()}`);
    const data = await response.json();
    
    if (data.success) {
      brandList.value = data.data;
      pagination.value = {
        ...pagination.value,
        ...data.meta,
        from: ((data.meta.page - 1) * data.meta.limit) + 1,
        to: Math.min(data.meta.page * data.meta.limit, data.meta.total)
      };
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
    if (window.$toast) {
      window.$toast.error('Failed to fetch brands data');
    }
  } finally {
    loading.value = false;
  }
}

const applyFilters = () => {
  filters.value.page = 1;
  getBrandList();
}

const toggleOrder = () => {
  filters.value.order = filters.value.order === 'asc' ? 'desc' : 'asc';
  applyFilters();
}

const changePage = (page) => {
  if (page === '...' || !pagination.value) return;
  
  if (page >= 1 && page <= pagination.value.pages) {
    filters.value.page = page;
    getBrandList();
  }
}

// Computed property for visible pages
const visiblePages = computed(() => {
  if (!pagination.value || pagination.value.pages <= 1) return [];
  
  const current = pagination.value.page;
  const total = pagination.value.pages;
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
    console.log('Top-up response data:', data);
    if (data.success) {
      // Publish MQTT message for credit update
      try {
        console.log('Attempting to publish MQTT message...')
        console.log('MQTT object available:', !!$mqtt)
        
        // Check if MQTT client has the required methods
        const canPublish = $mqtt && (
          ($mqtt.publish && typeof $mqtt.publish === 'function') ||
          ($mqtt.client && $mqtt.client.publish && typeof $mqtt.client.publish === 'function')
        )
        
        console.log('MQTT can publish:', canPublish)
        console.log('MQTT client connected:', $mqtt?.connected)
        console.log('MQTT client connected (direct):', $mqtt?.client?.connected)
        
        if (canPublish) {
          const mqttMessage = {
            brand_id: topUpBrandID.value,
            brand_name: topUpBrandName.value,
            amount_added: parseFloat(topUpAmount.value),
            new_balance: data.new_balance,
            previous_balance: currentBalance.value,
            timestamp: new Date().toISOString()
          }
          
          console.log('Publishing MQTT message:', mqttMessage)
          
          // Try enhanced client publish first, then direct client publish
          if ($mqtt.publish && typeof $mqtt.publish === 'function') {
            $mqtt.publish('scentral/ads/credit/update', mqttMessage)
            console.log('MQTT message published via enhanced client')
          } else if ($mqtt.client && $mqtt.client.publish && typeof $mqtt.client.publish === 'function') {
            $mqtt.client.publish('scentral/ads/credit/update', JSON.stringify(mqttMessage))
            console.log('MQTT message published via direct client')
          } else {
            console.warn('No suitable MQTT publish method found')
          }
        } else {
          console.warn('MQTT client not ready for publishing')
        }
      } catch (mqttError) {
        console.warn('Failed to publish MQTT message for credit update:', mqttError)
        console.warn('Error stack:', mqttError.stack)
      }
      
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

/* Pagination styles */
.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
  margin: 0;
}

.page-link {
  position: relative;
  display: block;
  padding: 0.5rem 0.75rem;
  margin-left: -1px;
  line-height: 1.25;
  color: #007bff;
  background-color: #fff;
  border: 1px solid #dee2e6;
  text-decoration: none;
}

.page-link:hover {
  z-index: 2;
  color: #0056b3;
  text-decoration: none;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  z-index: 3;
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-header-actionable {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.left-action, .right-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-responsive {
  min-height: 400px;
  overflow-x: auto;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.text-muted {
  color: #6c757d !important;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    height: auto;
  }
  
  .filters-wrapper {
    flex-wrap: wrap;
    height: auto;
  }
  
  .search-wrapper {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .card-header-actionable {
    flex-direction: column;
    align-items: stretch;
  }
  
  .left-action,
  .right-action {
    justify-content: center;
    width: 100%;
  }

  .search-input {
    width: 100%;
  }
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  height: 42px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.9rem;
  pointer-events: none;
  z-index: 5;
}

.search-input {
  padding-left: 40px;
  padding-right: 15px;
  border-radius: 25px;
  border: 1px solid #e4e6fc;
  background-color: #fff;
  transition: all 0.3s;
  height: 42px !important;
  line-height: 42px;
  width: 250px;
  font-size: 14px;
  box-shadow: none !important;
}

.search-input:focus {
  background-color: #fff;
  border-color: #6777ef;
  box-shadow: 0 0 0 2px rgba(103, 119, 239, 0.1) !important;
}

.filters-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
}

.filter-select {
  border-radius: 25px;
  border: 1px solid #e4e6fc;
  background-color: #fff;
  padding: 0 35px 0 15px;
  height: 42px !important;
  line-height: normal;
  cursor: pointer;
  min-width: 140px;
  font-size: 14px;
  box-shadow: none !important;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px 12px;
}

.filter-select:focus {
  border-color: #6777ef;
  box-shadow: 0 0 0 2px rgba(103, 119, 239, 0.1) !important;
}

.sort-btn {
  border-radius: 50%;
  width: 42px;
  height: 42px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e6fc;
  background-color: #fff;
  color: #6c757d;
  transition: all 0.3s;
  flex-shrink: 0;
  box-shadow: none !important;
}

.sort-btn:hover {
  background-color: #f8f9fa;
  color: #6777ef;
  border-color: #6777ef;
}

.sort-btn:focus {
  box-shadow: 0 0 0 2px rgba(103, 119, 239, 0.1) !important;
}
</style>
