<template>
    <section class="section">
      <div class="section-header">
        <h1>Device</h1>
      </div>
      <div class="section-body">
        <h2 class="section-title">Device</h2>
        <p class="section-lead">Daftar device yang terdaftar di sistem.</p>
        <div class="card">
          <div class="card-header actionable">
            <div class="left-action">
              &nbsp;
            </div>
            <div class="right-action">
              <input type="search" v-model="querySearch" @keyup.enter="getDeviceList" class="form-control" placeholder="Type then press enter" />
            </div>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th style="width: 60px;">#</th>
                  <th>Code</th>
                  <th>Machine Code</th>
                  <th>Position</th>
                  <th style="width: 180px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in deviceList" :key="item.id">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <span v-if="item.status.toLowerCase() === 'active'" class=""><i class="fas fa-circle text-success"></i></span>
                    <span v-else-if="item.status.toLowerCase() === 'maintenance'" class=""><i class="fas fa-circle  text-warning"></i></span>
                    <span v-else class=""><i class="fas fa-circle text-danger"></i></span>
                    &nbsp;
                    <NuxtLink :title="`Status : ${item.status}`" :to="`/device/update/${item.id}`">{{ item.code }}</NuxtLink>
                  </td>
                  <td>{{ item.machine_code }}</td>
                  <td>{{ item.position }}</td>
                  <td style="text-align: center;">
                    <NuxtLink :to="`/device/configure/${item.id}`" class="btn btn-outline-primary" title="Configure Products">
                      <i class="fas fa-cogs"></i>
                    </NuxtLink>
                    &nbsp;
                    <NuxtLink :to="`/device/update/${item.id}`" class="btn btn-outline-info" title="Configure Default Video">
                      <i class="fas fa-video"></i>
                    </NuxtLink>
                    &nbsp;
                    <NuxtLink :to="`/video-player?machineId=${item.code}`" target="_blank" class="btn btn-outline-success" title="Video Player">
                      <i class="fas fa-play"></i>
                    </NuxtLink>
                  </td>
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
  const deviceList = ref([]);
  const querySearch = ref('');
  
  const getDeviceList = async () => {
    try {
      let url = `${apiUrl}/api/device/`;
      if (querySearch.value) {
        url += `?q=${encodeURIComponent(querySearch.value)}`;
      }
      const accessToken = localStorage.getItem('access_token');
      const response = await fetchWithAuth(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data.success) {
        deviceList.value = data.data;
      } else {
        $toast.error(data.message || 'Failed to fetch devices');
      }
    } catch (error) {
      $toast.error('Failed to fetch products');
    }
  };
  
  onMounted(() => {
    getDeviceList();
  });
  </script>
  