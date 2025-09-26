<template>
  <section class="section">
    <div class="section-header">
      <h1>Product</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">Product</h2>
      <p class="section-lead">Daftar produk yang terdaftar di sistem.</p>
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <NuxtLink to="/product/create" class="btn btn-icon btn-primary note-btn"><i class="fas fa-plus"></i></NuxtLink>
          </div>
          <div class="right-action">
            <input type="search" v-model="querySearch" @keyup.enter="getProductList" class="form-control" placeholder="Type then press enter" />
          </div>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="width: 60px;">#</th>
                <th style="width: 100px; text-align: center;">Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in productList" :key="item.id">
                <td>{{ i + 1 }}</td>
                <td><img :src="item.image_url" class="logo" v-if="item.image_url" style="height:60px; margin: 10px;" /></td>
                <td>
                  <NuxtLink :to="`/product/update/${item.id}`">{{ item.name }}</NuxtLink>
                </td>
                <td>{{ item.brand ? item.brand.name : '' }}</td>
                <td>{{ item.sku }}</td>
                <td>{{ item.barcode }}</td>
                <td>{{ item.is_active ? 'Yes' : 'No' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import { fetchWithAuth } from '~/utils/auth.js';
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();
const productList = ref([]);
const querySearch = ref('');

const getProductList = async () => {
  try {
    let url = `${apiUrl}/api/product/`;
    if (querySearch.value) {
      url += `?q=${encodeURIComponent(querySearch.value)}`;
    }
    const accessToken = localStorage.getItem('access_token');
    const response = await fetchWithAuth(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.success) {
      productList.value = data.data;
    } else {
      $toast.error(data.message || 'Failed to fetch products');
    }
  } catch (error) {
    $toast.error('Failed to fetch products');
  }
};

onMounted(() => {
  getProductList();
});
</script>
