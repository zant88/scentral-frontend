<template>
  <section class="section">
    <div class="section-header">
      <h1>Welcome to Scentral Dashboard</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Overview</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Business Overview</h2>
      <p class="section-lead">Monitor sales, users, devices, and revenue in real time.</p>
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12" v-for="card in statCards" :key="card.title">
          <div class="card card-statistic-1">
            <div class="card-icon" :class="card.bg"><i :class="card.icon"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>{{ card.title }}</h4></div>
              <div class="card-body">{{ card.value }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-lg-8 col-12 mb-4">
          <div class="card">
            <div class="card-header"><h4>Sales Trend</h4></div>
            <div class="card-body">
              <canvas id="salesChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-12 mb-4">
          <div class="card">
            <div class="card-header"><h4>Quick Stats</h4></div>
            <div class="card-body">
              <ul class="list-group">
                <li class="list-group-item">Highest Sale: Rp. {{ highestSale }}</li>
                <li class="list-group-item">Lowest Sale: Rp. {{ lowestSale }}</li>
                <li class="list-group-item">Average Sale: Rp. {{ averageSale }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header"><h4>Recent Sales Report</h4></div>
            <div class="card-body table-responsive">
              <table class="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sales Code</th>
                    <th>Sale Date</th>
                    <th>Device</th>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Customer</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(sale, idx) in sales" :key="sale.id">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ sale.sales_code }}</td>
                    <td>{{ new Date(sale.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) }}</td>
                    <td>{{ sale.machine?.machine_code || '-' }}</td>
                    <td>{{ sale.product?.name || '-' }}</td>
                    <td>{{ sale.product?.brand?.name || '-' }}</td>
                    <td>{{ sale.customer_id == 0 ? 'Guest' : sale.customer_id }}</td>
                    <td>Rp. {{ sale.total_price }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const stats = ref({ sales: 0, users: 0, devices: 0, revenue: 0 });
const sales = ref([]);
const chartInstance = ref(null);
const statCards = computed(() => [
  { title: 'Total Sales', value: stats.value.sales, icon: 'fas fa-shopping-cart', bg: 'bg-primary' },
  { title: 'Total Users', value: stats.value.users, icon: 'fas fa-users', bg: 'bg-success' },
  { title: 'Total Devices', value: stats.value.devices, icon: 'fas fa-cube', bg: 'bg-warning' },
  { title: 'Total Revenue', value: `Rp. ${stats.value.revenue}`, icon: 'fas fa-money-bill-wave', bg: 'bg-info' },
]);
const highestSale = computed(() => sales.value.length ? Math.max(...sales.value.map(s => s.total_price || 0)) : 0);
const lowestSale = computed(() => sales.value.length ? Math.min(...sales.value.map(s => s.total_price || 0)) : 0);
const averageSale = computed(() => sales.value.length ? Math.round(sales.value.reduce((sum, s) => sum + (s.total_price || 0), 0) / sales.value.length) : 0);

const fetchStats = async () => {
  const accessToken = localStorage.getItem('access_token');
  // Fetch total sales and revenue
  const salesRes = await fetchWithAuth(`${apiUrl}/api/sales?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const salesData = await salesRes.json();
  stats.value.sales = salesData.meta?.total || 0;
  stats.value.revenue = salesData.data?.reduce((sum, s) => sum + (s.total_price || 0), 0);

  // Fetch total users from user.go endpoint
  const usersRes = await fetchWithAuth(`${apiUrl}/api/users?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const usersData = await usersRes.json();
  stats.value.users = usersData.meta?.total || 0;

  // Fetch total devices from machine.go endpoint
  const devicesRes = await fetchWithAuth(`${apiUrl}/api/machines?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const devicesData = await devicesRes.json();
  stats.value.devices = devicesData.meta?.total || 0;
};

const fetchSales = async () => {
  const accessToken = localStorage.getItem('access_token');
  const res = await fetchWithAuth(`${apiUrl}/api/sales?page=1&limit=10`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const data = await res.json();
  sales.value = data.data || [];
  setTimeout(drawChart, 300); // Wait for DOM
};

const drawChart = () => {
  if (!window.Chart) return;
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;
  // Destroy previous chart instance if exists
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
  // Filter sales for last 14 days
  const now = new Date();
  const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13); // 14 days including today
  const filteredSales = sales.value.filter(s => {
    const saleDate = new Date(s.created_at);
    return saleDate >= twoWeeksAgo && saleDate <= now;
  });
  // Group by date and sum total_price
  const dateMap = {};
  filteredSales.forEach(s => {
    const dateStr = new Date(s.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
    if (!dateMap[dateStr]) dateMap[dateStr] = 0;
    dateMap[dateStr] += s.total_price || 0;
  });
  // Get all dates in last 14 days
  const labels = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13 + i);
    labels.push(d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }));
  }
  // Prepare data for chart
  const data = labels.map(date => dateMap[date] || 0);
  chartInstance.value = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Price',
        data,
        borderColor: '#6777ef',
        backgroundColor: 'rgba(103,119,239,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#6777ef',
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { beginAtZero: true, title: { display: true, text: 'Total Price' } },
      },
    },
  });
};

onMounted(() => {
  // Check authentication on client side
  const accessToken = localStorage.getItem('access_token');
  const currentPath = window.location.pathname;
  
  // If not logged in and not on login page or video player page, redirect to login
  if (!accessToken && currentPath !== '/login' && currentPath !== '/video-player') {
    window.location.href = '/login';
    return;
  }
  
  fetchStats();
  fetchSales();
});
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
}
.bg-primary { background: #6777ef; }
.bg-success { background: #47c363; }
.bg-warning { background: #ffa426; }
.bg-info { background: #3abaf4; }
.table-bordered { border: 1px solid #dee2e6; }
.table-responsive { overflow-x: auto; }
</style>
<!-- Add Chart.js via CDN in your public/index.html or nuxt.config.ts for chart to work -->
