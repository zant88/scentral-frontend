<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
// Video player layout - no authentication required
definePageMeta({
  name: 'VideoPlayerLayout'
})
</script>

<style>
/* Global styles for video player */
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000;
}

* {
  box-sizing: border-box;
}
</style>
