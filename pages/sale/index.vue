<template>
  <section class="section">
    <div class="section-header">
      <h1>Sales</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">Sales</h2>
      <p class="section-lead">Daftar transaksi penjualan yang terdaftar di sistem.</p>
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">&nbsp;</div>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="fetchSales(1)" class="form-control" placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="width: 60px;">#</th>
                <th>Sales Code</th>
                <th>Sale Date</th>
                <th>Device</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sale, idx) in sales" :key="sale.id">
                <td>{{ (meta.page - 1) * meta.limit + idx + 1 }}</td>
                <td>{{ sale.sales_code }}</td>
                <td>{{ new Date(sale.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) }}</td>
                <td>{{ sale.machine?.machine_code || '-' }}</td>
                <td>{{ sale.product?.name || '-' }}</td>
                <td>{{ sale.product?.brand?.name || '-' }}</td>
                <td>{{ sale.customer_id == 0 ? 'Guest' : sale.customer_id }}</td>
                <td>{{ sale.quantity }}</td>
                <td>Rp. {{ sale.total_price }}</td>
                <td>
                  <span :class="{'badge badge-success': sale.payment_status === 'paid', 'badge badge-warning': sale.payment_status === 'pending'}">
                    {{ sale.payment_status }}
                  </span>
                </td>
                <td>
                  <button v-if="sale.payment_status === 'pending'" class="btn btn-primary btn-sm" @click="confirmApprove(sale)">
                    Approve Payment
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <nav v-if="meta.pages > 0" class="mt-4">
            <ul class="pagination">
              <li class="page-item" :class="{disabled: meta.page === 1}">
                <button class="page-link" @click="fetchSales(meta.page - 1)">&laquo;</button>
              </li>
              <li v-for="p in meta.pages" :key="p" class="page-item" :class="{active: meta.page === p}">
                <button class="page-link" @click="fetchSales(p)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{disabled: meta.page === meta.pages}">
                <button class="page-link" @click="fetchSales(meta.page + 1)">&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import Swal from 'sweetalert2';
import { ref, onMounted } from 'vue';
import { fetchWithAuth } from '~/utils/auth.js';
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const sales = ref([]);
const querySearch = ref('');
const meta = ref({ page: 1, limit: 20, total: 0, pages: 1 });

const fetchSales = async (page = 1) => {
  const accessToken = localStorage.getItem('access_token');
  let url = `${apiUrl}/api/sales?page=${page}&limit=${meta.value.limit}`;
  if (querySearch.value) {
    url += `&q=${encodeURIComponent(querySearch.value)}`;
  }
  const res = await fetchWithAuth(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await res.json();
  sales.value = data.data || [];
  meta.value = data.meta || meta.value;
  console.log("MEta is");
  console.log(meta.value);
};

const confirmApprove = async (sale) => {
  const result = await Swal.fire({
    title: 'Approve Payment?',
    text: `Approve payment for ${sale.sales_code}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, approve!',
    cancelButtonText: 'Cancel',
  });
  if (result.isConfirmed) {
    await approvePayment(sale.id);
    await fetchSales(meta.value.page);
    Swal.fire('Approved!', 'Payment has been approved.', 'success');
  }
};

const approvePayment = async (id) => {
  const accessToken = localStorage.getItem('access_token');
  await fetchWithAuth(`${apiUrl}/api/sales/${id}/pay`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
};

onMounted(() => {
  fetchSales(1);
});
</script>

<style scoped>
.badge-success {
  background: #47c363;
}
.badge-warning {
  background: #ffa426;
}
</style>
