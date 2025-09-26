<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { fetchWithAuth } from '~/utils/auth.js';
import Swal from 'sweetalert2';
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();
const route = useRoute();
const router = useRouter();
const deviceId = route.params.id;
const assignedProducts = ref([]);
const selectedProductId = ref("");
const dropdownOpen = ref(false);
const productSearch = ref("");
const dropdownRef = ref(null);
const ajaxProductList = ref([]);
const loadingProducts = ref(false);
const pricePerSpray = ref(0);
let searchTimeout = null;

const selectedProduct = computed(() => {
  if (ajaxProductList.value  === null) {
    return []
  }else {
    return ajaxProductList.value.find(p => p.id === Number(selectedProductId.value));
  }
  
});

const fetchAssignedProducts = async () => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/device/${deviceId}/products`);
    const data = await response.json();
    if (data.success) {
      assignedProducts.value = data.data.map(mp => ({
        ...mp,
        spray_amount: mp.spray_amount || 0,
        min_volume: mp.min_volume || 0,
        price_per_spray: mp.price_per_spray || 0,
        is_from_server: true
      }));
    }
  } catch (e) {
    $toast.error('Failed to fetch assigned products');
  }
};

const fetchProductsAjax = async (q) => {
  if (!q || q.length < 2) {
    ajaxProductList.value = [];
    return;
  }
  loadingProducts.value = true;
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/product/?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    if (data.success) {
      ajaxProductList.value = data.data;
    } else {
      ajaxProductList.value = [];
    }
  } catch (e) {
    ajaxProductList.value = [];
  } finally {
    loadingProducts.value = false;
  }
};

const selectProduct = (p) => {
  selectedProductId.value = p.id;
  dropdownOpen.value = false;
};

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
  if (dropdownOpen.value) {
    productSearch.value = "";
    ajaxProductList.value = [];
  }
};

const closeDropdown = (e) => {
  if (!dropdownRef.value) return;
  if (!dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false;
  }
};

const addProduct = () => {
  const prodId = Number(selectedProductId.value);
  if (!prodId || assignedProducts.value.some(p => p.product_id === prodId)) return;
  const product = ajaxProductList.value.find(p => p.id === prodId);
  assignedProducts.value.push({
    product_id: prodId,
    product,
    slot: 1,
    spray_amount: 0,
    min_volume: 0,
    price_per_spray: 0,
    is_from_server: false
  });
  selectedProductId.value = "";
};

const removeProduct = (productId, isFromServer) => {
  if (isFromServer) {
    removeProductFromServer(productId);
  } else {
    assignedProducts.value = assignedProducts.value.filter(p => p.product_id !== productId);
  }
};

const removeProductFromServer = async (productId) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
      const response = await fetchWithAuth(`${apiUrl}/api/device/${deviceId}/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        $toast.success('Product removed from device!');
        fetchAssignedProducts();
      } else {
        $toast.error(data.message || 'Failed to remove product from device');
      }
    } catch (e) {
      $toast.error('Failed to remove product from device');
    }
    }
  })
  
};

const saveConfig = async () => {
  console.log(assignedProducts.value);
  if (assignedProducts.value.length !== 5) {
    $toast.error('You have to assign 5 products to a device');
    return;
  } else {
    // Additional validations
    const slotNumbers = assignedProducts.value.map(p => p.slot);
    const hasDuplicateSlot = slotNumbers.some((s, idx) => slotNumbers.indexOf(s) !== idx);
    if (hasDuplicateSlot) {
      $toast.error('Each product must have a unique slot');
      return;
    }
    if (assignedProducts.value.some(p => p.slot < 1 || p.slot > 5)) {
      $toast.error('Slot number must be between 1 and 5');
      return;
    }
    if (assignedProducts.value.some(p => p.spray_amount < 1)) {
      $toast.error('Spray amount must be at least 1');
      return;
    }
    if (assignedProducts.value.some(p => p.min_volume <= 0)) {
      $toast.error('Minimum volume must be greater than 0');
      return;
    }
    if (assignedProducts.value.some(p => p.price_per_spray <= 0)) {
      $toast.error('Price per spray must be greater than 0');
      return;
    }
    try {
      const payload = {
        products: assignedProducts.value.map(p => ({
          product_id: p.product_id,
          slot: p.slot,
          spray_amount: p.spray_amount,
          min_volume: p.min_volume,
          price_per_spray: p.price_per_spray,
          background_color: rgbToHex(p.background_color)
        }))
      };
      const response = await fetchWithAuth(`${apiUrl}/api/device/${deviceId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        $toast.success('Configuration saved!');
        // fetchAssignedProducts();
        router.push(`/device`);
      } else {
        $toast.error(data.message || 'Failed to save configuration');
      }
    } catch (e) {
      $toast.error('Failed to save configuration');
    }
  }
};

// Helper function to convert rgb/rgba or hex to hex color string
function rgbToHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#')) return color;
  // rgb or rgba format
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return (
      '#' +
      [r, g, b]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
  }
  return color; // fallback
}

// Add this function to select input content on focus/click
function selectInputContent(event) {
  // Only select if not already selected (prevents deselecting on second click)
  if (document.activeElement === event.target) {
    event.target.select();
  }
}

onMounted(() => {
  fetchAssignedProducts();
  document.addEventListener('mousedown', closeDropdown);
});

watch(() => productSearch.value, (q) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!dropdownOpen.value) return;
  if (!q || q.length < 2) {
    ajaxProductList.value = [];
    return;
  }
  searchTimeout = setTimeout(() => {
    fetchProductsAjax(q);
  }, 350);
});

watch(() => dropdownOpen.value, (open) => {
  if (!open) productSearch.value = "";
});
</script>

<template>
  <section class="section">
    <div class="section-header">
      <h1>Device Product Configuration</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">Assign Products to Device</h2>
      <p class="section-lead">Configure which products are available in this device.</p>
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <NuxtLink to="/device" class="btn btn-light"><i class="fas fa-arrow-left"></i> Back</NuxtLink>
          </div>
          <div class="right-action">
            <button class="btn btn-primary" @click="saveConfig"><i class="fas fa-save"></i> Save Configuration</button>
          </div>
        </div>
        <div class="card-body">
          <div class="form-group ">
            <label for="product-select">Add Product</label>
            <div class="input-group d-flex" style="width: 450px;">
              <div class="custom-select2" style="width: calc(100% - 40px);" ref="dropdownRef">
                <div class="select2-display form-control d-flex align-items-center justify-content-between" @click="toggleDropdown">
                  <span v-if="selectedProduct">
                    <img v-if="selectedProduct.image_url" :src="selectedProduct.image_url" alt="Product Image" style="height:32px;width:auto;margin-right:8px;border-radius:4px;vertical-align:middle;" />
                    {{ selectedProduct.name }} <span v-if="selectedProduct.brand">({{ selectedProduct.brand.name }})</span>
                  </span>
                  <span v-else class="text-muted">Select product...</span>
                  <i class="fas fa-caret-down ml-auto"></i>
                </div>
                <div v-if="dropdownOpen" class="select2-dropdown shadow" style="position:absolute;z-index:1050;width:100%;background:#fff;max-height:340px;overflow:auto;">
                  <div class="p-2 border-bottom bg-light">
                    <input type="text" v-model="productSearch" class="form-control" placeholder="Search product..." autofocus />
                  </div>
                  <div v-if="loadingProducts" class="dropdown-item text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
                  <div v-else-if="productSearch.length >= 2 && ( ajaxProductList === null || ajaxProductList.length === 0)" class="dropdown-item text-muted">No products found.</div>
                  <div v-else-if="productSearch.length < 2" class="dropdown-item text-muted">Type at least 2 characters...</div>
                  <a v-for="p in ajaxProductList" :key="p.id" class="dropdown-item d-flex align-items-center" href="#" @click.prevent="selectProduct(p)">
                    <img v-if="p.image_url" :src="p.image_url" alt="Product Image" style="height:32px;width:auto;margin-right:8px;border-radius:4px;vertical-align:middle;" />
                    <span>{{ p.name }} <span v-if="p.brand">({{ p.brand.name }})</span></span>
                  </a>
                </div>
              </div>
              <div class="input-group-append">
                <button class="btn btn-success" @click="addProduct" :disabled="!selectedProductId"><i class="fas fa-plus"></i></button>
              </div>
            </div>
          </div>
          <table class="table table-striped mt-4">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th style="width: 200px; text-align: center;">Slot</th>
                <th style="width: 200px; text-align: center;">Spray Amount</th>
                <th style="width: 200px; text-align: center;">Min Volume (ml)</th>
                <th style="text-align: center;">Price per Spray (Rp)</th>  
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in assignedProducts" :key="item.product_id">
                <td>{{ i + 1 }}</td>
                <td>
                  <img v-if="item.product && item.product.image_url" :src="item.product.image_url" alt="Product Image" style="height:48px;width:auto;border-radius:6px;box-shadow:0 2px 6px #0001;" />
                </td>
                <td>{{ item.product ? item.product.name : '' }}</td>
                <td>{{ item.product && item.product.brand ? item.product.brand.name : '' }}</td>
                <td><input type="number" style="text-align: center;" v-model.number="item.slot" class="form-control" min="1" step="1" @focus="selectInputContent" @click="selectInputContent" /></td>
                <td><input type="number" style="text-align: center;" v-model.number="item.spray_amount" class="form-control" min="0" step="1" @focus="selectInputContent" @click="selectInputContent" /></td>
                <td><input type="number" style="text-align: center;" v-model.number="item.min_volume" class="form-control" min="0" step="1" @focus="selectInputContent" @click="selectInputContent" /></td>
                <td><input type="number" style="text-align: center;" v-model.number="item.price_per_spray" class="form-control" min="0" step="1" @focus="selectInputContent" @click="selectInputContent" /></td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="removeProduct(item.product_id, item.is_from_server)"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
              <tr v-if="assignedProducts.length === 0">
                <td colspan="7" class="text-center">No products assigned.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.custom-select2 {
  position: relative;
}
.select2-display {
  cursor: pointer;
  background: #fff;
}
.select2-dropdown {
  border: 1px solid #e4e6fc;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px #0001;
  margin-top: -2px;
}
.select2-dropdown .dropdown-item {
  cursor: pointer;
}
.select2-dropdown .dropdown-item:hover {
  background: #f2f4fa;
}
</style> 