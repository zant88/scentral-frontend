<template>
  <div id="app">
    <section class="section">
      <div class="d-flex align-items-stretch flex-wrap">
        <div class="col-lg-4 col-md-6 col-12 order-lg-1 min-vh-100 order-2 bg-white">
          <div class="m-3 p-4">
            <slot />
          </div>
        </div>
        <div class="col-lg-8 col-12 order-lg-2 order-1 min-vh-100 bg-primary position-relative d-flex align-items-center justify-content-center">
          <div class="text-center text-light">
            <div class="mb-5">
              <h1 class="mb-2 display-4 font-weight-bold">Scentral</h1>
              <h5 class="font-weight-normal">Smart Advertising Platform</h5>
              <p class="mt-4">Manage your slot-based advertising campaigns with ease</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Login layout - no authentication required
</script>

<style scoped>
.background-walk-y {
  background-image: url('/assets/img/unsplash/login-bg.jpg');
  background-size: cover;
  background-position: center;
}

.overlay-gradient-bottom::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  z-index: 1;
}

.absolute-bottom-left {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
}

.index-2 {
  z-index: 2;
}

.text-muted-transparent {
  color: rgba(255, 255, 255, 0.8) !important;
}

.bb {
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  text-decoration: none;
}

.bb:hover {
  border-bottom-color: rgba(255, 255, 255, 0.8);
}
</style>