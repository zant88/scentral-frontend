<template>
  <section class="section">
    <div class="container mt-5">
      <div class="row">
        <div class="col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4">
          <div class="login-brand">
            <img src="/assets/img/stisla-fill.svg" alt="logo" width="100" class="shadow-light rounded-circle">
          </div>

          <div class="card card-primary">
            <div class="card-header">
              <h4>Login</h4>
            </div>

            <div class="card-body">
              <form method="POST" @submit.prevent="validateForm" class="needs-validation" novalidate="">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input id="email" type="email" v-model="email" class="form-control" name="email" tabindex="1" required autofocus>
                  <div class="invalid-feedback">
                    Please fill in your email
                  </div>
                </div>

                <div class="form-group">
                  <div class="d-block">
                    <label for="password" class="control-label">Password</label>
                  </div>
                  <input id="password" v-model="password" type="password" class="form-control" name="password" tabindex="2" required>
                  <div class="invalid-feedback">
                    please fill in your password
                  </div>
                </div>

                <div class="form-group">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" name="remember" class="custom-control-input" tabindex="3" id="remember-me">
                    <label class="custom-control-label" for="remember-me">Remember Me</label>
                  </div>
                </div>

                <div class="form-group">
                  <!-- <a @click="goTo('/user')" class="btn btn-primary btn-lg btn-block" tabindex="4">
                    Login
                  </a> -->
                  <button  :disabled="isLoggingIn" type="submit" class="btn btn-primary btn-lg btn-block" tabindex="4">
                    Login
                  </button>
                </div>
              </form>

            </div>
          </div>
          <div class="simple-footer">
            Copyright &copy; Scentral 2025
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {ref} from 'vue';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();
const email = ref('');
const password = ref('');
const isLoggingIn = ref(false);

const login = async () => {
  isLoggingIn.value = true;
  try {
    const response = await fetch(`${apiUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_email: email.value,
        password: password.value
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.log(data.meta.message);
      let instance = $toast.error(data.meta.message, {
        duration: 5000,
        position: 'top-right'
      })
      password.value = "";
      throw new Error(response.statusText);
    }

    if (data.meta.success) {
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      navigateTo('/');
    }
  }catch (error) {
    console.error(error);
  }finally {
    isLoggingIn.value = false;
  }
}

const validateForm = () => {
  const form = document.querySelector('form');
  if (form.checkValidity()) {
    login();
  }
  form.classList.add('was-validated');
}

definePageMeta({
  layout: 'login',
});
</script>