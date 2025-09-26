<template>
  <section class="section">
    <div class="section-header">
      <h1>Advertisement Management</h1>
    </div>
    <div class="section-body">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header actionable">
              <client-only>
                <div class="left-action">
                  <input class="check-all" type="checkbox" @change="toggleAll" />
                  <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteItem" v-if="anyChecked" data-toggle="tooltip"
                    title="Delete Selected"><i class="fa fa-trash"></i></a>
                  <nuxt-link to="/advertisement/create" class="btn btn-icon btn-primary note-btn">
                    <i class="fas fa-plus"></i>
                  </nuxt-link>
                </div>
              </client-only>
              <div class="right-action">
                <input type="search" v-model="querySearch" @keyup.enter="getUserList"  class="form-control" placeholder="Type then press enter" />
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">&nbsp;</th>
                      <th>Title</th>
                      <th>Brand</th>
                      <th>Publish Date</th>
                      <th>Expire Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ad, i) in ads" :key="ad.id">
                      <td>{{ i+1 }}</td>
                      <td>{{ ad.title }}</td>
                      <td>{{ ad.brand ? ad.brand.name : 'N/A' }}</td>
                      <td>{{ new Date(ad.publish_date).toLocaleDateString() }}</td>
                      <td>{{ new Date(ad.expire_date).toLocaleDateString() }}</td>
                      <td>{{ ad.start_time }}</td>
                      <td>{{ ad.end_time }}</td>
                      <td>
                        <span :class="`badge ${ad.is_active ? 'badge-success' : 'badge-danger'}`">
                          {{ ad.is_active ? 'Yes' : 'No' }}
                        </span>
                      </td>
                      <td>
                        <nuxt-link :to="`/advertisement/update/${ad.id}`" class="btn btn-sm btn-primary">Edit</nuxt-link>
                        <button @click="deleteAd(ad.id)" class="btn btn-sm btn-danger ml-2">Delete</button>
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
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { fetchWithAuth } from '~/utils/auth.js';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const ads = ref([]);
const $toast = useToast();

const fetchAds = async () => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/advertisement`);
    const data = await response.json();
    if (response.ok) {
      ads.value = data;
    } else {
      $toast.error(data.message || 'Failed to fetch advertisements', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    $toast.error('Failed to fetch advertisements', { duration: 5000, position: 'top-right' });
  }
};

const deleteAd = async (id) => {
  if (confirm('Are you sure you want to delete this advertisement?')) {
    try {
      const response = await fetchWithAuth(`${apiUrl}/api/advertisement/${id}`, { method: 'DELETE' });
      if (response.ok) {
        ads.value = ads.value.filter(ad => ad.id !== id);
        $toast.success('Advertisement deleted successfully', { duration: 5000, position: 'top-right' });
      } else {
        const data = await response.json();
        $toast.error(data.message || 'Failed to delete advertisement', { duration: 5000, position: 'top-right' });
      }
    } catch (error) {
      $toast.error('Failed to delete advertisement', { duration: 5000, position: 'top-right' });
    }
  }
};

onMounted(fetchAds);
</script>