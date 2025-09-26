<template>
  <div class="no-data">
    <img src="/assets/img/icons/empty.png" alt="No Data" width="100" height="100">
    <p class="no-data-text">{{ caption }}</p>
  </div>
</template>

<script setup>
defineProps({
  caption: {
    type: String,
    default: 'No Data Available'
  }
})
// No script needed for simple empty state
</script>

<style scoped>
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #888;
  width: 100%;
}
.no-data-text {
  font-size: 1.2rem;
  margin-top: 20px;
}
</style>