<template>
  <section class="section">
    <div class="section-header">
      <h1>Balance Management</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item"><a href="#" @click="navigateTo('/brand/dashboard')">Dashboard</a></div>
        <div class="breadcrumb-item active">Balance Management</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Account Balance</h2>
      <p class="section-lead">
        Manage your account balance and view transaction history.
      </p>

      <!-- Balance Overview -->
      <div class="row mb-4">
        <div class="col-lg-4 col-md-6 col-12">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <div class="mb-3 text-primary">
                <i class="fas fa-wallet fa-3x"></i>
              </div>
              <h6 class="text-muted text-uppercase letter-spacing-1 mb-2">Current Balance</h6>
              <h2 :class="getBalanceClass()" class="font-weight-bold mb-4">
                {{ formatCurrency(balanceInfo.current_balance) }}
              </h2>
              <button @click="showTopUpModal = true" class="btn btn-primary btn-round px-4 shadow-none">
                <i class="fas fa-plus mr-2"></i>Top Up Balance
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 col-12">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <div class="mb-3 text-warning">
                <i class="fas fa-chart-pie fa-3x"></i>
              </div>
              <h6 class="text-muted text-uppercase letter-spacing-1 mb-2">Monthly Spending</h6>
              <h2 class="text-dark font-weight-bold mb-1">
                {{ formatCurrency(balanceInfo.monthly_spending) }}
              </h2>
              <p class="text-muted small mb-0">Total spent this month</p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 col-12">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <div class="mb-3 text-info">
                <i class="fas fa-hourglass-half fa-3x"></i>
              </div>
              <h6 class="text-muted text-uppercase letter-spacing-1 mb-2">Estimated Days Left</h6>
              <h2 :class="getDaysLeftClass()" class="font-weight-bold mb-1">
                {{ Math.round(balanceInfo.estimated_days_left || 0) }}
              </h2>
              <p class="text-muted small mb-0">Based on average daily spend</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="row">
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success">
              <i class="fas fa-arrow-up"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Top Ups</h4>
              </div>
              <div class="card-body">
                {{ balanceStats.total_topups }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info">
              <i class="fas fa-arrow-down"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Spent</h4>
              </div>
              <div class="card-body">
                {{ formatCurrency(balanceStats.total_spent) }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Last Top Up</h4>
              </div>
              <div class="card-body">
                {{ formatDate(balanceStats.last_topup_date) }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Avg Daily Spend</h4>
              </div>
              <div class="card-body">
                {{ formatCurrency(balanceStats.avg_daily_spend) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spending Chart -->
      <div class="card">
        <div class="card-header">
          <h4>Spending Overview</h4>
          <div class="card-header-action">
            <select v-model="chartPeriod" @change="updateChart" class="form-control form-control-sm">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <canvas id="spendingChart" width="400" height="150"></canvas>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="card">
        <div class="card-header">
          <h4>Transaction History</h4>
          <div class="card-header-action">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="filterTransactions"
                class="form-control search-input" 
                placeholder="Search transactions..."
              />
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">

            <div class="col-md-3">
              <input 
                type="date" 
                v-model="filterStartDate" 
                @change="filterTransactions"
                class="form-control"
                placeholder="Start Date"
              />
            </div>
            <div class="col-md-3">
              <input 
                type="date" 
                v-model="filterEndDate" 
                @change="filterTransactions"
                class="form-control"
                placeholder="End Date"
              />
            </div>
            <div class="col-md-3">
              <button @click="exportTransactions" class="btn btn-outline-primary">
                <i class="fas fa-download mr-1"></i>Export
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
                  <td>{{ formatDateTime(transaction.created_at) }}</td>
                  <td>
                    <div class="transaction-description">
                      <strong>{{ transaction.description }}</strong>
                      <div class="text-muted small">{{ transaction.reference || 'N/A' }}</div>
                    </div>
                  </td>
                  <td :class="getTransactionAmountClass(transaction.type)">
                    <strong>{{ getTransactionPrefix(transaction.type) }}{{ formatCurrency(transaction.amount) }}</strong>
                  </td>
                  <td>{{ formatCurrency(transaction.balance_after) }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(transaction.status)" class="badge">
                      {{ transaction.status?.toUpperCase() }}
                    </span>
                  </td>
                  <td>
                    <button @click="showTransactionDetails(transaction)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTransactions.length === 0" class="text-center py-5">
            <i class="fas fa-receipt fa-4x text-muted mb-3"></i>
            <h5 class="text-muted">No transactions found</h5>
            <p class="text-muted">
              {{ searchQuery || filterStartDate || filterEndDate ? 'Try adjusting your filters' : 'No transactions have been recorded yet' }}
            </p>
          </div>

          <!-- Pagination -->
          <nav v-if="totalPages > 1" aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page"
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Top Up Modal -->
      <div v-if="showTopUpModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeTopUpModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Top Up Balance</h5>
              <button type="button" class="btn-close" @click="closeTopUpModal"></button>
            </div>
            <div class="modal-body text-center py-4">
              <div class="mb-4">
                <i class="fas fa-headset fa-4x text-primary mb-3"></i>
                <h4 class="mb-3">Contact Customer Service for Top Up</h4>
                <p class="text-muted mb-4">
                  To top up your account balance, please contact our customer service team.
                  Our representatives will assist you with the payment process and ensure your account is credited promptly.
                </p>
              </div>
              
              <div class="row mb-4">
                <div class="col-md-6 mb-3">
                  <div class="card border-primary">
                    <div class="card-body">
                      <h6 class="card-title text-primary">
                        <i class="fas fa-phone mr-2"></i>Phone Support
                      </h6>
                      <p class="card-text">+62 21 1234 5678</p>
                      <small class="text-muted">Mon-Fri: 9:00 AM - 6:00 PM</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="card border-primary">
                    <div class="card-body">
                      <h6 class="card-title text-primary">
                        <i class="fas fa-envelope mr-2"></i>Email Support
                      </h6>
                      <p class="card-text">support@scentral.com</p>
                      <small class="text-muted">Response within 24 hours</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="alert alert-info">
                <i class="fas fa-info-circle mr-2"></i>
                <strong>Current Balance:</strong> {{ formatCurrency(balanceInfo.current_balance) }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeTopUpModal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Details Modal -->
      <div v-if="showDetailsModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeDetailsModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Transaction Details</h5>
              <button type="button" class="btn-close" @click="closeDetailsModal"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedTransaction" class="transaction-details">
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Transaction ID:</strong></td>
                      <td>{{ selectedTransaction.id }}</td>
                    </tr>
                    <tr>
                      <td><strong>Date:</strong></td>
                      <td>{{ formatDateTime(selectedTransaction.created_at) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Type:</strong></td>
                      <td>
                        <span :class="getTransactionTypeClass(selectedTransaction.type)" class="badge">
                          {{ selectedTransaction.type?.toUpperCase() }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Description:</strong></td>
                      <td>{{ selectedTransaction.description }}</td>
                    </tr>
                    <tr>
                      <td><strong>Reference:</strong></td>
                      <td>{{ selectedTransaction.reference || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Amount:</strong></td>
                      <td :class="getTransactionAmountClass(selectedTransaction.type)">
                        <strong>{{ getTransactionPrefix(selectedTransaction.type) }}{{ formatCurrency(selectedTransaction.amount) }}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Balance Before:</strong></td>
                      <td>{{ formatCurrency(selectedTransaction.balance_before) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Balance After:</strong></td>
                      <td>{{ formatCurrency(selectedTransaction.balance_after) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <span :class="getStatusBadgeClass(selectedTransaction.status)" class="badge">
                          {{ selectedTransaction.status?.toUpperCase() }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="selectedTransaction.payment_method">
                      <td><strong>Payment Method:</strong></td>
                      <td>{{ selectedTransaction.payment_method }}</td>
                    </tr>
                    <tr v-if="selectedTransaction.notes">
                      <td><strong>Notes:</strong></td>
                      <td>{{ selectedTransaction.notes }}</td>
                    </tr>
                  </tbody>
                  
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeDetailsModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tooltip -->
  <div v-if="tooltip.visible" class="tooltip" :style="{
    left: tooltip.x + 'px',
    top: tooltip.y + 'px',
    opacity: tooltip.visible ? '1' : '0',
    transition: 'opacity 0.2s ease-in-out'
  }">
    <div class="tooltip-title">{{ tooltip.title }}</div>
    <div class="tooltip-value">{{ tooltip.value }}</div>
    <div v-if="tooltip.date" class="tooltip-date">{{ tooltip.date }}</div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'brand'
})

import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();

// Reactive data
const balanceInfo = ref({
  current_balance: 0,
  monthly_spending: 0,
  monthly_budget: 0,
  estimated_days_left: 0
});

const balanceStats = ref({
  total_topups: 0,
  total_spent: 0,
  last_topup_date: null,
  avg_daily_spend: 0
});

const transactions = ref([]);

// Filters
const searchQuery = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Chart
const chartPeriod = ref('30d');

// Modals
const showTopUpModal = ref(false);
const showDetailsModal = ref(false);
const selectedTransaction = ref(null);

// Top-up form (no longer needed but keeping for reference)
const topUpAmount = ref('');
const topUpAmountFormatted = ref('');
const paymentMethod = ref('bank_transfer');
const paymentNotes = ref('');

// Navigation function
const navigateTo = (path) => {
  router.push(path);
};

// Fetch balance info
const fetchBalanceInfo = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/balance`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      balanceInfo.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching balance info:', error);
  }
};

// Fetch balance stats
const fetchBalanceStats = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/balance/stats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      balanceStats.value = data.data;
    }
  } catch (error) {
    console.error('Error fetching balance stats:', error);
  }
};

// Fetch transactions
const fetchTransactions = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', currentPage.value);
    params.append('limit', itemsPerPage);
    
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (filterStartDate.value) params.append('start_date', filterStartDate.value);
    if (filterEndDate.value) params.append('end_date', filterEndDate.value);

    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/transactions?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      transactions.value = data.data || [];
      if (data.pagination) {
        totalItems.value = data.pagination.total;
      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

// Filter and sort transactions
const filteredTransactions = computed(() => {
  // Since we're now doing server-side filtering/pagination,
  // we just return the transactions as is.
  return transactions.value;
});

// Pagination
const totalItems = ref(0);
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage);
});

const paginatedTransactions = computed(() => {
  // If backend handles pagination, just return the data
  return transactions.value;
});

// Filter transactions
const filterTransactions = () => {
  currentPage.value = 1;
  fetchTransactions(); // Trigger fetch on filter change
};

// Watch for page changes to fetch new data
import { watch } from 'vue';
watch(currentPage, () => {
  fetchTransactions();
});

// Show transaction details
const showTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction;
  showDetailsModal.value = true;
};

// Close modals
const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedTransaction.value = null;
};

const closeTopUpModal = () => {
  showTopUpModal.value = false;
};

// Top-up functions (no longer needed but keeping for reference)
const setAmount = (amount) => {
  topUpAmount.value = amount;
  topUpAmountFormatted.value = amount.toLocaleString('id-ID');
};

const handleAmountInput = (event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  topUpAmount.value = value;
  topUpAmountFormatted.value = value ? parseInt(value).toLocaleString('id-ID') : '';
};

const submitTopUp = async () => {
  // This function is no longer used as we're directing users to customer service
  // Keeping it for reference in case the functionality is restored later
};

// Export transactions
const exportTransactions = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    params.append('limit', '1000'); // Fetch up to 1000 for export
    
    if (searchQuery.value) params.append('search', searchQuery.value);
    if (filterStartDate.value) params.append('start_date', filterStartDate.value);
    if (filterEndDate.value) params.append('end_date', filterEndDate.value);

    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/transactions?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    
    if (data.success && data.data) {
      const csvContent = convertToCSV(data.data);
      downloadCSV(csvContent, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      $toast.success('Transactions exported successfully');
    }
  } catch (error) {
    console.error('Export error:', error);
    $toast.error('Failed to export transactions');
  }
};

const convertToCSV = (data) => {
  const headers = ['Date', 'Description', 'Amount', 'Balance After', 'Status', 'Reference'];
  const rows = data.map(t => [
    formatDateTime(t.created_at).replace(/,/g, ''), // Remove commas to avoid CSV issues
    t.description ? t.description.replace(/,/g, ' ') : '',
    t.amount,
    t.balance_after,
    t.status,
    t.reference || ''
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

const downloadCSV = (content, fileName) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

// Update chart
const updateChart = async () => {
  await nextTick();
  fetchChartData();
};

// Fetch chart data
const fetchChartData = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/brand/dashboard/spend-balance-analytics?period=${chartPeriod.value}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success && data.data && data.data.periods) {
      // Determine which period data to use
      let periodData;
      if (chartPeriod.value === '7d') periodData = data.data.periods.last_7_days;
      else if (chartPeriod.value === '30d') periodData = data.data.periods.last_30_days;
      else if (chartPeriod.value === '90d') periodData = data.data.periods.last_90_days;
      
      if (periodData) {
        renderSpendingChart(periodData);
      }
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
  }
};

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  value: '',
  date: ''
});

import Chart from 'chart.js/auto';

let chartInstance = null;

// Render spending chart
const renderSpendingChart = (periodData) => {
  const canvas = document.getElementById('spendingChart');
  if (!canvas) return;
  
  const container = canvas.parentElement;
  const width = container.offsetWidth;
  const height = 300;
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = '100%';
  canvas.style.height = height + 'px';
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  if (!periodData || !periodData.spend_data || periodData.spend_data.length === 0) {
    // Show no data message
    ctx.fillStyle = '#6c757d';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No data available for this period', width / 2, height / 2);
    return;
  }
  
  const spendDataArray = periodData.spend_data;
  
  // Find max value for scaling (based on spend only)
  const allSpends = spendDataArray.map(d => d.spend);
  const maxSpend = Math.max(...allSpends, 1);
  const maxValue = maxSpend; // Use max spend as the scale
  
  // Draw grid lines
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = (height - 40) * (i / 5) + 20;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 20, y);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    const value = maxValue * (1 - i / 5);
    ctx.fillText(formatCompactNumber(value), 35, y + 3);
  }
  
  ctx.setLineDash([]);
  
  // Store point positions for tooltip
  const spendPoints = [];
  
  // Draw spend line
  if (spendDataArray.length > 0) {
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    spendDataArray.forEach((point, index) => {
      const x = 40 + ((width - 60) / (spendDataArray.length - 1)) * index;
      const y = height - 20 - ((point.spend - 0) / maxValue) * (height - 40);
      
      // Store point position for tooltip
      spendPoints.push({ x, y, data: point });
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw spend points with larger hover area
    ctx.fillStyle = '#dc3545';
    spendDataArray.forEach((point, index) => {
      const x = 40 + ((width - 60) / (spendDataArray.length - 1)) * index;
      const y = height - 20 - ((point.spend - 0) / maxValue) * (height - 40);
      
      // Draw outer circle for hover area (invisible but larger)
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(220, 53, 69, 0.1)';
      ctx.fill();
      
      // Draw actual point
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#dc3545';
      ctx.fill();
    });
  }
  
  // Draw X-axis labels (dates)
  ctx.fillStyle = '#6c757d';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  
  const labelCount = Math.min(spendDataArray.length, 10); // Show max 10 labels
  const step = Math.max(1, Math.floor(spendDataArray.length / labelCount));
  
  for (let i = 0; i < spendDataArray.length; i += step) {
    const x = 40 + ((width - 60) / (spendDataArray.length - 1)) * i;
    const date = new Date(spendDataArray[i].date);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ctx.fillText(label, x, height - 5);
  }
  
  // Draw legend
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  
  // Spend legend only
  ctx.fillStyle = '#dc3545';
  ctx.fillRect(width - 150, 10, 15, 3);
  ctx.fillStyle = '#333';
  ctx.fillText('Daily Spend', width - 130, 14);
  
  // Add mouse move event for tooltip
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Check if mouse is near any spend point
    let foundPoint = false;
    
    for (const point of spendPoints) {
      const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
      if (distance <= 15) { // Increased hover area for better UX
        showTooltip(e.clientX, e.clientY, 'Daily Spend', formatCurrency(point.data.spend), point.data.date);
        foundPoint = true;
        canvas.style.cursor = 'pointer';
        break;
      }
    }
    
    if (!foundPoint) {
      hideTooltip();
      canvas.style.cursor = 'crosshair';
    }
  };
  
  canvas.onmouseleave = () => {
    hideTooltip();
    canvas.style.cursor = 'crosshair';
  };
};

// Tooltip functions
const showTooltip = (x, y, title, value, date) => {
  tooltip.value = {
    visible: true,
    x: x + 15, // Offset from mouse
    y: y + 15,
    title,
    value,
    date: formatDate(date)
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

// Utility functions
const formatCurrency = (amount) => {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 Credits';
  }
  const numAmount = parseFloat(amount) || 0;
  return `${Math.round(numAmount).toLocaleString('id-ID')} Credits`;
};

const formatCompactNumber = (number) => {
  if (number === 0) return '0';
  
  const k = 1000;
  const sizes = ['', 'K', 'M', 'B', 'T'];
  const i = Math.floor(Math.log(Math.abs(number)) / Math.log(k));
  
  if (i === 0) return Math.round(number).toString();
  
  return parseFloat((number / Math.pow(k, i)).toFixed(1)) + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const getBalanceClass = () => {
  // Handle NaN values
  const balance = parseFloat(balanceInfo.value.current_balance) || 0;
  if (balance < 50000) return 'text-danger';
  if (balance < 100000) return 'text-warning';
  return 'text-success';
};

const getDaysLeftClass = () => {
  // Handle NaN values
  const daysLeft = parseFloat(balanceInfo.value.estimated_days_left) || 0;
  if (daysLeft < 7) return 'text-danger';
  if (daysLeft < 14) return 'text-warning';
  return 'text-success';
};

const getTransactionTypeClass = (type) => {
  switch (type) {
    case 'topup': return 'badge-success';
    case 'spend': return 'badge-danger';
    case 'refund': return 'badge-info';
    default: return 'badge-secondary';
  }
};

const getTransactionAmountClass = (type) => {
  switch (type) {
    case 'topup': return 'text-success';
    case 'spend': return 'text-danger';
    case 'refund': return 'text-info';
    default: return 'text-secondary';
  }
};

const getTransactionPrefix = (type) => {
  switch (type) {
    case 'topup': return '+';
    case 'spend': return '-';
    case 'refund': return '+';
    default: return '';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'failed': return 'badge-danger';
    default: return 'badge-secondary';
  }
};

// Lifecycle
onMounted(async () => {
  // Set default date range (last 7 days)
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  
  filterStartDate.value = start.toISOString().split('T')[0];
  filterEndDate.value = end.toISOString().split('T')[0];

  await Promise.all([
    fetchBalanceInfo(),
    fetchBalanceStats(),
    fetchTransactions()
  ]);
  await nextTick();
  fetchChartData();
  
  // Add resize listener
  window.addEventListener('resize', updateChart);
});

import { onUnmounted } from 'vue';
onUnmounted(() => {
  window.removeEventListener('resize', updateChart);
});
</script>

<style scoped>
.search-wrapper {
  position: relative;
  width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 5;
  pointer-events: none;
}

.search-input {
  padding-left: 35px !important;
  border-radius: 20px;
}

.btn-round {
  border-radius: 30px;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.card-statistic-1 {
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.card-statistic-1 .card-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  border-radius: 0 0 0 100%;
  margin: 0;
}

.card-statistic-1 .card-wrap {
  padding: 1.5rem 1.5rem 1.5rem 1.8rem;
  height: 130px;
  padding-top: 55px;
}

.card-statistic-1 .card-header h4 {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
}

.card-statistic-1 .card-body {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  padding-left: 0;
}

.card-statistic-1 .card-header {
  padding-top: 0;
  padding-left: 0
}

.transaction-description {
  min-width: 200px;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-primary { background-color: #007bff; }
.badge-success { background-color: #28a745; }
.badge-warning { background-color: #ffc107; color: #212529; }
.badge-danger { background-color: #dc3545; }
.badge-info { background-color: #17a2b8; }
.badge-secondary { background-color: #6c757d; }

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

canvas {
  max-height: 300px;
}

/* Tooltip Styles */
.tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  transform: translate(0, 0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 2px;
  color: #fff;
}

.tooltip-value {
  font-size: 14px;
  margin-bottom: 2px;
}

.tooltip-date {
  color: #ccc;
  font-size: 11px;
}
</style>
