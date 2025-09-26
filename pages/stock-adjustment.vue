<template>
  <div>
    <section class="section">
      <div class="section-header">
        <h1>Stock Adjustment</h1>
      </div>
      <div class="section-body">
        <div class="card">
          <div class="card-header">
            <h4>Stock Adjustment Log</h4>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Machine Code</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Prev Volume</th>
                    <th>New Volume</th>
                    <th>Adjustment</th>
                    <th>Reason</th>
                    <th>Notes</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in stockAdjustments" :key="item.id">
                    <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                    <td>{{ item.machine_product?.device?.machine_code || item.machine_product?.machine?.code }}</td>
                    <td>{{ item.machine_product?.product?.name || '' }}</td>
                    <td>
                      <span :class="getBadgeClassForType(item.adjustment_type)">{{ item.adjustment_type }}</span>
                    </td>
                    <td>{{ item.previous_volume }}</td>
                    <td>{{ item.new_volume }}</td>
                    <td>{{ item.adjustment_amount }}</td>
                    <td>{{ item.reason }}</td>
                    <td>{{ item.notes }}</td>
                    <td>{{ new Date(item.created_at).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <nav aria-label="Page navigation">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="fetchStockAdjustments(currentPage - 1)">Previous</a>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="fetchStockAdjustments(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="fetchStockAdjustments(currentPage + 1)">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchWithAuth } from '~/utils/auth';

const stockAdjustments = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(20);
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;

async function fetchStockAdjustments(page = 1) {
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/stock-adjustment?page=${page}&limit=${perPage.value}`);
    const data = await response.json();
    if (data.data) {
      stockAdjustments.value = data.data;
      currentPage.value = data.meta.page;
      totalPages.value = data.meta.total_pages;
    }
  } catch (error) {
    console.error('Error fetching stock adjustments:', error);
  }
}

function getBadgeClassForType(type) {
  switch (type) {
    case 'sales':
      return 'badge badge-light-danger';
    case 'opname':
      return 'badge badge-light-info';
    case 'refill':
      return 'badge badge-light-success';
    case 'correction':
      return 'badge badge-light-warning';
    default:
      return 'badge badge-light-secondary';
  }
}

onMounted(() => {
  fetchStockAdjustments();
});
</script>

<style scoped>
.badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-light-danger {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
}

.badge-light-info {
  color: #0dcaf0;
  background-color: rgba(13, 202, 240, 0.1);
  border: 1px solid #0dcaf0;
}

.badge-light-success {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
  border: 1px solid #198754;
}

.badge-light-warning {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
}

.badge-light-secondary {
  color: #6c757d;
  background-color: rgba(108, 117, 125, 0.1);
  border: 1px solid #6c757d;
}
</style>