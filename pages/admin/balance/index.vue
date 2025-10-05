<template>
  <section class="section">
    <div class="section-header">
      <h1>Balance Management</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Balance Management</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Brand Balance Management</h2>
      <p class="section-lead">
        Manage brand balances, transactions, and financial operations.
      </p>
      <div class="card">
        <div class="card-header actionable">
          <client-only>
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" @click="showBulkTopUp" class="btn btn-icon btn-success note-btn" data-toggle="tooltip"
                title="Bulk Top Up" v-if="anyChecked"><i class="fas fa-plus"></i></a>
              <a href="#" @click="exportTransactions" class="btn btn-icon btn-info note-btn" data-toggle="tooltip"
                title="Export Transactions"><i class="fas fa-download"></i></a>
            </div>
          </client-only>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="getBrandList" class="form-control" placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-3">
              <select v-model="filterBalanceStatus" @change="getBrandList" class="form-control">
                <option value="">All Balance Status</option>
                <option value="sufficient">Sufficient Balance (>100k)</option>
                <option value="low">Low Balance (10k-100k)</option>
                <option value="critical">Critical Balance (<10k)</option>
                <option value="zero">Zero Balance</option>
              </select>
            </div>
            <div class="col-md-3">
              <select v-model="sortBy" @change="getBrandList" class="form-control">
                <option value="name">Sort by Name</option>
                <option value="balance">Sort by Balance</option>
                <option value="total_spend">Sort by Total Spend</option>
                <option value="last_transaction">Sort by Last Transaction</option>
              </select>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label>Total System Balance</label>
                <div class="form-control-plaintext text-success font-weight-bold">
                  {{ formatCurrency(totalSystemBalance) }}
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label>Active Brands</label>
                <div class="form-control-plaintext">
                  {{ activeBrandsCount }} / {{ brands.length }}
                </div>
              </div>
            </div>
          </div>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                <th class="number-cell" scope="col">#</th>
                <th scope="col">Brand</th>
                <th scope="col">Current Balance</th>
                <th scope="col">Total Spend</th>
                <th scope="col">Last Transaction</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(brand, i) in brands" :key="brand.id">
                <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="brand.id" /></td>
                <td scope="row">{{ i + 1 }}</td>
                <td>
                  <div class="brand-info">
                    <div class="d-flex align-items-center">
                      <img v-if="brand.logo_url" :src="brand.logo_url" class="brand-logo mr-2" />
                      <div>
                        <strong>{{ brand.name }}</strong>
                        <div class="text-muted small">{{ brand.email || 'No email' }}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="balance-info">
                    <div :class="getBalanceClass(brand.balance)" class="font-weight-bold">
                      {{ formatCurrency(brand.balance) }}
                    </div>
                    <div class="text-muted small">{{ getBalanceStatus(brand.balance) }}</div>
                  </div>
                </td>
                <td>
                  <div class="spend-info">
                    <div>{{ formatCurrency(brand.total_spend || 0) }}</div>
                    <div class="text-muted small">{{ brand.total_transactions || 0 }} transactions</div>
                  </div>
                </td>
                <td>
                  <div class="transaction-info">
                    <div v-if="brand.last_transaction">
                      {{ formatDate(brand.last_transaction.created_at) }}
                      <div class="text-muted small">{{ brand.last_transaction.type }}</div>
                    </div>
                    <div v-else class="text-muted">No transactions</div>
                  </div>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(brand.is_active, brand.balance)" class="badge">
                    {{ getBrandStatus(brand.is_active, brand.balance) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <div class="btn-group">
                    <button @click="showTopUp(brand)" class="btn btn-sm btn-success" title="Top Up">
                      <i class="fas fa-plus"></i>
                    </button>
                    <button @click="showTransactions(brand)" class="btn btn-sm btn-info" title="View Transactions">
                      <i class="fas fa-list"></i>
                    </button>
                    <button @click="showAdjustBalance(brand)" class="btn btn-sm btn-warning" title="Adjust Balance">
                      <i class="fas fa-balance-scale"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Up Modal -->
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
                  <div class="col-12 mb-3">
                    <label class="form-label">Payment Method</label>
                    <select v-model="paymentMethod" class="form-control">
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="adjustment">System Adjustment</option>
                    </select>
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label">Notes</label>
                    <textarea v-model="topUpNotes" class="form-control" rows="3" placeholder="Enter notes for this transaction"></textarea>
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

      <!-- Adjust Balance Modal -->
      <div v-if="isAdjustModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeAdjust">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Adjust Balance - {{ adjustBrandName }}</h5>
              <button type="button" class="btn-close" @click="closeAdjust"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitAdjust" class="needs-validation" novalidate>
                <div class="row">
                  <div class="col-12 mb-3">
                    <label class="form-label">Current Balance</label>
                    <div class="form-control-plaintext">{{ formatCurrency(currentBalance) }}</div>
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label">Adjustment Type *</label>
                    <select v-model="adjustmentType" @change="clearAdjustmentAmount" class="form-control" required>
                      <option value="">Select Type</option>
                      <option value="credit">Credit (Add Balance)</option>
                      <option value="debit">Debit (Remove Balance)</option>
                    </select>
                    <div class="invalid-feedback">
                      Please select an adjustment type.
                    </div>
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label">Adjustment Amount *</label>
                    <div class="input-group">
                      <span class="input-group-text">Rp</span>
                      <input 
                        type="text" 
                        v-model="adjustAmountFormatted" 
                        @input="handleAdjustAmountInput"
                        class="form-control" 
                        placeholder="Enter amount" 
                        required 
                      />
                    </div>
                    <div class="invalid-feedback">
                      Please enter a valid amount.
                    </div>
                  </div>
                  <div class="col-12 mb-3">
                    <label class="form-label">Reason *</label>
                    <textarea v-model="adjustReason" class="form-control" rows="3" placeholder="Enter reason for adjustment" required></textarea>
                    <div class="invalid-feedback">
                      Please provide a reason.
                    </div>
                  </div>
                  <div class="col-12 mb-3" v-if="adjustAmount">
                    <label class="form-label">New Balance (Preview)</label>
                    <div class="form-control-plaintext" :class="getNewBalanceClass()">
                      {{ formatCurrency(getNewBalance()) }}
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeAdjust">Cancel</button>
                  <button type="submit" class="btn btn-warning">Adjust Balance</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Modal -->
      <div v-if="isTransactionsModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeTransactions">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Transaction History - {{ transactionsBrandName }}</h5>
              <button type="button" class="btn-close" @click="closeTransactions"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-4">
                  <input type="date" v-model="transactionStartDate" @change="getTransactions" class="form-control" />
                </div>
                <div class="col-md-4">
                  <input type="date" v-model="transactionEndDate" @change="getTransactions" class="form-control" />
                </div>
                <div class="col-md-4">
                  <select v-model="transactionType" @change="getTransactions" class="form-control">
                    <option value="">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
              </div>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Reference</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in transactions" :key="transaction.id">
                    <td>{{ formatDateTime(transaction.created_at) }}</td>
                    <td>
                      <span :class="getTransactionBadgeClass(transaction.type)" class="badge">
                        {{ transaction.type?.toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ transaction.description || 'No description' }}</td>
                    <td :class="getTransactionAmountClass(transaction.type)">
                      {{ formatTransactionAmount(transaction.amount, transaction.type) }}
                    </td>
                    <td>{{ formatCurrency(transaction.balance_after) }}</td>
                    <td>{{ transaction.reference_id || 'N/A' }}</td>
                    <td>{{ transaction.created_by || 'System' }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="transactions.length === 0" class="text-center py-3">
                <p class="text-muted">No transactions found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})

import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '~/utils/auth.js';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const checkedItems = ref([]);
const brands = ref([]);
const isTopUpModal = ref(false);
const isAdjustModal = ref(false);
const isTransactionsModal = ref(false);
const $toast = useToast();
const querySearch = ref('');
const filterBalanceStatus = ref('');
const sortBy = ref('name');
const anyChecked = computed(() => checkedItems.value.length > 0);

// Top-up related variables
const topUpBrandID = ref(null);
const topUpBrandName = ref('');
const topUpAmount = ref('');
const topUpAmountFormatted = ref('');
const currentBalance = ref(0);
const paymentMethod = ref('bank_transfer');
const topUpNotes = ref('');

// Adjust balance related variables
const adjustBrandID = ref(null);
const adjustBrandName = ref('');
const adjustmentType = ref('');
const adjustAmount = ref('');
const adjustAmountFormatted = ref('');
const adjustReason = ref('');

// Transactions related variables
const transactionsBrandID = ref(null);
const transactionsBrandName = ref('');
const transactions = ref([]);
const transactionStartDate = ref('');
const transactionEndDate = ref('');
const transactionType = ref('');

// Computed properties
const totalSystemBalance = computed(() => {
  return brands.value.reduce((sum, brand) => sum + (brand.balance || 0), 0);
});

const activeBrandsCount = computed(() => {
  return brands.value.filter(brand => brand.is_active).length;
});

const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = brands.value.map(b => b.id);
  } else {
    checkedItems.value = [];
  }
}

const getBrandList = async () => {
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/brand/`;
  const params = new URLSearchParams();
  
  if (querySearch.value) params.append('search', querySearch.value);
  if (filterBalanceStatus.value) params.append('balance_status', filterBalanceStatus.value);
  if (sortBy.value) params.append('sort_by', sortBy.value);
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  try {
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    brands.value = data.data || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    $toast.error('Failed to fetch brands', { duration: 5000, position: 'top-right' });
  }
}

onMounted(getBrandList);

// Top-up functions
function showTopUp(brand) {
  isTopUpModal.value = true;
  topUpBrandID.value = brand.id;
  topUpBrandName.value = brand.name;
  currentBalance.value = brand.balance || 0;
  topUpAmount.value = '';
  topUpAmountFormatted.value = '';
  topUpNotes.value = '';
  paymentMethod.value = 'bank_transfer';
}

function closeTopUp() {
  isTopUpModal.value = false;
  topUpBrandID.value = null;
  topUpBrandName.value = '';
  topUpAmount.value = '';
  topUpAmountFormatted.value = '';
  currentBalance.value = 0;
  topUpNotes.value = '';
  paymentMethod.value = 'bank_transfer';
}

const handleAmountInput = (event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  topUpAmount.value = value;
  topUpAmountFormatted.value = value ? parseInt(value).toLocaleString('id-ID') : '';
};

const submitTopUp = async () => {
  if (!topUpAmount.value || parseFloat(topUpAmount.value) <= 0) {
    $toast.error('Please enter a valid amount', { duration: 5000, position: 'top-right' });
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/balance/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        brand_id: topUpBrandID.value,
        amount: parseFloat(topUpAmount.value),
        payment_method: paymentMethod.value,
        notes: topUpNotes.value
      })
    });
    
    const data = await response.json();
    if (data.success) {
      $toast.success(`Balance topped up successfully! New balance: ${formatCurrency(data.new_balance)}`, { duration: 5000, position: 'top-right' });
      closeTopUp();
      getBrandList();
    } else {
      $toast.error(data.message || 'Failed to top up balance', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to top up balance', { duration: 5000, position: 'top-right' });
  }
};

// Adjust balance functions
function showAdjustBalance(brand) {
  isAdjustModal.value = true;
  adjustBrandID.value = brand.id;
  adjustBrandName.value = brand.name;
  currentBalance.value = brand.balance || 0;
  adjustmentType.value = '';
  adjustAmount.value = '';
  adjustAmountFormatted.value = '';
  adjustReason.value = '';
}

function closeAdjust() {
  isAdjustModal.value = false;
  adjustBrandID.value = null;
  adjustBrandName.value = '';
  adjustmentType.value = '';
  adjustAmount.value = '';
  adjustAmountFormatted.value = '';
  adjustReason.value = '';
}

const clearAdjustmentAmount = () => {
  adjustAmount.value = '';
  adjustAmountFormatted.value = '';
};

const handleAdjustAmountInput = (event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  adjustAmount.value = value;
  adjustAmountFormatted.value = value ? parseInt(value).toLocaleString('id-ID') : '';
};

const getNewBalance = () => {
  if (!adjustAmount.value) return currentBalance.value;
  const amount = parseFloat(adjustAmount.value);
  if (adjustmentType.value === 'credit') {
    return currentBalance.value + amount;
  } else if (adjustmentType.value === 'debit') {
    return currentBalance.value - amount;
  }
  return currentBalance.value;
};

const getNewBalanceClass = () => {
  const newBalance = getNewBalance();
  if (newBalance < 10000) return 'text-danger';
  if (newBalance < 100000) return 'text-warning';
  return 'text-success';
};

const submitAdjust = async () => {
  if (!adjustAmount.value || parseFloat(adjustAmount.value) <= 0) {
    $toast.error('Please enter a valid amount', { duration: 5000, position: 'top-right' });
    return;
  }

  if (!adjustReason.value.trim()) {
    $toast.error('Please provide a reason for the adjustment', { duration: 5000, position: 'top-right' });
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(`${apiUrl}/api/balance/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        brand_id: adjustBrandID.value,
        type: adjustmentType.value,
        amount: parseFloat(adjustAmount.value),
        reason: adjustReason.value
      })
    });
    
    const data = await response.json();
    if (data.success) {
      $toast.success(`Balance adjusted successfully! New balance: ${formatCurrency(data.new_balance)}`, { duration: 5000, position: 'top-right' });
      closeAdjust();
      getBrandList();
    } else {
      $toast.error(data.message || 'Failed to adjust balance', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to adjust balance', { duration: 5000, position: 'top-right' });
  }
};

// Transactions functions
function showTransactions(brand) {
  isTransactionsModal.value = true;
  transactionsBrandID.value = brand.id;
  transactionsBrandName.value = brand.name;
  
  // Set default date range to last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  transactionEndDate.value = endDate.toISOString().split('T')[0];
  transactionStartDate.value = startDate.toISOString().split('T')[0];
  transactionType.value = '';
  
  getTransactions();
}

function closeTransactions() {
  isTransactionsModal.value = false;
  transactionsBrandID.value = null;
  transactionsBrandName.value = '';
  transactions.value = [];
  transactionStartDate.value = '';
  transactionEndDate.value = '';
  transactionType.value = '';
}

const getTransactions = async () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    
    params.append('brand_id', transactionsBrandID.value);
    if (transactionStartDate.value) params.append('start_date', transactionStartDate.value);
    if (transactionEndDate.value) params.append('end_date', transactionEndDate.value);
    if (transactionType.value) params.append('type', transactionType.value);
    
    const response = await fetchWithAuth(`${apiUrl}/api/balance/transactions?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    
    const data = await response.json();
    if (data.success) {
      transactions.value = data.data || [];
    } else {
      $toast.error(data.message || 'Failed to fetch transactions', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    $toast.error('Failed to fetch transactions', { duration: 5000, position: 'top-right' });
  }
};

// Bulk operations
const showBulkTopUp = () => {
  // Implementation for bulk top-up
  $toast.info('Bulk top-up feature coming soon', { duration: 5000, position: 'top-right' });
};

const exportTransactions = () => {
  // Implementation for export transactions
  $toast.info('Export feature coming soon', { duration: 5000, position: 'top-right' });
};

// Utility functions
const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rp${Math.round(numAmount).toLocaleString('id-ID')}`;
};

const formatTransactionAmount = (amount, type) => {
  const prefix = type === 'credit' ? '+' : '-';
  return `${prefix}${formatCurrency(amount)}`;
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

const getBalanceClass = (balance) => {
  if (balance < 10000) return 'text-danger';
  if (balance < 100000) return 'text-warning';
  return 'text-success';
};

const getBalanceStatus = (balance) => {
  if (balance === 0) return 'Zero Balance';
  if (balance < 10000) return 'Critical';
  if (balance < 100000) return 'Low';
  return 'Sufficient';
};

const getBrandStatus = (isActive, balance) => {
  if (!isActive) return 'INACTIVE';
  if (balance === 0) return 'NO BALANCE';
  if (balance < 10000) return 'CRITICAL';
  return 'ACTIVE';
};

const getStatusBadgeClass = (isActive, balance) => {
  if (!isActive) return 'badge-secondary';
  if (balance === 0) return 'badge-danger';
  if (balance < 10000) return 'badge-warning';
  return 'badge-success';
};

const getTransactionBadgeClass = (type) => {
  switch (type) {
    case 'credit': return 'badge-success';
    case 'debit': return 'badge-danger';
    case 'refund': return 'badge-info';
    default: return 'badge-secondary';
  }
};

const getTransactionAmountClass = (type) => {
  return type === 'credit' ? 'text-success' : 'text-danger';
};
</script>

<style scoped>
.brand-info {
  min-width: 200px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.balance-info {
  min-width: 120px;
}

.spend-info {
  min-width: 120px;
}

.transaction-info {
  min-width: 120px;
}

.actions-cell {
  text-align: center;
  min-width: 120px;
}

.btn-group {
  display: flex;
  gap: 2px;
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

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.badge-success { background-color: #28a745; }
.badge-warning { background-color: #ffc107; color: #212529; }
.badge-danger { background-color: #dc3545; }
.badge-info { background-color: #17a2b8; }
.badge-secondary { background-color: #6c757d; }
</style>