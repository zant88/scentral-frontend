<template>
  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header actionable">
          <div class="left-action">
            <h4>Create User</h4>
          </div>
          <div class="right-action">
            <a href="#" class="btn btn-icon btn-outline-danger note-btn" @click="closeAdd" data-toggle="tooltip" title="Add New"><i class="fas fa-times"></i></a>
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
// ...import and logic as in user.vue...
</script>
