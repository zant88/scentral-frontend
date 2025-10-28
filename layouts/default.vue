<template>
  <div>
    <div class="navbar-bg"></div>
    <nav class="navbar navbar-expand-lg main-navbar">
      <form class="form-inline mr-auto">
        <ul class="navbar-nav mr-3">
          <li><a href="#" data-toggle="sidebar" class="nav-link nav-link-lg"><i class="fas fa-bars"></i></a></li>
          <li><a href="#" data-toggle="search" class="nav-link nav-link-lg d-sm-none"><i class="fas fa-search"></i></a>
          </li>
        </ul>
      </form>
      <ul class="navbar-nav navbar-right">
        <li v-if="!isBrand" class="dropdown dropdown-list-toggle"><a href="#" data-toggle="dropdown"
            :class="['nav-link notification-toggle nav-link-lg', unreadCount > 0 ? 'beep' : '']"><i class="far fa-bell"></i></a>
          <div class="dropdown-menu dropdown-list dropdown-menu-right">
            <div class="dropdown-header">Notifications
              <div class="float-right">
                <a href="#" @click.prevent="markAllAsRead">Mark All As Read</a>
              </div>
            </div>
            <div class="dropdown-list-content dropdown-list-icons">
              <!-- Notifications List -->
              <template v-if="notifications.length > 0">
                <a href="#" class="dropdown-item" v-for="n in notifications" :key="n.id" :class="{ 'dropdown-item-unread': n.status === 'unread' }">
                  <div class="dropdown-item-icon text-white" :class="iconClass(n).bg">
                    <i :class="iconClass(n).icon"></i>
                  </div>
                  <div class="dropdown-item-desc">
                    <b>{{ n.title }}</b> - {{ n.message }}
                    <div class="time" :class="n.status === 'unread' ? 'text-primary' : ''">{{ formatTime(n.created_at) }}</div>
                  </div>
                </a>
              </template>
              <!-- Empty State -->
              <div v-else class="dropdown-item text-center text-muted">
                No notifications
              </div>
            </div>
            <div class="dropdown-footer text-center">
              <a href="#">View All <i class="fas fa-chevron-right"></i></a>
            </div>
          </div>
        </li>
        <li class="dropdown"><a href="#" data-toggle="dropdown"
            class="nav-link dropdown-toggle nav-link-lg nav-link-user">
            <img alt="image" src="/assets/img/avatar/avatar-1.png" class="rounded-circle mr-1">
            <div class="d-sm-none d-lg-inline-block">Hi, {{ userName }}</div>
          </a>
          <div class="dropdown-menu dropdown-menu-right">
            <div class="dropdown-title">Logged in 5 min ago</div>
            <a href="javascript:void(0)" @click="navigateTo('/profile')" class="dropdown-item has-icon">
              <i class="far fa-user"></i> Profile Settings
            </a>
            <div class="dropdown-divider"></div>
            <a href="javascript:void(0)" @click="handleLogout" class="dropdown-item has-icon text-danger">
              <i class="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </li>
      </ul>
    </nav>
    <div class="main-sidebar sidebar-style-2">
      <aside id="sidebar-wrapper">
        <div class="sidebar-brand">
          <a href="javascript:void(0)" @click="navigateTo('/')" >Scentral</a>

        </div>
        <div class="sidebar-brand sidebar-brand-sm">
          <a href="javascript:void(0)" @click="navigateTo('/')">SC</a>
        </div>
        <ul class="sidebar-menu">
          <!-- Admin Navigation -->
          <template v-if="isAdmin">
            <li class="menu-header">Dashboard</li>
            <li class="nav-item" :class="isActive('/admin/dashboard')">
              <a href="javascript:void(0)" @click="navigateTo('/admin/dashboard')" class="nav-link">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="menu-header">Advertising Management</li>
            <li class="nav-item" :class="isActive('/advertisement')">
              <a href="javascript:void(0)" @click="navigateTo('/advertisement')" class="nav-link">
                <i class="fas fa-ad"></i>
                <span>Legacy Advertisement</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/admin/slots')">
              <a href="javascript:void(0)" @click="navigateTo('/admin/slots')" class="nav-link">
                <i class="fas fa-clock"></i>
                <span>Slot Management</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/admin/videos')">
              <a href="javascript:void(0)" @click="navigateTo('/admin/videos')" class="nav-link">
                <i class="fas fa-video"></i>
                <span>Video Management</span>
              </a>
            </li>
            <li class="menu-header">System Management</li>
            <li class="nav-item" :class="isActive('/admin/apk-releases')">
              <a href="javascript:void(0)" @click="navigateTo('/admin/apk-releases')" class="nav-link">
                <i class="fas fa-mobile-alt"></i>
                <span>APK Release Manager</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/user')">
              <a href="javascript:void(0)" @click="navigateTo('/user')" class="nav-link">
                <i class="fas fa-user-cog"></i>
                <span>User Management</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/brand')">
              <a href="javascript:void(0)" @click="navigateTo('/brand')" class="nav-link">
                <i class="fas fa-certificate"></i>
                <span>Brand Management</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/device')">
              <a href="javascript:void(0)" @click="navigateTo('/device')" class="nav-link">
                <i class="fas fa-microchip"></i>
                <span>Device Management</span>
              </a>
            </li>
            <li class="menu-header">Inventory</li>
            <li class="nav-item" :class="isActive('/sale')">
              <a href="javascript:void(0)" @click="navigateTo('/sale')" class="nav-link">
                <i class="fas fa-cash-register"></i>
                <span>Sales</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/stock')">
              <a href="javascript:void(0)" @click="navigateTo('/stock')" class="nav-link">
                <i class="fas fa-warehouse"></i>
                <span>Stock Management</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/product')">
              <a href="javascript:void(0)" @click="navigateTo('/product')" class="nav-link">
                <i class="fas fa-spray-can"></i>
                <span>Product Management</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/category')">
              <a href="javascript:void(0)" @click="navigateTo('/category')" class="nav-link">
                <i class="fas fa-list-alt"></i>
                <span>Category Management</span>
              </a>
            </li>
          </template>

          <!-- Brand Navigation -->
          <template v-else-if="isBrand">
            <li class="menu-header">Dashboard</li>
            <li class="nav-item" :class="isActive('/brand/dashboard')">
              <a href="javascript:void(0)" @click="navigateTo('/brand/dashboard')" class="nav-link">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="menu-header">Advertising</li>
            <li class="nav-item" :class="isActive('/brand/videos')">
              <a href="javascript:void(0)" @click="navigateTo('/brand/videos')" class="nav-link">
                <i class="fas fa-video"></i>
                <span>My Videos</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/brand/slots')">
              <a href="javascript:void(0)" @click="navigateTo('/brand/slots')" class="nav-link">
                <i class="fas fa-clock"></i>
                <span>Slot Booking</span>
              </a>
            </li>
            <li class="menu-header">Account</li>
            <li class="nav-item" :class="isActive('/brand/balance')">
              <a href="javascript:void(0)" @click="navigateTo('/brand/balance')" class="nav-link">
                <i class="fas fa-wallet"></i>
                <span>Balance Management</span>
              </a>
            </li>
            <li class="nav-item" :class="isActive('/brand/reports')">
              <a href="javascript:void(0)" @click="navigateTo('/brand/reports')" class="nav-link">
                <i class="fas fa-chart-bar"></i>
                <span>Performance Reports</span>
              </a>
            </li>
          </template>
        </ul>
      </aside>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <slot />
    </div>
    <footer class="main-footer">
      <div class="footer-left">
        Copyright &copy; 2025 <div class="bullet"></div>
      </div>
      <div class="footer-right">
        2.3.0
      </div>
    </footer>
  </div>
</template>

<script setup>
  import { useRoute, useRouter } from 'vue-router';
  import { ref, onMounted, computed } from 'vue';
  import { fetchWithAuth, getUserRole, getUserData, logout } from '~/utils/auth.js';

  const route = useRoute();
  const router = useRouter();
  const config = useRuntimeConfig();
  const apiUrl = `${config.public.apiBase}`;

  const notifications = ref([]);
  const unreadCount = ref(0);
  const userRole = ref(getUserRole());
  const userData = ref(getUserData());

  // Computed properties for role-based navigation
  const isAdmin = computed(() => userRole.value === 'admin');
  const isBrand = computed(() => userRole.value === 'brand');
  const userName = computed(() => userData.value?.name || 'User');

  const isActive = (path) => {
    return route.path.includes(path) ? 'active' : '';
  }

  function iconClass(n) {
    switch (n.type) {
      case 'critical_stock':
        return { icon: 'fas fa-exclamation-triangle', bg: 'bg-danger' };
      case 'device_status':
        return { icon: 'fas fa-microchip', bg: 'bg-info' };
      case 'mqtt_connection':
        return { icon: 'fas fa-plug', bg: 'bg-warning' };
      default:
        return { icon: 'fas fa-bell', bg: 'bg-secondary' };
    }
  }

  function formatTime(iso) {
    try {
      return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    } catch (e) {
      return '';
    }
  }

  async function loadUnreadCount() {
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/notification/unread-count`);
      const data = await res.json();
      if (res.ok && data && typeof data.count !== 'undefined') {
        unreadCount.value = data.count;
      } else {
        unreadCount.value = 0;
      }
    } catch (e) {
      unreadCount.value = 0;
    }
  }

  async function loadNotifications() {
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/notification?limit=5`);
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.data)) {
        notifications.value = data.data;
      } else {
        notifications.value = [];
      }
    } catch (e) {
      notifications.value = [];
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/notification/mark-all-read`, { method: 'PUT' });
      if (res.ok) {
        // Refresh list and count
        await Promise.all([loadNotifications(), loadUnreadCount()]);
      }
    } catch (e) {}
  }

  function navigateTo(path) {
    router.push(path);
  }

  function handleLogout() {
    logout();
    router.push('/login');
  }

  onMounted(async () => {
    // Check authentication on client side
    const accessToken = localStorage.getItem('access_token');
    const currentPath = window.location.pathname;
    
    // If not logged in and not on login page, redirect to login
    if (!accessToken && currentPath !== '/login') {
      window.location.href = '/login';
      return;
    }
    
    await Promise.all([loadNotifications(), loadUnreadCount()]);
  });
</script>
