<template>
  <section class="section">
    <div class="section-header">
      <h1>Dashboard</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">Overview</h2>
      <p class="section-lead">Ringkasan data penjualan, pengguna, dan perangkat di sistem.</p>
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-shopping-cart"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Sales</h4></div>
              <div class="card-body">{{ stats.sales }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-users"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Users</h4></div>
              <div class="card-body">{{ stats.users }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-cube"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Devices</h4></div>
              <div class="card-body">{{ stats.devices }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-money-bill-wave"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Total Revenue</h4></div>
              <div class="card-body">Rp. {{ stats.revenue }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header"><h4>Sales Report</h4></div>
            <div class="card-body">
              <table class="table table-striped">
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
import { ref, onMounted } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const stats = ref({ sales: 0, users: 0, devices: 0, revenue: 0 });
const sales = ref([]);

const fetchStats = async () => {
  const accessToken = localStorage.getItem('access_token');
  // Example endpoints, adjust as needed
  const salesRes = await fetchWithAuth(`${apiUrl}/api/sales?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const salesData = await salesRes.json();
  stats.value.sales = salesData.meta?.total || 0;
  stats.value.revenue = salesData.data?.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const usersRes = await fetchWithAuth(`${apiUrl}/api/users?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const usersData = await usersRes.json();
  stats.value.users = usersData.meta?.total || 0;
  const devicesRes = await fetchWithAuth(`${apiUrl}/api/machines?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const devicesData = await devicesRes.json();
  stats.value.devices = devicesData.meta?.total || 0;
};

const fetchSales = async () => {
  const accessToken = localStorage.getItem('access_token');
  const res = await fetchWithAuth(`${apiUrl}/api/sales?page=1&limit=10`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  const data = await res.json();
  sales.value = data.data || [];
};

onMounted(() => {
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
</style>
