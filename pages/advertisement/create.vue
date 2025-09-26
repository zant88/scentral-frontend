<template>
  <section class="section">
    <div class="section-header">
      <h1>Create Advertisement</h1>
    </div>
    <div class="section-body">
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4>Create Advertisement</h4>
            </div>
            <div class="card-body">
              <AdvertisementForm @submit="createAd" @file-change="handleFileChange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { fetchWithAuth } from '~/utils/auth.js';
import AdvertisementForm from './_components/AdvertisementForm.vue';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const router = useRouter();
const $toast = useToast();
const videoFile = ref(null);

const handleFileChange = (file) => {
  videoFile.value = file;
};

const createAd = async (formData) => {
  try {
    // Extract the video file from the form data
    const videoFileToUpload = formData.videoFile;
    delete formData.videoFile;
    
    // If there's a video file, upload it first
    if (videoFileToUpload) {
      const uploadFormData = new FormData();
      uploadFormData.append('video', videoFileToUpload);

      try {
        const uploadResponse = await fetchWithAuth(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          $toast.error(errorData.error || 'Failed to upload video', { duration: 5000, position: 'top-right' });
          return;
        }

        const uploadResult = await uploadResponse.json();
        formData.video_url = uploadResult.url;
      } catch (uploadError) {
        console.error('Video upload error:', uploadError);
        $toast.error('Failed to upload video. Please try again.', { duration: 5000, position: 'top-right' });
        return;
      }
    }

    // Now create the advertisement with all form data
    const response = await fetchWithAuth(`${apiUrl}/api/advertisement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      $toast.success('Advertisement created successfully', { duration: 5000, position: 'top-right' });
      router.push('/advertisement');
    } else {
      $toast.error(data.message || 'Failed to create advertisement', { duration: 5000, position: 'top-right' });
    }
  } catch (error) {
    console.error('Create advertisement error:', error);
    $toast.error('Failed to create advertisement', { duration: 5000, position: 'top-right' });
  }
};
</script>