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
      <div class="row">
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h4>Current Balance</h4>
            </div>
            <div class="card-body text-center">
              <h1 :class="getBalanceClass()" class="mb-0">
                {{ formatCurrency(balanceInfo.current_balance) }}
              </h1>
              <p class="text-muted">Available Balance</p>
              <div class="mt-3">
                <button @click="showTopUpModal = true" class="btn btn-primary">
                  <i class="fas fa-headset mr-1"></i>Top Up Balance
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h4>Monthly Spending</h4>
            </div>
            <div class="card-body text-center">
              <h3 class="text-warning mb-0">{{ formatCurrency(balanceInfo.monthly_spending) }}</h3>
              <p class="text-muted">This Month</p>
              <div class="progress mt-3" style="height: 10px;">
                <div
                  class="progress-bar bg-warning"
                  :style="{ width: Math.min((balanceInfo.monthly_budget > 0 ? (balanceInfo.monthly_spending / balanceInfo.monthly_budget) * 100 : 0), 100) + '%' }"
                ></div>
              </div>
              <small class="text-muted">{{ balanceInfo.monthly_budget > 0 ? Math.round((balanceInfo.monthly_spending / balanceInfo.monthly_budget) * 100) : 0 }}% of budget used</small>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h4>Estimated Days Left</h4>
            </div>
            <div class="card-body text-center">
              <h3 :class="getDaysLeftClass()" class="mb-0">{{ balanceInfo.estimated_days_left }}</h3>
              <p class="text-muted">Days of advertising</p>
              <div class="mt-3">
                <small class="text-muted">Based on current spending rate</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance Alert -->
      <div v-if="(parseFloat(balanceInfo.current_balance) || 0) < 100000" class="alert alert-warning" role="alert">
        <div class="d-flex align-items-center">
          <i class="fas fa-exclamation-triangle mr-3 fa-2x"></i>
          <div class="flex-grow-1">
            <strong>Low Balance Alert:</strong> Your current balance is {{ formatCurrency(balanceInfo.current_balance) }}.
            Based on your current spending rate, you may run out of funds in approximately {{ parseFloat(balanceInfo.estimated_days_left) || 0 }} days.
            Please contact customer service to top up your balance to ensure your advertisements continue running.
          </div>
          <button @click="showTopUpModal = true" class="btn btn-warning ml-3">
            <i class="fas fa-headset mr-1"></i>Contact Support
          </button>
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
            <div class="input-group" style="width: 250px;">
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="filterTransactions"
                class="form-control" 
                placeholder="Search transactions..."
              />
              <div class="input-group-append">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-3">
              <select v-model="filterType" @change="filterTransactions" class="form-control">
                <option value="">All Types</option>
                <option value="topup">Top Up</option>
                <option value="spend">Spending</option>
                <option value="refund">Refund</option>
              </select>
            </div>
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
                  <th>Type</th>
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
                    <span :class="getTransactionTypeClass(transaction.type)" class="badge">
                      {{ transaction.type?.toUpperCase() }}
                    </span>
                  </td>
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
              {{ searchQuery || filterType || filterStartDate || filterEndDate ? 'Try adjusting your filters' : 'No transactions have been recorded yet' }}
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
  monthly_budget: 1000000,
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
const filterType = ref('');
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
    const response = await fetchWithAuth(`${apiUrl}/api/brand/balance/stats`, {
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
    const response = await fetchWithAuth(`${apiUrl}/api/brand/transactions`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      transactions.value = data.data || [];
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

// Filter and sort transactions
const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(transaction => 
      transaction.description?.toLowerCase().includes(query) ||
      transaction.reference?.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filterType.value) {
    filtered = filtered.filter(transaction => transaction.type === filterType.value);
  }

  // Date filters
  if (filterStartDate.value) {
    filtered = filtered.filter(transaction => 
      new Date(transaction.created_at) >= new Date(filterStartDate.value)
    );
  }

  if (filterEndDate.value) {
    filtered = filtered.filter(transaction => 
      new Date(transaction.created_at) <= new Date(filterEndDate.value + ' 23:59:59')
    );
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return filtered;
});

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransactions.value.slice(start, end);
});

// Filter transactions
const filterTransactions = () => {
  currentPage.value = 1;
};

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
const exportTransactions = () => {
  // This would typically generate and download a CSV/Excel file
  $toast.info('Export feature coming soon!', { duration: 3000, position: 'top-right' });
};

// Update chart
const updateChart = async () => {
  await nextTick();
  renderSpendingChart();
};

// Render spending chart
const renderSpendingChart = () => {
  const canvas = document.getElementById('spendingChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Simple line chart implementation
  ctx.strokeStyle = '#6777ef';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  // Sample data - in real implementation, fetch from API
  const data = [
    { day: 'Mon', amount: 45000 },
    { day: 'Tue', amount: 52000 },
    { day: 'Wed', amount: 38000 },
    { day: 'Thu', amount: 65000 },
    { day: 'Fri', amount: 48000 },
    { day: 'Sat', amount: 72000 },
    { day: 'Sun', amount: 58000 }
  ];
  
  const maxAmount = Math.max(...data.map(d => d.amount));
  
  data.forEach((point, index) => {
    const x = (index / (data.length - 1)) * canvas.width;
    const y = canvas.height - (point.amount / maxAmount) * canvas.height * 0.8;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
};

// Utility functions
const formatCurrency = (amount) => {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp0';
  }
  const numAmount = parseFloat(amount) || 0;
  return `Rp${Math.round(numAmount).toLocaleString('id-ID')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
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
  await Promise.all([
    fetchBalanceInfo(),
    fetchBalanceStats(),
    fetchTransactions()
  ]);
  await nextTick();
  renderSpendingChart();
});
</script>

<style scoped>
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
}

.card-statistic-1 .card-wrap {
  padding: 1.5rem 1.5rem 1.5rem 7rem;
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

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  transition: width 0.6s ease;
}
</style>
