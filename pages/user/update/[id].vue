<template>
  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <h4>Update User</h4>
          </div>
          <div class="right-action">
            <a href="#" class="btn btn-icon btn-outline-danger note-btn" @click="closeAdd"><i class="fas fa-times"></i></a>
          </div>
        </div>
        <div class="card-body">
          <form method="POST" @submit.prevent="submitForm" class="needs-validation">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="userName" class="form-label">Name</label>
                  <input type="text" class="form-control" id="userName" tabindex="1" v-model="userName" required>
                  <div class="invalid-feedback">Please fill in your name!</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="userEmail" class="form-label">Email</label>
                  <input type="email" class="form-control" id="userEmail" tabindex="2" v-model="userEmail" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="userPhone" class="form-label">Phone</label>
                  <input type="text" class="form-control" id="userPhone" tabindex="3" v-model="userPhone" required>
                </div>
              </div>
              <div class="col-md-12">
                <div class="mb-3">
                  <input type="checkbox" @change="toggleIsChangePassword" /> Edit Password
                </div>
              </div>
              <div v-if="isChangePassword" class="col-md-6">
                <div class="mb-3">
                  <label for="userPassword" class="form-label">Password</label>
                  <input type="password" class="form-control" id="userPassword" tabindex="4" v-model="userPassword" :required="isChangePassword">
                  <div class="invalid-feedback">Please enter a password!</div>
                </div>
              </div>
              <div v-if="isChangePassword" class="col-md-6">
                <div class="mb-3">
                  <label for="userRePassword" class="form-label">Re-Password</label>
                  <input type="password" class="form-control" id="userRePassword" tabindex="5" v-model="userRePassword" :required="isChangePassword">
                  <div class="invalid-feedback">Please confirm your password!</div>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const route = useRoute();
const router = useRouter();
const $toast = useToast();

// Ensure all refs are defined at the top level
const userName = ref('');
const userEmail = ref('');
const userPhone = ref('');
const userPassword = ref('');
const userRePassword = ref('');
const isChangePassword = ref(false);

function clearForm() {
  userName.value = '';
  userEmail.value = '';
  userPhone.value = '';
  userPassword.value = '';
  userRePassword.value = '';
  isChangePassword.value = false;
}

const toggleIsChangePassword = (e) => {
  isChangePassword.value = e.target.checked;
};

const fetchUser = async () => {
  const accessToken = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${apiUrl}/api/user/${route.params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.meta?.message || 'Failed to fetch user');
    }
    userName.value = data.data.user.full_name || data.data.user.name || '';
    userEmail.value = data.data.user.email || '';
    userPhone.value = data.data.user.phone || '';
  } catch (error) {
    $toast.error(error.message || 'Failed to fetch user', {
      duration: 5000,
      position: 'top-right'
    });
    router.push('/user');
  }
};

const submitForm = async () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    if (isChangePassword.value && userPassword.value !== userRePassword.value) {
      $toast.error('Password and Re-Password did not match!', {
        duration: 5000,
        position: 'top-right'
      });
      return;
    }
    try {
      const accessToken = localStorage.getItem('access_token');
      const body = {
        full_name: userName.value,
        email: userEmail.value,
        phone: userPhone.value
      };
      
      // Only add password if changing it
      if (isChangePassword.value) {
        body.password = userPassword.value;
      }
      const response = await fetch(`${apiUrl}/api/user/${route.params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        $toast.error(data.meta.message, {
          duration: 5000,
          position: 'top-right'
        });
        throw new Error(response.statusText);
      }
      if (data.meta.success) {
        $toast.success(data.meta.message, {
          duration: 5000,
          position: 'top-right'
        });
        router.push('/user');
      }
    } catch (error) {
      $toast.error(error.message || 'Failed to update user', {
        duration: 5000,
        position: 'top-right'
      });
    }
  }
  form.classList.add('was-validated');
};

function closeAdd() {
   window.location.href = '/user'
  clearForm();
}

onMounted(() => {
  fetchUser();
});

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
</script>
