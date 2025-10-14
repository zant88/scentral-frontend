<template>
  <div>
    <section class="section">
      <div class="section-header">
        <h1>Profile Settings</h1>
        <div class="section-header-breadcrumb">
          <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
          <div class="breadcrumb-item">Profile</div>
        </div>
      </div>
      <div class="section-body">
        <h2 class="section-title">Manage Your Account</h2>
        <p class="section-lead">Update your profile information and change your password</p>
        
        <div class="row">
          <!-- Profile Information Card -->
          <div class="col-12 col-md-6 col-lg-6">
            <div class="card">
              <div class="card-header">
                <h4>Profile Information</h4>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" class="form-control" v-model="profile.fullName" readonly>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" class="form-control" v-model="profile.email" readonly>
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" class="form-control" v-model="profile.phone" readonly>
                </div>
                <div class="form-group">
                  <label>Role</label>
                  <input type="text" class="form-control" v-model="profile.role" readonly>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Change Password Card -->
          <div class="col-12 col-md-6 col-lg-6">
            <div class="card">
              <div class="card-header">
                <h4>Change Password</h4>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleChangePassword">
                  <div class="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.currentPassword"
                      :class="{ 'is-invalid': errors.currentPassword }"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.currentPassword">
                      {{ errors.currentPassword }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.newPassword"
                      :class="{ 'is-invalid': errors.newPassword }"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.newPassword">
                      {{ errors.newPassword }}
                    </div>
                    <small class="form-text text-muted">Password must be at least 6 characters long</small>
                  </div>
                  <div class="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.confirmPassword"
                      :class="{ 'is-invalid': errors.confirmPassword }"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.confirmPassword">
                      {{ errors.confirmPassword }}
                    </div>
                  </div>
                  <div class="form-group">
                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm mr-2"></span>
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchWithAuth, getUserData } from '~/utils/auth.js'

definePageMeta({
  middleware: 'auth'
})

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Profile data
const profile = ref({
  fullName: '',
  email: '',
  phone: '',
  role: ''
})

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Form state
const isSubmitting = ref(false)
const errors = ref({})

// Load user profile data
const loadProfile = () => {
  const userData = getUserData()
  if (userData) {
    profile.value = {
      fullName: userData.full_name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || ''
    }
  }
}

// Validate password form
const validateForm = () => {
  const newErrors = {}
  
  if (!passwordForm.value.currentPassword) {
    newErrors.currentPassword = 'Current password is required'
  }
  
  if (!passwordForm.value.newPassword) {
    newErrors.newPassword = 'New password is required'
  } else if (passwordForm.value.newPassword.length < 6) {
    newErrors.newPassword = 'Password must be at least 6 characters long'
  }
  
  if (!passwordForm.value.confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your new password'
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Handle password change
const handleChangePassword = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const response = await fetchWithAuth(`${apiUrl}/api/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordForm.value)
    })
    
    const data = await response.json()
    
    if (response.ok && data.meta && data.meta.success) {
      // Show success message
      showNotification('Password changed successfully!', 'success')
      
      // Reset form
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      errors.value = {}
    } else {
      // Show error message
      const errorMessage = data.meta && data.meta.message ? data.meta.message : 'Failed to change password'
      showNotification(errorMessage, 'error')
      
      // Set field-specific errors if any
      if (data.meta && data.meta.message && data.meta.message.includes('Current password')) {
        errors.value.currentPassword = data.meta.message
      }
    }
  } catch (error) {
    console.error('Error changing password:', error)
    showNotification('An error occurred while changing password', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Show notification (simple implementation)
const showNotification = (message, type) => {
  // Create a simple notification
  const notification = document.createElement('div')
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  notification.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  `
  
  document.body.appendChild(notification)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 5000)
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.form-control {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.form-control:focus {
  border-color: #6777ef;
  box-shadow: 0 0 0 3px rgba(103, 119, 239, 0.1);
  outline: none;
}

.is-invalid {
  border-color: #fc544b;
}

.invalid-feedback {
  color: #fc544b;
  font-size: 12px;
  margin-top: 5px;
}

.form-text {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

/* .btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
} */

/* .btn-primary {
  background-color: #6777ef;
  color: white;
} */

.btn-primary:hover {
  background-color: #5a67d8;
}

.btn-primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border .75s linear infinite;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.1em;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>