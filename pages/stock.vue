<template>
  <div class="section">
    <div class="section-header">
      <h1>Stock Management</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">Stock Management</h2>
      <p class="section-lead">Monitor product inventory across all devices</p>
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">&nbsp;</div>
          <div class="right-action">
            <input 
              type="search" 
              v-model="querySearch" 
              @input="debouncedSearch"
              class="form-control" 
              placeholder="Search devices, products, or SKU..." />
          </div>
        </div>
        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading stock data...</p>
          </div>
          <!-- Error State -->
          <div v-else-if="error" class="error-container">
            <div class="error-icon">⚠️</div>
            <p class="error-message">{{ error }}</p>
            <button @click="fetchStockData" class="retry-button">Retry</button>
          </div>

          <!-- Stock Table -->
          <div v-else class="stock-table-container">
            <div class="table-wrapper">
              <table class="stock-table">
                <thead>
                  <tr>
                    <th class="expand-column"></th>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Products</th>
                    <th>Total Stock</th>
                    <th>Low Stock Items</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(deviceGroup, index) in stockData" :key="deviceGroup.machine.id">
                    <!-- Device Row -->
                    <tr 
                      class="device-row" 
                      :class="{ 'expanded': expandedDevices.has(deviceGroup.machine.id) }"
                      @click="toggleDevice(deviceGroup.machine.id)"
                    >
                      <td class="expand-column">
                        <button class="expand-button" :class="{ 'expanded': expandedDevices.has(deviceGroup.machine.id) }">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="6,9 12,15 18,9"></polyline>
                          </svg>
                        </button>
                      </td>
                      <td class="device-info">
                        <div class="device-details">
                          <div class="device-name">{{ deviceGroup.machine.machine_code || deviceGroup.machine.code }}</div>
                          <div class="device-code">{{ deviceGroup.machine.code }}</div>
                        </div>
                      </td>
                      <td class="location">{{ deviceGroup.machine.position || 'Not specified' }}</td>
                      <td class="status">
                        <span class="status-badge" :class="getStatusClass(deviceGroup.machine.status)">
                          {{ deviceGroup.machine.status || 'Unknown' }}
                        </span>
                      </td>
                      <td class="product-count">{{ deviceGroup.products.length }}</td>
                      <td class="total-stock">{{ getTotalStock(deviceGroup.products) }}ml</td>
                      <td class="low-stock">
                        <span class="low-stock-count" :class="{ 'warning': getLowStockCount(deviceGroup.products) > 0 }">
                          {{ getLowStockCount(deviceGroup.products) }}
                        </span>
                      </td>
                    </tr>

                    <!-- Expanded Products Rows -->
                    <tr v-if="expandedDevices.has(deviceGroup.machine.id)" class="products-container">
                      <td colspan="7" class="products-cell">
                        <div class="products-grid">
                          <div 
                            v-for="product in deviceGroup.products" 
                            :key="product.id"
                            class="product-card"
                            :style="{ backgroundColor: product.background_color || product.product.background_color || '#f8f9fa' }"
                          >
                            <div class="product-header">
                              <div class="product-image">
                                <img 
                                  v-if="product.image_url" 
                                  :src="product.image_url" 
                                  :alt="product.product.name"
                                  class="product-img"
                                />
                                <div v-else class="product-placeholder">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21,15 16,10 5,21"></polyline>
                                  </svg>
                                </div>
                              </div>
                              <div class="product-info">
                                <h4 class="product-name">{{ product.product.name }}</h4>
                                <p class="product-brand">{{ product.product.brand?.name || 'No Brand' }}</p>
                                <p class="product-sku">SKU: {{ product.product.sku }}</p>
                              </div>
                            </div>
                            
                            <div class="product-stats">
                              <div class="stat-item">
                                <span class="stat-label">Slot</span>
                                <span class="stat-value">{{ product.slot }}</span>
                              </div>
                              <div class="stat-item">
                                <span class="stat-label">Current Stock</span>
                                <span class="stat-value" :class="getStockClass(product.current_volume, product.min_volume)">
                                  {{ product.current_volume }}ml
                                </span>
                              </div>
                              <div class="stat-item">
                                <span class="stat-label">Min Required</span>
                                <span class="stat-value">{{ product.min_volume }}ml</span>
                              </div>
                              <div class="stat-item">
                                <span class="stat-label">Spray Amount</span>
                                <span class="stat-value">{{ product.spray_amount }}ml</span>
                              </div>
                              <div class="stat-item">
                                <span class="stat-label">Price/Spray</span>
                                <span class="stat-value">Rp {{ formatPrice(product.price_per_spray) }}</span>
                              </div>
                            </div>

                            <!-- Stock Status Indicator -->
                            <div class="stock-indicator">
                              <div class="stock-bar">
                                <div 
                                  class="stock-fill" 
                                  :class="getStockClass(product.current_volume, product.min_volume)"
                                  :style="{ width: getStockPercentage(product.current_volume, product.min_volume) + '%' }"
                                ></div>
                              </div>
                              <span class="stock-status" :class="getStockClass(product.current_volume, product.min_volume)">
                                {{ getStockStatus(product.current_volume, product.min_volume) }}
                              </span>
                            </div>

                            <!-- Stock Actions -->
                            <div class="stock-actions">
                              <button 
                                @click="openStockEditModal(product)"
                                class="edit-stock-btn"
                                title="Edit Stock"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit Stock
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.pages > 1" class="pagination-container">
              <div class="pagination-info">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
                {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
                {{ pagination.total }} entries
              </div>
              <div class="pagination-controls">
                <button 
                  @click="changePage(pagination.page - 1)" 
                  :disabled="pagination.page <= 1"
                  class="pagination-button"
                >
                  Previous
                </button>
                
                <div class="page-numbers">
                  <button 
                    v-for="page in getVisiblePages()" 
                    :key="page"
                    @click="changePage(page)"
                    :class="['page-number', { active: page === pagination.page }]"
                  >
                    {{ page }}
                  </button>
                </div>
                
                <button 
                  @click="changePage(pagination.page + 1)" 
                  :disabled="pagination.page >= pagination.pages"
                  class="pagination-button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && !error && stockData.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Stock Data Found</h3>
            <p>No devices with products found. Try adjusting your search criteria.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Stock Edit Modal -->
  <div v-if="showStockEditModal" class="modal-overlay" @click="closeStockEditModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Edit Stock - {{ selectedProduct?.product?.name }}</h3>
        <button @click="closeStockEditModal" class="close-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="current-stock-info">
          <div class="info-item">
            <span class="label">Current Stock:</span>
            <span class="value">{{ selectedProduct?.current_volume }}ml</span>
          </div>
          <div class="info-item">
            <span class="label">Minimum Required:</span>
            <span class="value">{{ selectedProduct?.min_volume }}ml</span>
          </div>
          <div class="info-item">
            <span class="label">Device:</span>
            <span class="value">{{ selectedProduct?.device?.machine_code || selectedProduct?.device?.code }}</span>
          </div>
          <div class="info-item">
            <span class="label">Slot:</span>
            <span class="value">{{ selectedProduct?.slot }}</span>
          </div>
        </div>

        <form @submit.prevent="submitStockAdjustment" class="stock-form">
          <div class="form-group">
            <label for="adjustment_type">Adjustment Type</label>
            <select class="form-select form-control" v-model="stockForm.adjustment_type" id="adjustment_type" required>
              <option value="opname">Stock Opname</option>
              <option value="refill">Refill</option>
              <option value="correction">Correction</option>
            </select>
          </div>

          <div class="form-group">
            <label for="new_volume">New Stock Volume (ml)</label>
            <input 
              type="number" 
              v-model="stockForm.new_volume" 
              id="new_volume" 
              min="0" 
              step="1" 
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="reason">Reason</label>
            <input 
              type="text" 
              v-model="stockForm.reason" 
              id="reason" 
              placeholder="Reason for adjustment"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea 
              v-model="stockForm.notes" 
              id="notes" 
              rows="3" 
              placeholder="Additional notes (optional)"
              class="form-control"
            ></textarea>
          </div>

          <div class="adjustment-preview" v-if="stockForm.new_volume !== null">
            <div class="preview-item">
              <span class="label">Adjustment:</span>
              <span class="value" :class="getAdjustmentClass()">
                {{ getAdjustmentAmount() }}ml
              </span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeStockEditModal" class="btn cancel-btn">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary submit-btn" :disabled="stockFormLoading">
              <span v-if="stockFormLoading">Updating...</span>
              <span v-else>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Bulk Opname Modal -->
  <div v-if="showBulkOpnameModal" class="modal-overlay" @click="closeBulkOpnameModal">
    <div class="modal-content bulk-modal" @click.stop>
      <div class="modal-header">
        <h3>Bulk Stock Opname - {{ selectedDevice?.machine_code || selectedDevice?.code }}</h3>
        <button @click="closeBulkOpnameModal" class="close-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="bulk-form-header">
          <div class="form-group">
            <label for="bulk_reason">Reason for Bulk Adjustment</label>
            <input 
              type="text" 
              v-model="bulkOpnameForm.reason" 
              id="bulk_reason" 
              placeholder="e.g., Monthly stock opname"
              class="form-control"
            />
          </div>
        </div>

        <div class="bulk-products-list">
          <div 
            v-for="(product, index) in bulkOpnameForm.products" 
            :key="product.id"
            class="bulk-product-item"
          >
            <div class="product-info">
              <div class="product-name">{{ product.product.name }}</div>
              <div class="product-details">
                <span>Slot {{ product.slot }}</span>
                <span>Current: {{ product.current_volume }}ml</span>
                <span>Min: {{ product.min_volume }}ml</span>
              </div>
            </div>
            
            <div class="product-adjustment">
              <div class="form-group">
                <label>New Volume (ml)</label>
                <input 
                  type="number" 
                  v-model="product.new_volume" 
                  min="0" 
                  step="1" 
                  class="form-control"
                />
              </div>
              
              <div class="form-group">
                <label>Notes</label>
                <input 
                  type="text" 
                  v-model="product.notes" 
                  placeholder="Optional notes"
                  class="form-control"
                />
              </div>
              
              <div class="adjustment-indicator" v-if="product.new_volume !== null">
                <span :class="getBulkAdjustmentClass(product)">
                  {{ getBulkAdjustmentAmount(product) }}ml
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeBulkOpnameModal" class="cancel-btn">
            Cancel
          </button>
          <button @click="submitBulkOpname" class="submit-btn" :disabled="bulkOpnameLoading">
            <span v-if="bulkOpnameLoading">Processing...</span>
            <span v-else>Update All Stock</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toast-notification';
import { debounce } from 'lodash-es'
import { fetchWithAuth } from '~/utils/auth.js';
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Define page meta for Nuxt.js
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Reactive data
const stockData = ref([])
const loading = ref(false)
const error = ref(null)
const querySearch = ref('')
const expandedDevices = ref(new Set())

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Stock editing data
const showStockEditModal = ref(false)
const showBulkOpnameModal = ref(false)
const selectedProduct = ref(null)
const selectedDevice = ref(null)
const stockFormLoading = ref(false)
const bulkOpnameLoading = ref(false)

const stockForm = reactive({
  machine_product_id: null,
  adjustment_type: 'opname',
  new_volume: null,
  reason: '',
  notes: ''
})

const bulkOpnameForm = reactive({
  reason: '',
  products: []
})

// API call function
const fetchStockData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      ...(querySearch.value && { q: querySearch.value })
    })
    const accessToken = localStorage.getItem('access_token');
    const url = `${apiUrl}/api/device/stock?${params}`;
    const response = await fetchWithAuth(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    // const response = await $fetch(`/api/device/stock?${params}`, {
    //   headers: {
    //     'Authorization': `Bearer ${useCookie('access_token').value}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    const data = await response.json();
    if (data.success) {
      stockData.value = data.data || [];
    } else {
      $toast.error(data.message || 'Failed to fetch stock data');
      stockData.value = [];
    }
    // if (response.success) {
    //   stockData.value = response.data || []
    //   Object.assign(pagination, response.meta)
    // } else {
    //   throw new Error(response.message || 'Failed to fetch stock data')
    // }
  } catch (err) {
    error.value = err.message || 'An error occurred while fetching stock data'
    stockData.value = []
    console.error('Error fetching stock data:', err)
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = debounce(() => {
  pagination.page = 1
  fetchStockData()
}, 300)

// Device expansion toggle
const toggleDevice = (deviceId) => {
  if (expandedDevices.value.has(deviceId)) {
    expandedDevices.value.delete(deviceId)
  } else {
    expandedDevices.value.add(deviceId)
  }
}

// Pagination
const changePage = (page) => {
  if (page >= 1 && page <= pagination.pages) {
    pagination.page = page
    fetchStockData()
  }
}

const getProductList = async () => {
  try {
    let url = `${apiUrl}/api/product/`;
    if (querySearch.value) {
      url += `?q=${encodeURIComponent(querySearch.value)}`;
    }
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      productList.value = data.data;
    } else {
      $toast.error(data.message || 'Failed to fetch products');
    }
  } catch (error) {
    $toast.error('Failed to fetch products');
  }
};

const getVisiblePages = () => {
  const current = pagination.page
  const total = pagination.pages
  const delta = 2
  const range = []
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  
  if (current - delta > 2) {
    range.unshift('...')
  }
  if (current + delta < total - 1) {
    range.push('...')
  }
  
  range.unshift(1)
  if (total > 1) {
    range.push(total)
  }
  
  return range
}

// Utility functions
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'status-active'
    case 'maintenance': return 'status-maintenance'
    case 'broken': return 'status-broken'
    default: return 'status-unknown'
  }
}

const getTotalStock = (products) => {
  return products.reduce((total, product) => total + (product.current_volume || 0), 0)
}

const getLowStockCount = (products) => {
  return products.filter(product => 
    (product.current_volume || 0) <= (product.min_volume || 0)
  ).length
}

const getStockClass = (current, minimum) => {
  if (current <= minimum) return 'stock-critical'
  if (current <= minimum * 1.5) return 'stock-low'
  return 'stock-good'
}

const getStockStatus = (current, minimum) => {
  if (current <= minimum) return 'Critical'
  if (current <= minimum * 1.5) return 'Low'
  return 'Good'
}

const getStockPercentage = (current, minimum) => {
  const maxStock = minimum * 3 // Assume max stock is 3x minimum
  return Math.min((current / maxStock) * 100, 100)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID').format(price || 0)
}

// Stock editing functions
const openStockEditModal = (product) => {
  selectedProduct.value = product
  stockForm.machine_product_id = product.id
  stockForm.adjustment_type = 'opname'
  stockForm.new_volume = product.current_volume
  stockForm.reason = ''
  stockForm.notes = ''
  showStockEditModal.value = true
}

const closeStockEditModal = () => {
  showStockEditModal.value = false
  selectedProduct.value = null
  Object.assign(stockForm, {
    machine_product_id: null,
    adjustment_type: 'opname',
    new_volume: null,
    reason: '',
    notes: ''
  })
}

const openBulkOpnameModal = (deviceGroup) => {
  selectedDevice.value = deviceGroup.machine
  bulkOpnameForm.reason = ''
  bulkOpnameForm.products = deviceGroup.products.map(product => ({
    ...product,
    new_volume: product.current_volume,
    notes: ''
  }))
  showBulkOpnameModal.value = true
}

const closeBulkOpnameModal = () => {
  showBulkOpnameModal.value = false
  selectedDevice.value = null
  bulkOpnameForm.reason = ''
  bulkOpnameForm.products = []
}

const getAdjustmentAmount = () => {
  if (!selectedProduct.value || stockForm.new_volume === null) return '0'
  const adjustment = stockForm.new_volume - selectedProduct.value.current_volume
  return adjustment >= 0 ? `+${adjustment}` : adjustment.toString()
}

const getAdjustmentClass = () => {
  if (!selectedProduct.value || stockForm.new_volume === null) return ''
  const adjustment = stockForm.new_volume - selectedProduct.value.current_volume
  if (adjustment > 0) return 'adjustment-positive'
  if (adjustment < 0) return 'adjustment-negative'
  return 'adjustment-neutral'
}

const getBulkAdjustmentAmount = (product) => {
  if (product.new_volume === null) return '0'
  const adjustment = product.new_volume - product.current_volume
  return adjustment >= 0 ? `+${adjustment}` : adjustment.toString()
}

const getBulkAdjustmentClass = (product) => {
  if (product.new_volume === null) return ''
  const adjustment = product.new_volume - product.current_volume
  if (adjustment > 0) return 'adjustment-positive'
  if (adjustment < 0) return 'adjustment-negative'
  return 'adjustment-neutral'
}

const submitStockAdjustment = async () => {
  if (!stockForm.machine_product_id || stockForm.new_volume === null) {
    $toast.error('Please fill in all required fields')
    return
  }

  stockFormLoading.value = true
  
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/stock-adjustment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stockForm)
    })
    
    const data = await response.json()
    
    if (data.success) {
      $toast.success('Stock updated successfully')
      closeStockEditModal()
      await fetchStockData() // Refresh the stock data
    } else {
      $toast.error(data.message || 'Failed to update stock')
    }
  } catch (error) {
    console.error('Error updating stock:', error)
    $toast.error('Failed to update stock')
  } finally {
    stockFormLoading.value = false
  }
}

const submitBulkOpname = async () => {
  const adjustments = bulkOpnameForm.products
    .filter(product => product.new_volume !== null && product.new_volume !== product.current_volume)
    .map(product => ({
      machine_product_id: product.id,
      new_volume: product.new_volume,
      notes: product.notes
    }))

  if (adjustments.length === 0) {
    $toast.error('No changes detected')
    return
  }

  bulkOpnameLoading.value = true
  
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/stock-adjustment/bulk-opname`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: bulkOpnameForm.reason,
        adjustments
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      $toast.success(`Successfully updated ${adjustments.length} products`)
      closeBulkOpnameModal()
      await fetchStockData() // Refresh the stock data
    } else {
      $toast.error(data.message || 'Failed to update stock')
    }
  } catch (error) {
    console.error('Error updating bulk stock:', error)
    $toast.error('Failed to update stock')
  } finally {
    bulkOpnameLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchStockData()
})
</script>

<style scoped>
/* Page Layout */
.stock-page {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

/* Filters Section */
.filters-section {
  margin-bottom: 24px;
}

.search-container {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #a0aec0;
}

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #e53e3e;
  margin-bottom: 16px;
}

.retry-button {
  padding: 8px 16px;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #2c5aa0;
}

/* Table Styles */
.stock-table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table th {
  background-color: #f7fafc;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  font-size: 14px;
}

.expand-column {
  width: 48px;
}

.device-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #e2e8f0;
}

.device-row:hover {
  background-color: #f7fafc;
}

.device-row.expanded {
  background-color: #ebf8ff;
}

.device-row td {
  padding: 16px;
  vertical-align: middle;
}

.expand-button {
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.expand-button:hover {
  background-color: #e2e8f0;
}

.expand-button svg {
  width: 16px;
  height: 16px;
  color: #718096;
  transition: transform 0.2s ease;
}

.expand-button.expanded svg {
  transform: rotate(180deg);
}

.device-info {
  min-width: 200px;
}

.device-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.device-code {
  font-size: 12px;
  color: #718096;
  font-family: 'Monaco', 'Menlo', monospace;
}

.location {
  color: #4a5568;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-maintenance {
  background-color: #feebc8;
  color: #c05621;
}

.status-broken {
  background-color: #fed7d7;
  color: #c53030;
}

.status-unknown {
  background-color: #e2e8f0;
  color: #4a5568;
}

.product-count, .total-stock {
  font-weight: 600;
  color: #2d3748;
}

.low-stock-count {
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #f0f0f0;
  color: #4a5568;
  font-weight: 600;
}

.low-stock-count.warning {
  background-color: #fed7d7;
  color: #c53030;
}

/* Products Grid */
.products-container {
  background-color: #f7fafc;
}

.products-cell {
  padding: 0 !important;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 24px;
}

.product-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-placeholder svg {
  width: 24px;
  height: 24px;
  color: #a0aec0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.product-brand {
  font-size: 14px;
  color: #718096;
  margin: 0 0 4px 0;
}

.product-sku {
  font-size: 12px;
  color: #a0aec0;
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.product-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.stock-indicator {
  margin-top: 16px;
}

.stock-bar {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.stock-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stock-good {
  color: #38a169 !important;
}

.stock-good.stock-fill {
  background-color: #38a169;
}

.stock-low {
  color: #d69e2e !important;
}

.stock-low.stock-fill {
  background-color: #d69e2e;
}

.stock-critical {
  color: #e53e3e !important;
}

.stock-critical.stock-fill {
  background-color: #e53e3e;
}

.stock-status {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: white;
}

.pagination-info {
  color: #718096;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #4a5568;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #4a5568;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.page-number:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.page-number.active {
  background-color: #3182ce;
  border-color: #3182ce;
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: #718096;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #4a5568;
  margin-bottom: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stock-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  
  .product-stats {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .stock-table th,
  .stock-table td {
    padding: 12px 8px;
    font-size: 12px;
  }
  
  .device-name {
    font-size: 14px;
  }
  
  .product-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

/* Stock Edit Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.bulk-modal-content {
  max-width: 800px;
  width: 95%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #718096;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.current-stock-info {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stock-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stock-info-row:last-child {
  margin-bottom: 0;
}

.stock-info-label {
  font-size: 14px;
  color: #6b7280;
}

.stock-info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.adjustment-preview {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.adjustment-text {
  font-size: 14px;
  color: #92400e;
  margin: 0;
}

.adjustment-positive {
  color: #059669;
  font-weight: 500;
}

.adjustment-negative {
  color: #dc2626;
  font-weight: 500;
}

.adjustment-neutral {
  color: #6b7280;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Bulk Opname Styles */
.bulk-products-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
}

.bulk-product-item {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: 1fr 120px 120px 1fr;
  gap: 16px;
  align-items: center;
}

.bulk-product-item:last-child {
  border-bottom: none;
}

.bulk-product-info {
  display: flex;
  flex-direction: column;
}

.bulk-product-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.bulk-product-slot {
  font-size: 12px;
  color: #6b7280;
}

.bulk-current-stock {
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.bulk-new-volume {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-volume-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.bulk-adjustment {
  font-size: 12px;
  font-weight: 500;
}

.bulk-notes-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

/* Edit Stock Button */
.edit-stock-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-stock-btn:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.edit-stock-btn svg {
  width: 16px;
  height: 16px;
}

/* Bulk Opname Button */
.bulk-opname-btn {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-opname-btn:hover {
  background-color: #059669;
}

.bulk-opname-btn svg {
  width: 16px;
  height: 16px;
}
</style>