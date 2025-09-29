<template>
  <div class="login-container">
    <!-- Login Form Section -->
    <div class="login-form-section">
      <div class="login-form-wrapper">
        <!-- Logo and Brand -->
        <div class="brand-section">
          <div class="logo-container">
            <div class="logo-circle">
              <span class="logo-text">S</span>
            </div>
          </div>
          <h2 class="brand-title">Scentral</h2>
          <p class="brand-subtitle">Smart Advertising Platform</p>
        </div>

        <!-- Login Form -->
        <div class="form-container">
          <div class="form-header">
            <h3 class="form-title">Welcome Back</h3>
            <p class="form-description">Sign in to manage your fragrance advertising campaigns</p>
          </div>

          <form @submit.prevent="validateForm" class="login-form" novalidate>
            <div class="input-group">
              <label for="email" class="input-label">Email Address</label>
              <input 
                id="email" 
                type="email" 
                v-model="email" 
                class="form-input" 
                :class="{ 'error': emailError }"
                name="email" 
                placeholder="Enter your email"
                required 
                autofocus
              >
              <div v-if="emailError" class="error-message">
                Please enter a valid email address
              </div>
            </div>

            <div class="input-group">
              <label for="password" class="input-label">Password</label>
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                class="form-input" 
                :class="{ 'error': passwordError }"
                name="password" 
                placeholder="Enter your password"
                required
              >
              <div v-if="passwordError" class="error-message">
                Please enter your password
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" name="remember" id="remember-me">
                <span class="checkmark"></span>
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              class="login-button" 
              :class="{ 'loading': isLoggingIn }"
              :disabled="isLoggingIn"
            >
              <span v-if="!isLoggingIn">Sign In</span>
              <span v-else class="loading-text">
                <span class="spinner"></span>
                Signing In...
              </span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p>&copy; 2025 Scentral. All rights reserved.</p>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-header">
          <h1 class="hero-title">
            Transform Your
            <span class="highlight">Scent Marketing</span>
          </h1>
          <p class="hero-description">
            Revolutionary smart advertising platform for perfume dispensers. 
            Manage slot-based campaigns, track analytics, and maximize your fragrance marketing ROI.
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="feature-title">Precision Targeting</h4>
            <p class="feature-description">10-hour daily slots with smart time division for maximum impact</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9L12 6L16 10L21 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="feature-title">Real-time Analytics</h4>
            <p class="feature-description">Track performance, engagement, and ROI with detailed insights</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19A4 4 0 0 0 12 15H5A4 4 0 0 0 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19A4 4 0 0 0 19 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13A4 4 0 0 1 16 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="feature-title">Brand Management</h4>
            <p class="feature-description">Comprehensive dashboard for multi-brand campaign management</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 5H9.5A3.5 3.5 0 0 0 9.5 12H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 12H9.5A3.5 3.5 0 0 0 9.5 19H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="feature-title">Smart Balance System</h4>
            <p class="feature-description">Flexible credit system with 1 balance = 15 seconds of advertising</p>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">10hrs</div>
            <div class="stat-label">Daily Advertising Window</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">2</div>
            <div class="stat-label">Ad Package Types</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Real-time Monitoring</div>
          </div>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="hero-decoration">
        <div class="floating-element element-1"></div>
        <div class="floating-element element-2"></div>
        <div class="floating-element element-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}`;
const $toast = useToast();
const email = ref('');
const password = ref('');
const isLoggingIn = ref(false);

// Form validation
const emailError = ref(false);
const passwordError = ref(false);

// Computed validation
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isFormValid = computed(() => {
  return isValidEmail.value && password.value.length > 0;
});

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
      // Store tokens and user data
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Add a small delay to ensure localStorage is fully written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show success message
      $toast.success('Login successful! Redirecting...', {
        duration: 2000,
        position: 'top-right'
      });
      
      // Role-based redirection with a small delay
      const userRole = data.data.user.role;
      setTimeout(() => {
        if (userRole === 'admin') {
          navigateTo('/admin/dashboard');
        } else if (userRole === 'brand') {
          navigateTo('/brand/dashboard');
        } else {
          navigateTo('/');
        }
      }, 200);
    }
  }catch (error) {
    console.error(error);
  }finally {
    isLoggingIn.value = false;
  }
}

const validateForm = () => {
  // Reset errors
  emailError.value = false;
  passwordError.value = false;

  // Validate email
  if (!email.value) {
    emailError.value = true;
    return;
  }
  if (!isValidEmail.value) {
    emailError.value = true;
    return;
  }

  // Validate password
  if (!password.value) {
    passwordError.value = true;
    return;
  }

  // If all validations pass, attempt login
  if (isFormValid.value) {
    login();
  }
}

definePageMeta({
  layout: false,
});
</script>

<style scoped>
/* Reset and base styles */
* {
  box-sizing: border-box;
}

.login-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Login Form Section */
.login-form-section {
  flex: 0 0 40%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Brand Section */
.brand-section {
  text-align: center;
  margin-bottom: 1rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-circle {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #E8A598 0%, #D4917A 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(232, 165, 152, 0.3);
  transition: transform 0.3s ease;
}

.logo-circle:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* Form Container */
.form-container {
  background: #ffffff;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.form-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #1a1a1a;
}

.form-input:focus {
  outline: none;
  border-color: #E8A598;
  box-shadow: 0 0 0 3px rgba(232, 165, 152, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 0.25rem;
}

/* Checkbox Styles */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark {
  background: #E8A598;
  border-color: #E8A598;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Login Button */
.login-button {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #E8A598 0%, #D4917A 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(232, 165, 152, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Login Footer */
.login-footer {
  text-align: center;
  margin-top: 2rem;
}

.login-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* Hero Section */
.hero-section {
  flex: 1;
  background: linear-gradient(135deg, #E8C4B8 0%, #DFA194 50%, #D4917A 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.hero-content {
  max-width: 600px;
  color: white;
  z-index: 2;
  position: relative;
}

.hero-header {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
  letter-spacing: -1px;
  color: white;
}

.highlight {
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  line-height: 1.6;
  opacity: 1;
  margin: 0;
  color: white;
  font-weight: 500;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  color: #2D3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: rgba(223, 161, 148, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #DFA194;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1A202C;
}

.feature-description {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.4;
  color: #2D3748;
}

/* Hero Stats */
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
}

/* Decorative Elements */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: rgba(223, 161, 148, 0.15);
  animation: float 6s ease-in-out infinite;
}

.element-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.element-2 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 15%;
  animation-delay: 2s;
}

.element-3 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 25%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .login-form-section {
    flex: 0 0 45%;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-stats {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-form-section {
    flex: none;
    min-height: auto;
    padding: 2rem 1rem;
  }
  
  .hero-section {
    flex: none;
    min-height: 50vh;
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .features-grid {
    gap: 1rem;
  }
  
  .feature-card {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .login-form-wrapper {
    max-width: 100%;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .hero-title {
    font-size: 24px;
  }
}
</style>