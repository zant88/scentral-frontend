<template>
  <div id="app">
    <!-- Navigation Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">Scentral Dashboard</h1>
          <span class="app-version">v1.0</span>
        </div>
        <nav class="main-nav">
          <router-link to="/stock" class="nav-link" active-class="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Stock Management
          </router-link>
        </nav>
        <div class="user-section">
          <div class="user-info">
            <span class="user-name">Admin User</span>
            <button class="logout-btn" @click="logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m9 21 5-5-5-5"></path>
                <path d="M20 12H9"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 Scentral Dashboard. All rights reserved.</p>
        <div class="footer-links">
          <a href="#" class="footer-link">Documentation</a>
          <a href="#" class="footer-link">Support</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    logout() {
      // Clear authentication token
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      // Redirect to login or show login modal
      alert('Logged out successfully')
      // In a real app, you would redirect to login page
      // this.$router.push('/login')
    }
  }
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
  color: #2d3748;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.app-version {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.main-nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
}

.logout-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

/* Main Content */
.app-main {
  flex: 1;
  min-height: calc(100vh - 140px);
}

/* Footer Styles */
.app-footer {
  background-color: #2d3748;
  color: #a0aec0;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  color: #a0aec0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #e2e8f0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 60px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .nav-link {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .user-name {
    display: none;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .footer-content p {
    font-size: 14px;
  }
}

@media (max-width: 640px) {
  .header-content {
    padding: 0 12px;
  }
  
  .logo-section {
    gap: 8px;
  }
  
  .app-version {
    display: none;
  }
  
  .nav-link {
    padding: 6px 8px;
  }
  
  .nav-link span {
    display: none;
  }
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.mb-0 {
  margin-bottom: 0;
}

.mb-1 {
  margin-bottom: 8px;
}

.mb-2 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 24px;
}

.mt-0 {
  margin-top: 0;
}

.mt-1 {
  margin-top: 8px;
}

.mt-2 {
  margin-top: 16px;
}

.mt-3 {
  margin-top: 24px;
}

.p-0 {
  padding: 0;
}

.p-1 {
  padding: 8px;
}

.p-2 {
  padding: 16px;
}

.p-3 {
  padding: 24px;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1 {
  gap: 8px;
}

.gap-2 {
  gap: 16px;
}

.gap-3 {
  gap: 24px;
}
</style>