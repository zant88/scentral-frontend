<template>
  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <h4>Create User</h4>
          </div>
          <div class="right-action">
            <a href="#" class="btn btn-icon btn-outline-danger note-btn" @click="closeAdd">
              <i class="fas fa-times"></i></a>
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
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="userPassword" class="form-label">Password</label>
                  <input type="password" class="form-control" id="userPassword" tabindex="4" v-model="userPassword" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="userRePassword" class="form-label">Re-Password</label>
                  <input type="password" class="form-control" id="userRePassword" tabindex="5" v-model="userRePassword" required>
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
import { ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useRouter } from 'vue-router';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const userName = ref('');
const userEmail = ref('');
const userPhone = ref('');
const userPassword = ref('');
const userRePassword = ref('');
const $toast = useToast();
const router = useRouter();

function clearForm() {
  userName.value = '';
  userEmail.value = '';
  userPhone.value = '';
  userPassword.value = '';
  userRePassword.value = '';
}

const submitForm = async () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    if (userPassword.value !== userRePassword.value) {
      $toast.error('Password and Re-Password did not match!', {
        duration: 5000,
        position: 'top-right'
      });
      return;
    }
    try {
      const accessToken = localStorage.getItem('access_token');
      // Check if email already exists
      const emailRes = await fetch(`${apiUrl}/api/user/check-email?email=${encodeURIComponent(userEmail.value)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const emailData = await emailRes.json();
      if (emailData.exists) {
        $toast.error('Email already exists!', {
          duration: 5000,
          position: 'top-right'
        });
        return;
      }
      // Check if phone already exists
      const phoneRes = await fetch(`${apiUrl}/api/user/check-phone?phone=${encodeURIComponent(userPhone.value)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const phoneData = await phoneRes.json();
      if (phoneData.exists) {
        $toast.error('Phone number already exists!', {
          duration: 5000,
          position: 'top-right'
        });
        return;
      }
      const response = await fetch(`${apiUrl}/api/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: userName.value,
          email: userEmail.value,
          phone: userPhone.value,
          password: userPassword.value
        })
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
        clearForm();
        router.push('/user');
      }
    } catch (error) {
      // handle error
    }
  }
  form.classList.add('was-validated');
};

function closeAdd() {
  window.location.href = '/user'
  clearForm();
}

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
</script>
