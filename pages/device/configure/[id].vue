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
const showMachineModal = ref(false);
const deviceList = ref([]);
const selectedDeviceId = ref("");
const loadingDevices = ref(false);
const statusFilter = ref('active'); // New filter status variable
let searchTimeout = null;

const selectedProduct = computed(() => {
  if (ajaxProductList.value  === null) {
    return []
  }else {
    return ajaxProductList.value.find(p => p.id === Number(selectedProductId.value));
  }
  
});

// Computed property to filter products based on status
const filteredProducts = computed(() => {
  if (statusFilter.value === 'all') {
    return assignedProducts.value;
  } else if (statusFilter.value === 'active') {
    return assignedProducts.value.filter(p => p.is_active);
  } else if (statusFilter.value === 'inactive') {
    return assignedProducts.value.filter(p => !p.is_active);
  }
  return assignedProducts.value;
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
        is_active: mp.is_active !== undefined ? mp.is_active : true,
        is_from_server: true
      }));
    }
  } catch (e) {
    $toast.error('Failed to fetch assigned products');
  }
};

const fetchDeviceList = async () => {
  loadingDevices.value = true;
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/device/`);
    const data = await response.json();
    if (data.success) {
      deviceList.value = data.data.filter(device => device.id !== Number(deviceId));
    } else {
      deviceList.value = [];
      $toast.error(data.message || 'Failed to fetch devices');
    }
  } catch (e) {
    deviceList.value = [];
    $toast.error('Failed to fetch devices');
  } finally {
    loadingDevices.value = false;
  }
};

const openMachineModal = () => {
  showMachineModal.value = true;
  selectedDeviceId.value = "";
  fetchDeviceList();
};

const copyFromMachine = async () => {
  if (!selectedDeviceId.value) {
    $toast.error('Please select a machine');
    return;
  }
  
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/device/${selectedDeviceId.value}/products`);
    const data = await response.json();
    if (data.success) {
      // Clear current assigned products
      assignedProducts.value = [];
      
      // Add products from selected machine
      data.data.forEach(mp => {
        assignedProducts.value.push({
          product_id: mp.product_id,
          product: mp.product,
          slot: mp.slot || 1,
          spray_amount: mp.spray_amount || 0,
          min_volume: mp.min_volume || 0,
          price_per_spray: mp.price_per_spray || 0,
          background_color: mp.background_color || '#000000',
          is_active: mp.is_active !== undefined ? mp.is_active : true,
          is_from_server: false
        });
      });
      
      showMachineModal.value = false;
      $toast.success('Products copied successfully!');
    } else {
      $toast.error(data.message || 'Failed to copy products');
    }
  } catch (e) {
    $toast.error('Failed to copy products');
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
  if (!prodId) return;
  
  // Check if product already exists and is deactivated
  const existingProduct = assignedProducts.value.find(p => p.product_id === prodId);
  if (existingProduct) {
    if (existingProduct.is_active) {
      $toast.error('Product is already assigned to this device');
      return;
    } else {
      // Reactivate the deactivated product
      reactivateProduct(prodId);
      selectedProductId.value = "";
      return;
    }
  }
  
  // Find available slot (1-5)
  const usedSlots = assignedProducts.value.filter(p => p.is_active).map(p => p.slot);
  const availableSlots = [1, 2, 3, 4, 5].filter(slot => !usedSlots.includes(slot));
  
  if (availableSlots.length === 0) {
    $toast.error('All slots are occupied. Please deactivate a product first.');
    return;
  }
  
  const product = ajaxProductList.value.find(p => p.id === prodId);
  assignedProducts.value.push({
    product_id: prodId,
    product,
    slot: availableSlots[0], // Assign first available slot
    spray_amount: 0,
    min_volume: 0,
    price_per_spray: 0,
    is_active: true,
    is_from_server: false
  });
  selectedProductId.value = "";
};

const removeProduct = (productId, isFromServer) => {
  if (isFromServer) {
    removeProductFromServer(productId);
  } else {
    // For local products, just remove them from the array
    assignedProducts.value = assignedProducts.value.filter(p => p.product_id !== productId);
    $toast.success('Product removed from list.');
  }
};

const deleteProduct = async (productId) => {
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
};

const removeProductFromServer = async (productId) => {
  // First check if product has transactions
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/product/${productId}/has-transactions`);
    const data = await response.json();
    
    if (data.success && data.hasTransactions) {
      // Product has transactions, offer to deactivate instead
      Swal.fire({
        title: 'Product has transactions',
        text: "This product cannot be deleted because it has transactions. Would you like to deactivate it instead?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, deactivate it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deactivateProduct(productId);
        }
      });
    } else {
      // Product has no transactions, can be deleted
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
          await deleteProduct(productId);
        }
      });
    }
  } catch (e) {
    // If the API endpoint doesn't exist, default to deactivation
    Swal.fire({
      title: 'Deactivate Product',
      text: "This product will be deactivated instead of deleted to preserve transaction history. You can reactivate it later if needed.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, deactivate it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deactivateProduct(productId);
      }
    });
  }
};


const deactivateProduct = async (productId) => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/device/${deviceId}/products/${productId}/deactivate`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Product deactivated!');
      fetchAssignedProducts();
    } else {
      $toast.error(data.message || 'Failed to deactivate product');
    }
  } catch (e) {
    // If API endpoint doesn't exist, update locally
    const productIndex = assignedProducts.value.findIndex(p => p.product_id === productId);
    if (productIndex !== -1) {
      assignedProducts.value[productIndex].is_active = false;
      assignedProducts.value[productIndex].is_from_server = false; // Mark as modified
      $toast.success('Product deactivated! Click Save Configuration to apply changes.');
    }
  }
};

const reactivateProduct = async (productId) => {
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/device/${deviceId}/products/${productId}/reactivate`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (data.success) {
      $toast.success('Product reactivated!');
      fetchAssignedProducts();
    } else {
      $toast.error(data.message || 'Failed to reactivate product');
    }
  } catch (e) {
    // If API endpoint doesn't exist, update locally
    const productIndex = assignedProducts.value.findIndex(p => p.product_id === productId);
    if (productIndex !== -1) {
      // Check if there's an available slot
      const usedSlots = assignedProducts.value.filter(p => p.is_active).map(p => p.slot);
      const availableSlots = [1, 2, 3, 4, 5].filter(slot => !usedSlots.includes(slot));
      
      if (availableSlots.length === 0) {
        $toast.error('All slots are occupied. Please deactivate another product first.');
        return;
      }
      
      assignedProducts.value[productIndex].is_active = true;
      assignedProducts.value[productIndex].slot = availableSlots[0]; // Assign first available slot
      assignedProducts.value[productIndex].is_from_server = false; // Mark as modified
      $toast.success('Product reactivated! Click Save Configuration to apply changes.');
    }
  }
};

const saveConfig = async () => {
  console.log(assignedProducts.value);
  
  // Count only active products
  const activeProducts = assignedProducts.value.filter(p => p.is_active);
  
  if (activeProducts.length !== 5) {
    $toast.error('You have to assign exactly 5 active products to a device');
    return;
  } else {
    // Additional validations
    const slotNumbers = activeProducts.map(p => p.slot);
    const hasDuplicateSlot = slotNumbers.some((s, idx) => slotNumbers.indexOf(s) !== idx);
    if (hasDuplicateSlot) {
      $toast.error('Each active product must have a unique slot');
      return;
    }
    if (activeProducts.some(p => p.slot < 1 || p.slot > 5)) {
      $toast.error('Slot number must be between 1 and 5');
      return;
    }
    if (activeProducts.some(p => p.spray_amount < 1)) {
      $toast.error('Spray amount must be at least 1');
      return;
    }
    if (activeProducts.some(p => p.min_volume <= 0)) {
      $toast.error('Minimum volume must be greater than 0');
      return;
    }
    if (activeProducts.some(p => p.price_per_spray <= 0)) {
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
          background_color: rgbToHex(p.background_color),
          is_active: p.is_active
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
          
          <div class="row mt-3">
            <div class="col-md-6">
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
                <div class="mt-2">
                  <button class="btn btn-info" @click="openMachineModal">
                    <i class="fas fa-copy"></i> Copy from Existing Machine
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group d-flex align-items-end" style="flex-direction: column; ">
                <label for="status-filter">&nbsp;</label>
                <select v-model="statusFilter" id="status-filter" class="form-control" style="width: 200px;">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
              <tr v-for="(item, i) in filteredProducts" :key="item.product_id" :class="{ 'table-secondary': !item.is_active }">
                <td>{{ i + 1 }}</td>
                <td>
                  <img v-if="item.product && item.product.image_url" :src="item.product.image_url" alt="Product Image" style="height:48px;width:auto;border-radius:6px;box-shadow:0 2px 6px #0001;" :style="{ opacity: item.is_active ? 1 : 0.5 }" />
                </td>
                <td>
                  {{ item.product ? item.product.name : '' }}
                  <span v-if="!item.is_active" class="badge badge-warning ml-2">Inactive</span>
                </td>
                <td>{{ item.product && item.product.brand ? item.product.brand.name : '' }}</td>
                <td>
                  <input type="number" style="text-align: center;" v-model.number="item.slot" class="form-control" min="1" max="5" step="1" @focus="selectInputContent" @click="selectInputContent" :disabled="!item.is_active" />
                </td>
                <td>
                  <input type="number" style="text-align: center;" v-model.number="item.spray_amount" class="form-control" min="0" step="1" @focus="selectInputContent" @click="selectInputContent" :disabled="!item.is_active" />
                </td>
                <td>
                  <input type="number" style="text-align: center;" v-model.number="item.min_volume" class="form-control" min="0" step="1" @focus="selectInputContent" @click="selectInputContent" :disabled="!item.is_active" />
                </td>
                <td>
                  <input type="number" style="text-align: center;" v-model.number="item.price_per_spray" class="form-control" min="0" step="1" @focus="selectInputContent" @click="selectInputContent" :disabled="!item.is_active" />
                </td>
                <td>
                  <div v-if="item.is_active" class="btn-group">
                    <button class="btn btn-danger btn-sm" @click="removeProduct(item.product_id, item.is_from_server)" title="Remove/Deactivate">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <div v-else class="btn-group">
                    <button class="btn btn-success btn-sm" @click="reactivateProduct(item.product_id)" title="Reactivate">
                      <i class="fas fa-check"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="8" class="text-center">
                  {{ statusFilter === 'all' ? 'No products assigned.' :
                     statusFilter === 'active' ? 'No active products found.' :
                     'No inactive products found.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- Machine Selection Modal -->
  <div v-if="showMachineModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select Machine to Copy From</h5>
          <button type="button" class="btn-close" @click="showMachineModal = false"></button>
        </div>
        <div class="modal-body">
          <div v-if="loadingDevices" class="text-center p-4">
            <i class="fas fa-spinner fa-spin"></i> Loading machines...
          </div>
          <div v-else-if="deviceList.length === 0" class="text-center p-4 text-muted">
            No other machines available to copy from.
          </div>
          <div v-else>
            <div class="form-group">
              <label for="machine-select">Select Machine</label>
              <select v-model="selectedDeviceId" class="form-control">
                <option value="">Choose a machine...</option>
                <option v-for="device in deviceList" :key="device.id" :value="device.id">
                  {{ device.code }} - {{ device.machine_code }} ({{ device.position }})
                </option>
              </select>
            </div>
            <div v-if="selectedDeviceId" class="alert alert-info mt-3">
              <i class="fas fa-info-circle"></i> This will replace all current products with the configuration from the selected machine.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showMachineModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" @click="copyFromMachine" :disabled="!selectedDeviceId || loadingDevices">
            <i class="fas fa-copy"></i> Copy Configuration
          </button>
        </div>
      </div>
    </div>
  </div>
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