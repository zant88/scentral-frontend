<template>
  <section class="section">
      <div class="section-header">
        <h1 class="section-title">Sales</h1>
      </div>

      <!-- Filters Section -->
      <div class="card">
        <div class="card-header">
          <h4>Filters</h4>
          <button 
            class="btn btn-sm btn-outline-secondary"
            @click="clearFilters"
          >
            Clear All
          </button>
        </div>
        <div class="card-body">
          <div class="row filter-row">
            <!-- Date Range Filter -->
            <div class="col-md-3">
              <div class="form-group filter-item">
                <label>Date From</label>
                <input
                  type="date"
                  class="form-control filter-input"
                  v-model="filters.date_from"
                  @change="applyFilters"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group filter-item">
                <label>Date To</label>
                <input
                  type="date"
                  class="form-control filter-input"
                  v-model="filters.date_to"
                  @change="applyFilters"
                />
              </div>
            </div>

            <!-- Device Filter -->
            <div class="col-md-3">
              <div class="form-group filter-item">
                <label>Device</label>
                <select
                  class="form-control filter-input"
                  v-model="filters.device_id"
                  @change="applyFilters"
                >
                  <option value="">All Devices</option>
                  <option
                    v-for="device in filterOptions.devices"
                    :key="device.id"
                    :value="device.id"
                  >
                    {{ device.machine_code || device.code }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Brand Filter -->
            <div class="col-md-3">
              <div class="form-group filter-item">
                <label>Brand</label>
                <select
                  class="form-control filter-input"
                  v-model="filters.brand_id"
                  @change="applyFilters"
                >
                  <option value="">All Brands</option>
                  <option
                    v-for="brand in filterOptions.brands"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Search -->
            <div class="col-md-6">
              <div class="form-group filter-item">
                <label>Search</label>
                <input
                  type="text"
                  class="form-control filter-input"
                  placeholder="Search by sales code, device, product, brand, or category..."
                  v-model="filters.q"
                  @input="debounceSearch"
                />
              </div>
            </div>
            
            <!-- Sort -->
            <div class="col-md-3">
              <div class="form-group filter-item">
                <label>Sort By</label>
                <select
                  class="form-control filter-input"
                  v-model="filters.sort"
                  @change="applyFilters"
                >
                  <option value="created_at">Date</option>
                  <option value="sales_code">Sales Code</option>
                  <option value="total_price">Total Price</option>
                  <option value="quantity">Quantity</option>
                  <option value="machine_code">Device</option>
                  <option value="product_name">Product</option>
                  <option value="brand_name">Brand</option>
                  <option value="category_name">Category</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group filter-item">
                <label>Order</label>
                <select
                  class="form-control filter-input"
                  v-model="filters.order"
                  @change="applyFilters"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      <!-- Sales Table -->
      <div class="card">
        <div class="card-header">
          <h4>Sales Records</h4>
          <div class="card-header-action">
            <button
              class="btn btn-sm btn-primary"
              @click="exportSales"
              :disabled="isExporting || sales.length === 0"
            >
              <span v-if="isExporting" class="spinner-border spinner-border-sm mr-1"></span>
              <i class="fas fa-download mr-1"></i>
              {{ isExporting ? 'Exporting...' : 'Export CSV' }}
            </button>
            <span class="text-muted" v-if="pagination.total">
              Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of {{ pagination.total }} entries
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Sales Code</th>
                  <th>Date & Time</th>
                  <th>Device</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Customer Phone</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="13" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                    Loading...
                  </td>
                </tr>
                <tr v-else-if="sales.length === 0">
                  <td colspan="13" class="text-center text-muted">
                    No sales records found
                  </td>
                </tr>
                <tr v-else v-for="sale in sales" :key="sale.id">
                  <td>{{ sale.sales_code }}</td>
                  <td>{{ formatDateTime(sale.created_at) }}</td>
                  <td>{{ sale.machine?.machine_code || sale.machine?.code || '' }}</td>
                  <td>{{ sale.product?.name || '' }}</td>
                  <td>{{ sale.product?.category?.name || '' }}</td>
                  <td>{{ sale.product?.brand?.name || '' }}</td>
                  <td>{{ sale.customer?.phone || sale.customer?.user?.phone || '' }}</td>
                  <td>{{ sale.quantity }}</td>
                  <td>Rp {{ formatNumber(sale.selling_price) }}</td>
                  <td>{{ sale.discount ? `${sale.discount}%` : '0%' }}</td>
                  <td>Rp {{ formatNumber(sale.total_price) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="getStatusClass(sale.payment_status)"
                    >
                      {{ sale.payment_status }}
                    </span>
                  </td>
                  <td>
                    <button
                      v-if="sale.payment_status === 'pending'"
                      class="btn btn-sm btn-success"
                      @click="approveSale(sale)"
                      :disabled="approving === sale.id"
                    >
                      <span v-if="approving === sale.id" class="spinner-border spinner-border-sm mr-1"></span>
                      <i class="fas fa-check mr-1"></i>
                      Approve
                    </button>
                    <span v-else class="text-muted">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <ul class="pagination" v-if="pagination.pages > 1">
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
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'
import Swal from 'sweetalert2'

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Reactive data
const sales = ref([])
const filterOptions = ref({
  devices: [],
  products: [],
  brands: []
})
const filters = ref({
  q: '',
  date_from: '',
  date_to: '',
  device_id: '',
  brand_id: '',
  sort: 'created_at',
  order: 'desc',
  page: 1,
  limit: 20
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
  from: 0,
  to: 0
})
const loading = ref(false)
const approving = ref(null)
const isExporting = ref(false)
let searchTimeout = null

// Computed properties
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

// Methods
const fetchSales = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    // Add filters to params
    Object.keys(filters.value).forEach(key => {
      if (filters.value[key] !== '' && filters.value[key] !== null) {
        params.append(key, filters.value[key])
      }
    })

    const response = await fetchWithAuth(`${apiUrl}/api/sales?${params.toString()}`)
    const data = await response.json()
    
    if (data.success) {
      sales.value = data.data
      pagination.value = {
        ...pagination.value,
        ...data.meta,
        from: ((data.meta.page - 1) * data.meta.limit) + 1,
        to: Math.min(data.meta.page * data.meta.limit, data.meta.total)
      }
    }
  } catch (error) {
    console.error('Error fetching sales:', error)
    // Show error notification if toast is available
    if (window.$toast) {
      window.$toast.error('Failed to fetch sales data')
    }
  } finally {
    loading.value = false
  }
}

const fetchFilterOptions = async () => {
  try {
    // Fetch devices, products, and brands separately
    const [devicesResponse, productsResponse, brandsResponse] = await Promise.all([
      fetchWithAuth(`${apiUrl}/api/device/`),
      fetchWithAuth(`${apiUrl}/api/product/`),
      fetchWithAuth(`${apiUrl}/api/brand/`)
    ])

    const devicesData = await devicesResponse.json()
    const productsData = await productsResponse.json()
    const brandsData = await brandsResponse.json()

    console.log('Devices response:', devicesData) // Debug log
    console.log('Products response:', productsData) // Debug log
    console.log('Brands response:', brandsData) // Debug log

    filterOptions.value = {
      devices: devicesData.data || [],
      products: productsData.data || [],
      brands: brandsData.data || []
    }

    console.log('Filter options set:', filterOptions.value) // Debug log
  } catch (error) {
    console.error('Error fetching filter options:', error)
    if (window.$toast) {
      window.$toast.error('Failed to fetch filter options')
    }
  }
}

const applyFilters = () => {
  filters.value.page = 1
  fetchSales()
}

const clearFilters = () => {
  filters.value = {
    q: '',
    date_from: '',
    date_to: '',
    device_id: '',
    brand_id: '',
    sort: 'created_at',
    order: 'desc',
    page: 1,
    limit: 20
  }
  fetchSales()
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const changePage = (page) => {
  if (page === '...' || !pagination.value) return;
  
  if (page >= 1 && page <= pagination.value.pages) {
    filters.value.page = page
    fetchSales()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  return parseInt(num).toLocaleString('id-ID')
}

const getStatusClass = (status) => {
  const statusClasses = {
    'paid': 'badge-success',
    'pending': 'badge-warning',
    'canceled': 'badge-danger',
    'refunded': 'badge-info',
    'failed': 'badge-danger'
  }
  return statusClasses[status] || 'badge-secondary'
}

const approveSale = async (sale) => {
  // Show confirmation dialog
  const result = await Swal.fire({
    title: 'Approve Sale',
    text: `Are you sure you want to approve sale ${sale.sales_code}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, approve it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d'
  })
  
  // If user cancels, don't proceed
  if (!result.isConfirmed) {
    return
  }
  
  approving.value = sale.id
  
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/sales/${sale.id}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Show success notification
      await Swal.fire({
        title: 'Success!',
        text: 'Sale approved successfully',
        icon: 'success',
        confirmButtonColor: '#28a745'
      })
      
      // Refresh the sales list
      await fetchSales()
    } else {
      // Show error notification
      await Swal.fire({
        title: 'Error!',
        text: data.message || 'Failed to approve sale',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      })
    }
  } catch (error) {
    console.error('Error approving sale:', error)
    // Show error notification
    await Swal.fire({
      title: 'Error!',
      text: 'Failed to approve sale',
      icon: 'error',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    approving.value = null
  }
}

// Export functions
const exportSales = async () => {
  isExporting.value = true;
  try {
    // Fetch all sales data (without pagination)
    const allSalesData = await fetchAllSalesData();

    const csvData = generateSalesCSVData(allSalesData);
    const filename = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
    downloadSalesCSV(csvData, filename);

    // Show success notification if toast is available
    if (window.$toast) {
      window.$toast.success('Sales data exported successfully!', { duration: 3000, position: 'top-right' });
    } else {
      // Fallback to alert if toast is not available
      alert('Sales data exported successfully!');
    }
  } catch (error) {
    console.error('Export error:', error);
    if (window.$toast) {
      window.$toast.error('Failed to export sales data', { duration: 5000, position: 'top-right' });
    } else {
      alert('Failed to export sales data');
    }
  } finally {
    isExporting.value = false;
  }
};

// Fetch all sales data for export
const fetchAllSalesData = async () => {
  try {
    // Create a copy of current filters but remove pagination
    const exportFilters = { ...filters.value };
    delete exportFilters.page;
    delete exportFilters.limit;

    // Set a high limit to get all data
    exportFilters.limit = 10000;

    const params = new URLSearchParams();
    Object.keys(exportFilters).forEach(key => {
      if (exportFilters[key] !== '' && exportFilters[key] !== null) {
        params.append(key, exportFilters[key]);
      }
    });

    const response = await fetchWithAuth(`${apiUrl}/api/sales?${params.toString()}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch all sales data');
    }
  } catch (error) {
    console.error('Error fetching all sales data:', error);
    // Fallback to current page data if fetching all fails
    return sales.value;
  }
};

// Generate CSV data for sales
const generateSalesCSVData = (salesData = null) => {
  const dataToExport = salesData || sales.value;

  // Add summary information at the top
  const summaryData = [
    ['Sales Export Report'],
    ['Generated Date', new Date().toLocaleString()],
    ['Export Period', `${filters.value.date_from || 'All time'} to ${filters.value.date_to || 'Present'}`],
    ['Total Records', dataToExport.length],
    ['Filter Applied', filters.value.q ? `Search: ${filters.value.q}` : 'None'],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for separation
  ];

  const headers = [
    'Sales Code',
    'Date',
    'Time',
    'Device',
    'Product',
    'Category',
    'Brand',
    'Customer Phone',
    'Quantity',
    'Price',
    'Discount',
    'Total',
    'Status'
  ];

  const salesRows = [];

  dataToExport.forEach(sale => {
    salesRows.push([
      sale.sales_code || '',
      formatDate(sale.created_at),
      formatTime(sale.created_at),
      sale.machine?.machine_code || sale.machine?.code || '',
      sale.product?.name || '',
      sale.product?.category?.name || '',
      sale.product?.brand?.name || '',
      sale.customer?.phone || sale.customer?.user?.phone || '',
      sale.quantity || 0,
      `Rp ${formatNumber(sale.selling_price)}`,
      sale.discount ? `${sale.discount}%` : '0%',
      `Rp ${formatNumber(sale.total_price)}`,
      sale.payment_status || ''
    ]);
  });

  // Add summary statistics at the end
  const totalRevenue = dataToExport.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
  const totalQuantity = dataToExport.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
  const totalDiscount = dataToExport.reduce((sum, sale) => sum + ((sale.total_price || 0) * (sale.discount || 0) / 100), 0);
  const paidSales = dataToExport.filter(sale => sale.payment_status === 'paid').length;
  const pendingSales = dataToExport.filter(sale => sale.payment_status === 'pending').length;
  const failedSales = dataToExport.filter(sale => sale.payment_status === 'failed').length;

  // Analyze top categories
  const categoryStats = {};
  dataToExport.forEach(sale => {
    const category = sale.product?.category?.name || 'Uncategorized';
    categoryStats[category] = (categoryStats[category] || 0) + (sale.quantity || 0);
  });

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const summaryFooter = [
    ['', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for separation
    ['SUMMARY STATISTICS'],
    ['Total Revenue', '', '', '', '', '', '', '', '', '', `Rp ${formatNumber(totalRevenue)}`, '', ''],
    ['Total Quantity Sold', '', '', '', '', '', '', '', totalQuantity, '', '', '', ''],
    ['Total Discount Amount', '', '', '', '', '', '', '', '', '', `Rp ${formatNumber(totalDiscount)}`, '', ''],
    ['Paid Sales', '', '', '', '', '', '', '', '', '', paidSales, '', ''],
    ['Pending Sales', '', '', '', '', '', '', '', '', '', pendingSales, '', ''],
    ['Failed Sales', '', '', '', '', '', '', '', '', '', failedSales, '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row for separation
    ['TOP CATEGORIES BY QUANTITY'],
    ...topCategories.map(([category, quantity], index) => [
      `${index + 1}. ${category}`, '', '', '', '', '', '', '', quantity, '', '', '', ''
    ])
  ];

  return {
    headers,
    data: [...summaryData, ...salesRows, ...summaryFooter]
  };
};

// Download CSV file for sales
const downloadSalesCSV = (csvData, filename) => {
  let csvContent = csvData.headers.join(',') + '\n';

  csvData.data.forEach(row => {
    // Escape commas and quotes in data
    const escapedRow = row.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    });
    csvContent += escapedRow.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchSales(),
    fetchFilterOptions()
  ])
})
</script>

<style scoped>
.table th {
  font-weight: 600;
  background-color: #f8f9fa;
}

.table-responsive {
  min-height: 400px;
  overflow-x: auto;
}

/* Responsive table adjustments */
@media (max-width: 1200px) {
  .table-responsive {
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.75rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
    white-space: nowrap;
  }
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-action {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-group label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.text-muted {
  color: #6c757d !important;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-success:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #004085;
}

.btn-primary:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.mr-1 {
  margin-right: 0.25rem;
}

.actions-cell {
  min-width: 100px;
}

/* Filter styling for consistent height and alignment */
.filter-row {
  align-items: stretch;
}

.filter-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.filter-input {
  flex: 1;
  min-height: 32px;
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.filter-input:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Ensure all form controls in filters have same height */
.filter-item .form-control,
.filter-item select,
.filter-item input {
  /* height: 32px; */
  /* line-height: 1.5; */
  /* padding: 0.125rem 0.5rem; */
  padding: 4px 15px;
  font-size: 16px;
}

/* Consistent label styling */
.filter-item label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-item {
    margin-bottom: 0.5rem;
  }
  
  .filter-input {
    min-height: 30px;
  }
  
  .filter-item .form-control,
  .filter-item select,
  .filter-item input {
    height: 30px;
    line-height: 1.4;
    padding: 0.1rem 0.4rem;
    font-size: 0.875rem;
  }
  
  .filter-item label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
}
</style>
