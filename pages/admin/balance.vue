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
      <p class="section-lead">Manage advertising balance for all brands</p>
      
      <!-- Balance Statistics -->
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-coins"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Balance</h4></div>
              <div class="card-body">{{ balanceStats.totalBalance.toLocaleString() }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-plus-circle"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Top-ups</h4></div>
              <div class="card-body">{{ balanceStats.totalTopups.toLocaleString() }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-minus-circle"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Spent</h4></div>
              <div class="card-body">{{ balanceStats.totalSpent.toLocaleString() }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-building"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Active Brands</h4></div>
              <div class="card-body">{{ balanceStats.activeBrands }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance Management Panel -->
      <div class="row">
        <div class="col-lg-4 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>Balance Top-up</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="processTopup">
                <div class="form-group">
                  <label>Select Brand</label>
                  <select class="form-control" v-model="topupForm.brandId" required @change="onBrandSelect">
                    <option value="">Choose Brand</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }} (Balance: {{ brand.balance || 0 }})
                    </option>
                  </select>
                </div>
                
                <div class="form-group" v-if="selectedBrand">
                  <label>Current Balance</label>
                  <div class="input-group">
                    <input type="number" class="form-control" :value="selectedBrand.balance || 0" readonly>
                    <div class="input-group-append">
                      <span class="input-group-text">balance</span>
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Top-up Amount</label>
                  <div class="input-group">
                    <input type="number" class="form-control" v-model="topupForm.amount" min="1" max="100000" placeholder="Enter amount" required>
                    <div class="input-group-append">
                      <span class="input-group-text">balance</span>
                    </div>
                  </div>
                  <small class="form-text text-muted">1 balance = 15 seconds of video advertising</small>
                </div>
                
                <div class="form-group">
                  <label>Payment Method</label>
                  <select class="form-control" v-model="topupForm.paymentMethod" required>
                    <option value="">Select Payment Method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="digital_wallet">Digital Wallet</option>
                    <option value="admin_credit">Admin Credit (Free)</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Reference/Notes</label>
                  <textarea class="form-control" v-model="topupForm.reference" rows="3" placeholder="Payment reference or notes"></textarea>
                </div>
                
                <div class="form-group" v-if="topupForm.amount && selectedBrand">
                  <label>Balance Summary</label>
                  <div class="alert alert-info">
                    <div class="d-flex justify-content-between">
                      <span>Current Balance:</span>
                      <span>{{ selectedBrand.balance || 0 }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>Top-up Amount:</span>
                      <span>+{{ topupForm.amount }}</span>
                    </div>
                    <hr class="my-2">
                    <div class="d-flex justify-content-between font-weight-bold">
                      <span>New Balance:</span>
                      <span>{{ (selectedBrand.balance || 0) + parseInt(topupForm.amount || 0) }}</span>
                    </div>
                    <small class="text-muted">
                      Equivalent to {{ Math.floor(((selectedBrand.balance || 0) + parseInt(topupForm.amount || 0)) * 15 / 60) }} minutes of video time
                    </small>
                  </div>
                </div>
                
                <div class="form-group mb-0">
                  <button type="submit" class="btn btn-primary mr-2" :disabled="processing">
                    <i class="fas fa-spinner fa-spin" v-if="processing"></i>
                    <i class="fas fa-plus-circle" v-else></i>
                    Process Top-up
                  </button>
                  <button type="button" class="btn btn-secondary" @click="resetTopupForm">
                    <i class="fas fa-times"></i> Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h4>Quick Actions</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-6">
                  <button class="btn btn-outline-primary btn-block" @click="bulkTopup">
                    <i class="fas fa-users"></i><br>
                    Bulk Top-up
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-success btn-block" @click="exportTransactions">
                    <i class="fas fa-download"></i><br>
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-8 col-md-12">
          <!-- Brand Balance Overview -->
          <div class="card">
            <div class="card-header">
              <h4>Brand Balance Overview</h4>
              <div class="card-header-form">
                <form>
                  <div class="input-group">
                    <select class="form-control" v-model="filterStatus">
                      <option value="">All Brands</option>
                      <option value="active">Active Brands</option>
                      <option value="low_balance">Low Balance (&lt; 100)</option>
                      <option value="zero_balance">Zero Balance</option>
                    </select>
                    <input type="text" class="form-control ml-2" placeholder="Search brands..." v-model="searchQuery">
                    <div class="input-group-btn">
                      <button class="btn btn-primary"><i class="fas fa-search"></i></button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Current Balance</th>
                      <th>Total Spent</th>
                      <th>Total Top-ups</th>
                      <th>Last Activity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="brand in filteredBrands" :key="brand.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar avatar-sm mr-3">
                            <img :src="brand.logo || '/img/default-brand.png'" :alt="brand.name">
                          </div>
                          <div>
                            <div class="font-weight-600">{{ brand.name }}</div>
                            <div class="text-muted small">{{ brand.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="font-weight-600" :class="getBalanceClass(brand.balance)">
                          {{ brand.balance || 0 }}
                        </div>
                        <div class="text-muted small">
                          {{ Math.floor((brand.balance || 0) * 15 / 60) }}m video time
                        </div>
                      </td>
                      <td>
                        <div class="font-weight-600">{{ brand.totalSpent || 0 }}</div>
                        <div class="text-muted small">balance spent</div>
                      </td>
                      <td>
                        <div class="font-weight-600">{{ brand.totalTopups || 0 }}</div>
                        <div class="text-muted small">total added</div>
                      </td>
                      <td>
                        <div>{{ formatDate(brand.lastActivity) }}</div>
                        <div class="text-muted small">{{ getTimeAgo(brand.lastActivity) }}</div>
                      </td>
                      <td>
                        <span class="badge" :class="getBrandStatusClass(brand)">
                          {{ getBrandStatus(brand) }}
                        </span>
                      </td>
                      <td>
                        <div class="dropdown">
                          <a href="#" data-toggle="dropdown" class="btn btn-sm btn-outline-primary dropdown-toggle">Actions</a>
                          <div class="dropdown-menu">
                            <a href="#" class="dropdown-item" @click="quickTopup(brand)">Quick Top-up</a>
                            <a href="#" class="dropdown-item" @click="viewTransactions(brand.id)">View Transactions</a>
                            <a href="#" class="dropdown-item" @click="viewAnalytics(brand.id)">View Analytics</a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item" @click="adjustBalance(brand)">Adjust Balance</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Recent Transactions</h4>
              <div class="card-header-action">
                <a href="#" class="btn btn-primary" @click="viewAllTransactions">View All</a>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Brand</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                      <th>Reference</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="transaction in recentTransactions" :key="transaction.id">
                      <td>
                        <div>{{ formatDate(transaction.createdAt) }}</div>
                        <div class="text-muted small">{{ formatTime(transaction.createdAt) }}</div>
                      </td>
                      <td>
                        <div class="font-weight-600">{{ getBrandName(transaction.brandId) }}</div>
                      </td>
                      <td>
                        <span class="badge" :class="getTransactionTypeClass(transaction.type)">
                          {{ transaction.type }}
                        </span>
                      </td>
                      <td>
                        <div class="font-weight-600" :class="transaction.type === 'topup' ? 'text-success' : 'text-danger'">
                          {{ transaction.type === 'topup' ? '+' : '-' }}{{ transaction.amount }}
                        </div>
                      </td>
                      <td>
                        <div class="font-weight-600">{{ transaction.balanceAfter }}</div>
                      </td>
                      <td>
                        <div class="text-truncate" style="max-width: 150px;" :title="transaction.reference">
                          {{ transaction.reference || '-' }}
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="getTransactionStatusClass(transaction.status)">
                          {{ transaction.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'

definePageMeta({
  middleware: 'auth'
})

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Reactive data
const brands = ref([])
const recentTransactions = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const processing = ref(false)
const selectedBrand = ref(null)

const balanceStats = ref({
  totalBalance: 0,
  totalTopups: 0,
  totalSpent: 0,
  activeBrands: 0
})

const topupForm = ref({
  brandId: '',
  amount: '',
  paymentMethod: '',
  reference: ''
})

// Computed properties
const filteredBrands = computed(() => {
  let filtered = brands.value
  
  if (filterStatus.value) {
    switch (filterStatus.value) {
      case 'active':
        filtered = filtered.filter(brand => (brand.balance || 0) > 0)
        break
      case 'low_balance':
        filtered = filtered.filter(brand => (brand.balance || 0) < 100 && (brand.balance || 0) > 0)
        break
      case 'zero_balance':
        filtered = filtered.filter(brand => (brand.balance || 0) === 0)
        break
    }
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(brand => 
      brand.name.toLowerCase().includes(query) ||
      brand.email.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// Fetch data
const fetchBrands = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/brands`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (data.success) {
      brands.value = data.data || []
      calculateStats()
    }
  } catch (error) {
    console.error('Error fetching brands:', error)
  }
}

const fetchTransactions = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/balance/transactions?limit=10`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (data.success) {
      recentTransactions.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
  }
}

// Calculate statistics
const calculateStats = () => {
  const totalBalance = brands.value.reduce((sum, brand) => sum + (brand.balance || 0), 0)
  const totalTopups = brands.value.reduce((sum, brand) => sum + (brand.totalTopups || 0), 0)
  const totalSpent = brands.value.reduce((sum, brand) => sum + (brand.totalSpent || 0), 0)
  const activeBrands = brands.value.filter(brand => (brand.balance || 0) > 0).length
  
  balanceStats.value = {
    totalBalance,
    totalTopups,
    totalSpent,
    activeBrands
  }
}

// Brand selection
const onBrandSelect = () => {
  selectedBrand.value = brands.value.find(brand => brand.id === topupForm.value.brandId)
}

// Process top-up
const processTopup = async () => {
  try {
    processing.value = true
    const accessToken = localStorage.getItem('access_token')
    
    const response = await fetchWithAuth(`${apiUrl}/api/balance/topup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(topupForm.value)
    })
    
    const data = await response.json()
    if (data.success) {
      await fetchBrands()
      await fetchTransactions()
      resetTopupForm()
      // Show success message
    }
  } catch (error) {
    console.error('Error processing top-up:', error)
  } finally {
    processing.value = false
  }
}

// Reset top-up form
const resetTopupForm = () => {
  topupForm.value = {
    brandId: '',
    amount: '',
    paymentMethod: '',
    reference: ''
  }
  selectedBrand.value = null
}

// Quick top-up
const quickTopup = (brand) => {
  topupForm.value.brandId = brand.id
  selectedBrand.value = brand
  topupForm.value.amount = '1000' // Default amount
  topupForm.value.paymentMethod = 'admin_credit'
}

// Navigation functions
const viewTransactions = (brandId) => {
  navigateTo(`/admin/transactions?brand_id=${brandId}`)
}

const viewAnalytics = (brandId) => {
  navigateTo(`/admin/analytics?brand_id=${brandId}`)
}

const viewAllTransactions = () => {
  navigateTo('/admin/transactions')
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString()
}

const getTimeAgo = (dateString) => {
  if (!dateString) return '-'
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const getBrandName = (brandId) => {
  const brand = brands.value.find(b => b.id === brandId)
  return brand ? brand.name : 'Unknown Brand'
}

const getBalanceClass = (balance) => {
  if (!balance || balance === 0) return 'text-danger'
  if (balance < 100) return 'text-warning'
  return 'text-success'
}

const getBrandStatus = (brand) => {
  const balance = brand.balance || 0
  if (balance === 0) return 'No Balance'
  if (balance < 100) return 'Low Balance'
  return 'Active'
}

const getBrandStatusClass = (brand) => {
  const balance = brand.balance || 0
  if (balance === 0) return 'badge-danger'
  if (balance < 100) return 'badge-warning'
  return 'badge-success'
}

const getTransactionTypeClass = (type) => {
  switch (type) {
    case 'topup': return 'badge-success'
    case 'deduction': return 'badge-danger'
    case 'adjustment': return 'badge-warning'
    default: return 'badge-secondary'
  }
}

const getTransactionStatusClass = (status) => {
  switch (status) {
    case 'completed': return 'badge-success'
    case 'pending': return 'badge-warning'
    case 'failed': return 'badge-danger'
    default: return 'badge-secondary'
  }
}

// Additional functions
const bulkTopup = () => {
  // Navigate to bulk top-up page or show modal
  navigateTo('/admin/bulk-topup')
}

const exportTransactions = () => {
  // Export transactions to CSV/Excel
  window.open(`${apiUrl}/api/balance/export`, '_blank')
}

const adjustBalance = (brand) => {
  // Show balance adjustment modal
  topupForm.value.brandId = brand.id
  selectedBrand.value = brand
  topupForm.value.paymentMethod = 'admin_credit'
}

// Lifecycle
onMounted(() => {
  fetchBrands()
  fetchTransactions()
})
</script>

<style scoped>
.card-statistic-1 {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 2rem;
  padding: 20px;
  color: #fff;
  border-radius: 5px 0 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-primary { background: #6777ef; }
.bg-success { background: #47c363; }
.bg-warning { background: #ffa426; }
.bg-info { background: #3abaf4; }
</style>