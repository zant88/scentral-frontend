<template>
  <section class="section">
    <div class="section-header">
      <h1>Slot Management</h1>
      <div class="section-header-breadcrumb">
        <div class="breadcrumb-item active"><a href="#">Dashboard</a></div>
        <div class="breadcrumb-item">Slot Management</div>
      </div>
    </div>
    <div class="section-body">
      <h2 class="section-title">Advertising Slot Configuration</h2>
      <p class="section-lead">Manage 24-hour advertising slots with perfume and general ad allocation</p>
      
      <!-- Slot Configuration Summary -->
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-clock"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Active Slots</h4></div>
              <div class="card-body">{{ slotStats.activeSlots }}/{{ slotStats.totalSlots }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-leaf"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Perfume Slots</h4></div>
              <div class="card-body">{{ slotStats.perfumeSlots }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-tv"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>General Slots</h4></div>
              <div class="card-body">{{ slotStats.generalSlots }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-percentage"></i></div>
            <div class="card-wrap">
              <div class="card-header"><h4>Utilization</h4></div>
              <div class="card-body">{{ slotStats.utilization }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slot Configuration Panel -->
      <div class="row">
        <div class="col-lg-4 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>{{ editingSlot ? 'Edit Slot' : 'Create New Slot' }}</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveSlot">
                <div class="form-group">
                  <label>Slot Name</label>
                  <input type="text" class="form-control" v-model="slotForm.name" placeholder="e.g., Morning Slot 8AM" required>
                </div>
                
                <div class="form-group">
                  <label>Start Time</label>
                  <input type="time" class="form-control" v-model="slotForm.startTime" required>
                </div>
                
                <div class="form-group">
                  <label>End Time</label>
                  <input type="time" class="form-control" v-model="slotForm.endTime" required>
                </div>
                
                <div class="form-group">
                  <label>Perfume Ad Duration (seconds)</label>
                  <input type="number" class="form-control" v-model="slotForm.perfumeDuration" min="0" max="3600" placeholder="600">
                  <small class="form-text text-muted">Maximum seconds allocated for perfume ads (triggered by machine)</small>
                </div>
                
                <div class="form-group">
                  <label>General Ad Duration (seconds)</label>
                  <input type="number" class="form-control" v-model="slotForm.generalDuration" min="0" max="3600" placeholder="3000">
                  <small class="form-text text-muted">Remaining seconds for general brand ads</small>
                </div>
                
                <div class="form-group">
                  <label>Status</label>
                  <select class="form-control" v-model="slotForm.status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Priority</label>
                  <select class="form-control" v-model="slotForm.priority">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <div class="control-label">Configuration</div>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="allowPerfume" v-model="slotForm.allowPerfume">
                    <label class="custom-control-label" for="allowPerfume">Allow Perfume Ads</label>
                  </div>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="allowGeneral" v-model="slotForm.allowGeneral">
                    <label class="custom-control-label" for="allowGeneral">Allow General Ads</label>
                  </div>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="autoAssign" v-model="slotForm.autoAssign">
                    <label class="custom-control-label" for="autoAssign">Auto-assign Videos</label>
                  </div>
                </div>
                
                <div class="form-group mb-0">
                  <button type="submit" class="btn btn-primary mr-2" :disabled="saving">
                    <i class="fas fa-save"></i> {{ editingSlot ? 'Update' : 'Create' }} Slot
                  </button>
                  <button type="button" class="btn btn-secondary" @click="resetForm" v-if="editingSlot">
                    <i class="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-lg-8 col-md-12">
          <div class="card">
            <div class="card-header">
              <h4>24-Hour Slot Timeline</h4>
              <div class="card-header-action">
                <button class="btn btn-success" @click="generateDefaultSlots">
                  <i class="fas fa-magic"></i> Generate Default Slots
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="timeline-container">
                <div class="timeline-header">
                  <div class="timeline-hour" v-for="hour in 24" :key="hour">
                    {{ String(hour - 1).padStart(2, '0') }}:00
                  </div>
                </div>
                <div class="timeline-slots">
                  <div 
                    v-for="slot in sortedSlots" 
                    :key="slot.id"
                    class="timeline-slot"
                    :class="{
                      'slot-active': slot.status === 'active',
                      'slot-inactive': slot.status === 'inactive',
                      'slot-perfume': slot.allowPerfume,
                      'slot-general': slot.allowGeneral
                    }"
                    :style="getSlotStyle(slot)"
                    @click="editSlot(slot)"
                  >
                    <div class="slot-content">
                      <div class="slot-name">{{ slot.name }}</div>
                      <div class="slot-time">{{ slot.startTime }} - {{ slot.endTime }}</div>
                      <div class="slot-allocation">
                        <span v-if="slot.allowPerfume" class="badge badge-primary">P: {{ slot.perfumeDuration }}s</span>
                        <span v-if="slot.allowGeneral" class="badge badge-success">G: {{ slot.generalDuration }}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slots Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>All Slots</h4>
              <div class="card-header-form">
                <form>
                  <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search slots..." v-model="searchQuery">
                    <div class="input-group-btn">
                      <button class="btn btn-primary"><i class="fas fa-search"></i></button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Slot Name</th>
                      <th>Time Range</th>
                      <th>Duration Allocation</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assignments</th>
                      <th>Utilization</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="slot in filteredSlots" :key="slot.id">
                      <td>
                        <div class="font-weight-600">{{ slot.name }}</div>
                        <div class="text-muted small">
                          <span v-if="slot.allowPerfume" class="badge badge-primary badge-sm mr-1">Perfume</span>
                          <span v-if="slot.allowGeneral" class="badge badge-success badge-sm">General</span>
                        </div>
                      </td>
                      <td>
                        <div>{{ slot.startTime }} - {{ slot.endTime }}</div>
                        <div class="text-muted small">{{ calculateSlotDuration(slot.startTime, slot.endTime) }} total</div>
                      </td>
                      <td>
                        <div class="progress-group">
                          <div class="progress-group-header">
                            <div>Perfume: {{ slot.perfumeDuration }}s</div>
                            <div>{{ Math.round((slot.perfumeDuration / 3600) * 100) }}%</div>
                          </div>
                          <div class="progress progress-sm">
                            <div class="progress-bar bg-primary" :style="{width: (slot.perfumeDuration / 3600) * 100 + '%'}"></div>
                          </div>
                        </div>
                        <div class="progress-group mt-2">
                          <div class="progress-group-header">
                            <div>General: {{ slot.generalDuration }}s</div>
                            <div>{{ Math.round((slot.generalDuration / 3600) * 100) }}%</div>
                          </div>
                          <div class="progress progress-sm">
                            <div class="progress-bar bg-success" :style="{width: (slot.generalDuration / 3600) * 100 + '%'}"></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="slot.status === 'active' ? 'badge-success' : 'badge-secondary'">
                          {{ slot.status }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="getPriorityClass(slot.priority)">
                          {{ slot.priority }}
                        </span>
                      </td>
                      <td>
                        <div class="text-center">
                          <div class="font-weight-600">{{ slot.assignmentCount || 0 }}</div>
                          <div class="text-muted small">assignments</div>
                        </div>
                      </td>
                      <td>
                        <div class="progress" style="height: 6px;">
                          <div class="progress-bar" :class="getUtilizationClass(slot.utilization)" :style="{width: slot.utilization + '%'}"></div>
                        </div>
                        <small>{{ slot.utilization }}%</small>
                      </td>
                      <td>
                        <div class="dropdown">
                          <a href="#" data-toggle="dropdown" class="btn btn-sm btn-outline-primary dropdown-toggle">Actions</a>
                          <div class="dropdown-menu">
                            <a href="#" class="dropdown-item" @click="editSlot(slot)">Edit</a>
                            <a href="#" class="dropdown-item" @click="viewAssignments(slot.id)">View Assignments</a>
                            <a href="#" class="dropdown-item" @click="duplicateSlot(slot)">Duplicate</a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item text-danger" @click="deleteSlot(slot.id)">Delete</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})

import { ref, onMounted, computed } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`

// Reactive data
const slots = ref([])
const searchQuery = ref('')
const editingSlot = ref(null)
const saving = ref(false)

const slotStats = ref({
  activeSlots: 0,
  totalSlots: 0,
  perfumeSlots: 0,
  generalSlots: 0,
  utilization: 0
})

const slotForm = ref({
  name: '',
  startTime: '',
  endTime: '',
  perfumeDuration: 600,
  generalDuration: 3000,
  status: 'active',
  priority: 'medium',
  allowPerfume: true,
  allowGeneral: true,
  autoAssign: false
})

// Computed properties
const sortedSlots = computed(() => {
  return [...slots.value].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime)
  })
})

const filteredSlots = computed(() => {
  if (!searchQuery.value) return slots.value
  return slots.value.filter(slot => 
    slot.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    slot.startTime.includes(searchQuery.value) ||
    slot.endTime.includes(searchQuery.value)
  )
})

// Fetch slots data
const fetchSlots = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slots`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (data.success) {
      slots.value = data.data || []
      calculateStats()
    }
  } catch (error) {
    console.error('Error fetching slots:', error)
  }
}

// Calculate slot statistics
const calculateStats = () => {
  const activeSlots = slots.value.filter(s => s.status === 'active').length
  const perfumeSlots = slots.value.filter(s => s.allowPerfume).length
  const generalSlots = slots.value.filter(s => s.allowGeneral).length
  const totalUtilization = slots.value.reduce((sum, s) => sum + (s.utilization || 0), 0)
  
  slotStats.value = {
    activeSlots,
    totalSlots: slots.value.length,
    perfumeSlots,
    generalSlots,
    utilization: slots.value.length > 0 ? Math.round(totalUtilization / slots.value.length) : 0
  }
}

// Save slot (create or update)
const saveSlot = async () => {
  try {
    saving.value = true
    const accessToken = localStorage.getItem('access_token')
    const method = editingSlot.value ? 'PUT' : 'POST'
    const url = editingSlot.value 
      ? `${apiUrl}/api/slots/${editingSlot.value.id}`
      : `${apiUrl}/api/slots`
    
    const response = await fetchWithAuth(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slotForm.value)
    })
    
    const data = await response.json()
    if (data.success) {
      await fetchSlots()
      resetForm()
      // Show success message
    }
  } catch (error) {
    console.error('Error saving slot:', error)
  } finally {
    saving.value = false
  }
}

// Edit slot
const editSlot = (slot) => {
  editingSlot.value = slot
  slotForm.value = { ...slot }
}

// Reset form
const resetForm = () => {
  editingSlot.value = null
  slotForm.value = {
    name: '',
    startTime: '',
    endTime: '',
    perfumeDuration: 600,
    generalDuration: 3000,
    status: 'active',
    priority: 'medium',
    allowPerfume: true,
    allowGeneral: true,
    autoAssign: false
  }
}

// Delete slot
const deleteSlot = async (slotId) => {
  if (!confirm('Are you sure you want to delete this slot?')) return
  
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slots/${slotId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    const data = await response.json()
    if (data.success) {
      await fetchSlots()
    }
  } catch (error) {
    console.error('Error deleting slot:', error)
  }
}

// Generate default slots (10 hours from 8 AM to 6 PM)
const generateDefaultSlots = async () => {
  const defaultSlots = []
  const startHour = 8
  const endHour = 18
  
  for (let hour = startHour; hour < endHour; hour++) {
    defaultSlots.push({
      name: `Slot ${hour}:00 - ${hour + 1}:00`,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      perfumeDuration: 600,
      generalDuration: 3000,
      status: 'active',
      priority: 'medium',
      allowPerfume: true,
      allowGeneral: true,
      autoAssign: false
    })
  }
  
  try {
    const accessToken = localStorage.getItem('access_token')
    for (const slot of defaultSlots) {
      await fetchWithAuth(`${apiUrl}/api/slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slot)
      })
    }
    await fetchSlots()
  } catch (error) {
    console.error('Error generating default slots:', error)
  }
}

// Duplicate slot
const duplicateSlot = (slot) => {
  slotForm.value = {
    ...slot,
    name: `${slot.name} (Copy)`,
    id: undefined
  }
  editingSlot.value = null
}

// View assignments
const viewAssignments = (slotId) => {
  navigateTo(`/admin/slot-assignments?slot_id=${slotId}`)
}

// Utility functions
const calculateSlotDuration = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
}

const getSlotStyle = (slot) => {
  const startHour = parseInt(slot.startTime.split(':')[0])
  const endHour = parseInt(slot.endTime.split(':')[0])
  const left = (startHour / 24) * 100
  const width = ((endHour - startHour) / 24) * 100
  
  return {
    left: `${left}%`,
    width: `${width}%`
  }
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'high': return 'badge-danger'
    case 'medium': return 'badge-warning'
    case 'low': return 'badge-success'
    default: return 'badge-secondary'
  }
}

const getUtilizationClass = (utilization) => {
  if (utilization >= 80) return 'bg-success'
  if (utilization >= 50) return 'bg-warning'
  return 'bg-danger'
}

// Lifecycle
onMounted(() => {
  fetchSlots()
})
</script>

<style scoped>
.card-statistic-1 {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 2rem;
  padding: 20px;
  color: #fff;
  border-radius: 5px 0 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

.timeline-container {
  position: relative;
  min-height: 200px;
}

.timeline-header {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.timeline-hour {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  color: #6c757d;
  border-right: 1px solid #e9ecef;
}

.timeline-slots {
  position: relative;
  height: 120px;
}

.timeline-slot {
  position: absolute;
  height: 80px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.timeline-slot:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.slot-active {
  border-color: #47c363;
  background: linear-gradient(135deg, #47c363, #5dd976);
  color: white;
}

.slot-inactive {
  border-color: #6c757d;
  background: #e9ecef;
  color: #6c757d;
}

.slot-content {
  text-align: center;
  padding: 5px;
}

.slot-name {
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 2px;
}

.slot-time {
  font-size: 0.7rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

.slot-allocation {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.slot-allocation .badge {
  font-size: 0.6rem;
  padding: 2px 4px;
}

.progress-group {
  margin-bottom: 0;
}

.progress-group-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.progress-sm {
  height: 6px;
}

.bg-primary { background: #6777ef; }
.bg-success { background: #47c363; }
.bg-warning { background: #ffa426; }
.bg-info { background: #3abaf4; }
</style>