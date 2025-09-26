<template>
  <div class="stock-page">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">Stock Management</h1>
      <p class="page-subtitle">Monitor product inventory across all devices</p>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search devices, products, or SKU..."
          class="search-input"
          @input="debouncedSearch"
        />
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
    </div>

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
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { debounce } from 'lodash-es'

export default {
  name: 'StockPage',
  setup() {
    // Reactive data
    const stockData = ref([])
    const loading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const expandedDevices = ref(new Set())
    
    const pagination = reactive({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    })

    // API call function
    const fetchStockData = async () => {
      loading.value = true
      error.value = null
      
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...(searchQuery.value && { q: searchQuery.value })
        })
        
        const response = await fetch(`/api/device/stock?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          stockData.value = data.data || []
          Object.assign(pagination, data.meta)
        } else {
          throw new Error(data.message || 'Failed to fetch stock data')
        }
      } catch (err) {
        error.value = err.message || 'An error occurred while fetching stock data'
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

    // Lifecycle
    onMounted(() => {
      fetchStockData()
    })

    return {
      stockData,
      loading,
      error,
      searchQuery,
      expandedDevices,
      pagination,
      fetchStockData,
      debouncedSearch,
      toggleDevice,
      changePage,
      getVisiblePages,
      getStatusClass,
      getTotalStock,
      getLowStockCount,
      getStockClass,
      getStockStatus,
      getStockPercentage,
      formatPrice
    }
  }
}
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
</style>