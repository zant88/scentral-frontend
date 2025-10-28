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
      <h2 class="section-title">Advertisement Slot Configuration</h2>
      <p class="section-lead">Manage 24-hour advertising slots with perfume and general ad allocation</p>

      <!-- Slot Configuration Summary -->
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-primary"><i class="fas fa-clock"></i></div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Hours</h4>
              </div>
              <div class="card-body">{{ slotStats.total_slots }}/24</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-success"><i class="fas fa-video"></i></div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Active Today</h4>
              </div>
              <div class="card-body">{{ slotStats.active_today }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-warning"><i class="fas fa-eye"></i></div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Total Plays</h4>
              </div>
              <div class="card-body">{{ formatNumber(slotStats.total_plays) }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6 col-12">
          <div class="card card-statistic-1">
            <div class="card-icon bg-info"><i class="fas fa-chart-line"></i></div>
            <div class="card-wrap">
              <div class="card-header">
                <h4>Revenue Today</h4>
              </div>
              <div class="card-body">{{ formatCurrency(slotStats.revenue_today) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- View Toggle and Actions -->
      <!-- <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group" role="group">
                  <button 
                    type="button" 
                    class="btn" 
                    :class="viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="viewMode = 'list'"
                  >
                    <i class="fas fa-list mr-2"></i>List View
                  </button>
                </div>
                <div class="d-flex">
                  <button class="btn btn-primary" @click="showAddSlot">
                    <i class="fas fa-plus mr-2"></i>Add New Slot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Enhanced Timeline View -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>24-Hour Slot Timeline Management</h4>
              <div class="card-header-action">
                <div class="d-flex align-items-center">
                  <select v-model="selectedDate" @change="fetchSlotsForDate" class="form-control form-control-sm mr-2"
                    style="width: 150px;">
                    <option value="">Select Date</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                  </select>
                  <button class="btn btn-primary btn-sm mr-2" @click="showQuickAssignModal = true">
                    <i class="fas fa-magic mr-1"></i> Quick Assign
                  </button>
                  <button class="btn btn-success btn-sm" @click="showSlotForm = true">
                    <i class="fas fa-plus mr-1"></i> Create Slot
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">
                <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
                <p class="text-muted mt-2">Loading slot data...</p>
              </div>
              <div v-else class="admin-hourly-timeline">
                <div v-for="hour in 24" :key="hour" :class="['admin-hour-slot', getAdminHourSlotClass(hour - 1)]">
                  <div class="hour-header">
                    <div class="hour-time">
                      {{ String(hour - 1).padStart(2, '0') }}:00
                    </div>
                    <div class="hour-status">
                      <div v-if="getCurrentHour() === hour - 1" class="current-indicator">
                        <span class="badge badge-primary">NOW</span>
                      </div>
                    </div>
                  </div>
                  <div class="hour-content">
                    <div v-if="getSlotsForHour(hour - 1).length > 0" class="slots-container">
                      <div v-for="slot in getSlotsForHour(hour - 1)" :key="slot.id" class="admin-slot-card"
                        :class="getSlotCardClass(slot)" @click="selectSlot(slot)">
                        <div class="slot-header">
                          <div class="slot-name">{{ slot.name }}</div>
                          <div class="slot-type-badge">
                            <i :class="slot.allow_perfume ? 'fas fa-leaf text-success' : 'fas fa-tv text-info'"></i>
                          </div>
                        </div>
                        <div class="slot-content">
                          <div v-if="slot.video_assignment" class="video-assignment">
                            <div class="video-title">{{ slot.video_assignment.video_title }}</div>
                            <div class="video-brand">{{ slot.video_assignment.brand_name }}</div>
                            <div class="slot-metrics">
                              <span class="metric">
                                <i class="fas fa-play text-muted"></i> {{ slot.video_assignment.plays_count || 0 }}
                              </span>
                              <span class="metric">
                                <i class="fas fa-wallet text-muted"></i> {{
                formatCurrency(slot.video_assignment.total_cost || 0) }}
                              </span>
                            </div>
                          </div>
                          <div v-else class="empty-assignment">
                            <span class="text-muted">No video assigned</span>
                            <button class="btn btn-xs btn-outline-primary ml-2" @click.stop="assignVideoToSlot(slot)">
                              <i class="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>
                        <div class="slot-actions">
                          <button class="btn btn-xs btn-outline-primary" @click.stop="editSlot(slot)">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-xs btn-outline-info" @click.stop="viewAssignments(slot)">
                            <i class="fas fa-eye"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="no-slots">
                      <div class="empty-slot-content">
                        <span class="text-muted">No slot configured</span>
                        <button class="btn btn-xs btn-success ml-2" @click="createSlotForHour(hour - 1)">
                          <i class="fas fa-plus"></i> Create
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Assign Modal -->
      <div v-if="showQuickAssignModal" class="modal fade show"
        style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="showQuickAssignModal = false">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Quick Video Assignment</h5>
              <button type="button" class="btn-close" @click="showQuickAssignModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <label class="form-label">Select Time Range</label>
                  <select v-model="quickAssign.startHour" class="form-control mb-3">
                    <option value="">Start Hour</option>
                    <option v-for="hour in 24" :key="hour" :value="hour - 1">
                      {{ String(hour - 1).padStart(2, '0') }}:00
                    </option>
                  </select>
                  <select v-model="quickAssign.endHour" class="form-control mb-3">
                    <option value="">End Hour</option>
                    <option v-for="hour in 24" :key="hour" :value="hour">
                      {{ String(hour).padStart(2, '0') }}:00
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Select Video</label>
                  <select v-model="quickAssign.videoId" class="form-control mb-3">
                    <option value="">Choose Video</option>
                    <option v-for="video in approvedVideos" :key="video.id" :value="video.id">
                      {{ video.title }} ({{ video.brand?.name }})
                    </option>
                  </select>
                  <label class="form-label">Priority</label>
                  <select v-model="quickAssign.priority" class="form-control">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showQuickAssignModal = false">Cancel</button>
              <button type="button" class="btn btn-primary" @click="executeQuickAssign">Assign Video</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="timeline-container">
          <div class="hours-header">
            <div class="hour-label" v-for="hour in 24" :key="hour">
              {{ String(hour - 1).padStart(2, '0') }}
            </div>
          </div>
          <div class="slots-grid">
            <div v-for="slot in filteredSlots" :key="slot.id" class="slot-card" :class="getSlotClasses(slot)"
              @click="selectSlot(slot)">
              <div class="slot-header">
                <h6>{{ slot.name }}</h6>
                <div class="slot-time">
                  {{ formatTimeOnly(slot.start_time) }} - {{ formatTimeOnly(slot.end_time) }}
                </div>
              </div>
              <div class="slot-content">
                <div class="slot-stats">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <i class="fas fa-video"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ slot.assignmentCount || 0 }}</div>
                      <div class="stat-label">Videos</div>
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-icon">
                      <i class="fas fa-chart-pie"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ slot.utilization }}%</div>
                      <div class="stat-label">Utilized</div>
                    </div>
                  </div>
                </div>
                <div class="slot-types">
                  <span v-if="slot.allow_perfume" class="slot-type-badge perfume">
                    <i class="fas fa-leaf"></i> {{ slot.perfume_seconds }}s
                  </span>
                  <span v-if="slot.allow_general" class="slot-type-badge general">
                    <i class="fas fa-tv"></i> {{ slot.general_seconds }}s
                  </span>
                </div>
                <div class="slot-progress">
                  <div class="progress-bar" :class="getUtilizationClass(slot.utilization)"
                    :style="{ width: slot.utilization + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- List View -->
    <div v-if="viewMode === 'list'" class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header actionable">
            <div class="left-action">
              <input class="check-all" type="checkbox" @change="toggleAll" />
              <a href="#" class="btn btn-icon btn-danger note-btn" @click="deleteSelectedSlots" v-if="anyChecked"
                data-toggle="tooltip" title="Delete Selected"><i class="fa fa-trash"></i></a>
              <a href="#" class="btn btn-icon btn-info note-btn" @click="bulkEditSlots" v-if="anyChecked"
                data-toggle="tooltip" title="Bulk Edit"><i class="fas fa-edit"></i></a>
              <button class="btn btn-primary" @click="showAddSlot">
                <i class="fas fa-plus mr-2"></i>Add New Slot
              </button>
              <button class="btn btn-secondary" @click="openMachineSelectionModal">
                <i class="fas fa-play mr-2"></i> Play Video Ads
              </button>
            </div>
            <div class="right-action">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Search slots..." v-model="searchQuery">
                <div class="input-group-append">
                  <button class="btn btn-primary"><i class="fas fa-search"></i></button>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">&nbsp;</th>
                    <th scope="col">Slot Name</th>
                    <th scope="col">Time Range</th>
                    <th scope="col">Duration Allocation</th>
                    <th scope="col">Status</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Assigned Videos</th>
                    <th scope="col">Utilization</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(slot, index) in filteredSlots" :key="slot.id">
                    <td class="checkbox"><input type="checkbox" v-model="checkedItems" :value="slot.id" /></td>
                    <td>
                      <div class="font-weight-600">{{ slot.name }}</div>
                      <div class="text-muted small">
                        <span v-if="slot.allow_perfume" class="badge badge-primary badge-sm mr-1">Perfume</span>
                        <span v-if="slot.allow_general" class="badge badge-success badge-sm">General</span>
                      </div>
                    </td>
                    <td>
                      <div>{{ formatTimeOnly(slot.start_time) }} - {{ formatTimeOnly(slot.end_time) }}</div>
                      <div class="text-muted small">{{ calculateSlotDuration(slot.start_time, slot.end_time) }} total
                      </div>
                    </td>
                    <td>
                      <div class="progress-group">
                        <div class="progress-group-header">
                          <div>Perfume: {{ slot.perfume_seconds }}s</div>
                          <div>{{ Math.round((slot.perfume_seconds / 3600) * 100) }}%</div>
                        </div>
                        <div class="progress progress-sm">
                          <div class="progress-bar bg-primary"
                            :style="{ width: (slot.perfume_seconds / 3600) * 100 + '%' }"></div>
                        </div>
                      </div>
                      <div class="progress-group mt-2">
                        <div class="progress-group-header">
                          <div>General: {{ slot.general_seconds }}s</div>
                          <div>{{ Math.round((slot.general_seconds / 3600) * 100) }}%</div>
                        </div>
                        <div class="progress progress-sm">
                          <div class="progress-bar bg-success"
                            :style="{ width: (slot.general_seconds / 3600) * 100 + '%' }"></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="slot.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'">
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
                        <div class="text-muted small">videos</div>
                      </div>
                    </td>
                    <td>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar" :class="getUtilizationClass(slot.utilization)"
                          :style="{ width: slot.utilization + '%' }"></div>
                      </div>
                      <small>{{ slot.utilization }}%</small>
                    </td>
                    <td>
                      <div class="dropdown">
                        <a href="#" data-toggle="dropdown"
                          class="btn btn-sm btn-outline-primary dropdown-toggle">Actions</a>
                        <div class="dropdown-menu">
                          <a href="#" class="dropdown-item" @click="editSlot(slot)">Edit</a>
                          <a href="#" class="dropdown-item" @click="viewAssignments(slot)">View Assignments</a>
                          <a href="#" class="dropdown-item" @click="assignVideoToSlot(slot)">Assign Video</a>
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

    <!-- Video Assignment View -->
    <div class="row" style="display: none;">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h4>Manual Video Assignment</h4>
            <div class="card-header-action">
              <button class="btn btn-sm btn-primary" @click="showManualAssignmentForm = true">
                <i class="fas fa-plus mr-2"></i>Assign Video
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="assignment-matrix">
              <div class="matrix-header">
                <div class="matrix-corner">Slots \ Videos</div>
                <div v-for="video in approvedVideos" :key="video.id" class="matrix-video-header">
                  <div class="video-thumbnail">
                    <img :src="getVideoThumbnail(video)" :alt="video.title" @error="handleImageError">
                  </div>
                  <div class="video-title">{{ video.title }}</div>
                  <div class="video-brand">{{ video.brand?.name }}</div>
                  <div class="video-type">
                    <span class="badge" :class="getAdTypeBadgeClass(video.adType)">
                      {{ video.adType }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="matrix-body">
                <div v-for="slot in slots" :key="slot.id" class="matrix-row">
                  <div class="matrix-slot-header">
                    <div class="slot-name">{{ slot.name }}</div>
                    <div class="slot-time">{{ formatTimeOnly(slot.start_time) }} - {{ formatTimeOnly(slot.end_time) }}
                    </div>
                    <div class="slot-type">
                      <span v-if="slot.allow_perfume" class="badge badge-primary badge-sm">P</span>
                      <span v-if="slot.allow_general" class="badge badge-success badge-sm">G</span>
                    </div>
                  </div>
                  <div v-for="video in approvedVideos" :key="`${slot.id}-${video.id}`" class="matrix-cell"
                    :class="getAssignmentCellClass(slot, video)" @click="toggleAssignment(slot, video)"
                    @dragover.prevent @drop="handleDrop(slot, video)">
                    <div v-if="isAssigned(slot, video)" class="assignment-indicator">
                      <i class="fas fa-check"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h4>Available Videos</h4>
          </div>
          <div class="card-body">
            <div class="video-list">
              <div v-for="video in approvedVideos" :key="video.id" class="video-item"
                :class="{ 'selected': selectedVideo?.id === video.id }" @click="selectVideo(video)" draggable="true"
                @dragstart="handleDragStart(video)">
                <div class="video-thumbnail">
                  <img :src="getVideoThumbnail(video)" :alt="video.title" @error="handleImageError">
                </div>
                <div class="video-info">
                  <div class="video-title">{{ video.title }}</div>
                  <div class="video-meta">
                    <span class="video-brand">{{ video.brand?.name }}</span>
                    <span class="video-duration">{{ formatDuration(video.durationSeconds) }}</span>
                  </div>
                  <div class="video-type">
                    <span class="badge" :class="getAdTypeBadgeClass(video.adType)">
                      {{ video.adType }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-4" v-if="selectedVideo">
          <div class="card-header">
            <h4>Video Preview</h4>
          </div>
          <div class="card-body p-0">
            <VideoPreview :video="selectedVideo" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Slot Form Modal -->
  <div v-if="showSlotForm" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);"
    @click.self="closeSlotForm">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingSlot ? 'Edit Slot' : 'Create New Slot' }}</h5>
          <button type="button" class="btn-close" @click="closeSlotForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSlot">
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="slotName">Slot Name</label>
                  <input type="text" id="slotName" class="form-control" v-model="slotForm.name"
                    placeholder="e.g., Morning Slot 8AM" required>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="slotPriority">Priority</label>
                  <select id="slotPriority" class="form-control" v-model="slotForm.priority">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="start_time">Start Time</label>
                  <input type="time" id="start_time" class="form-control" v-model="slotForm.start_time" required>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="end_time">End Time</label>
                  <input type="time" id="end_time" class="form-control" v-model="slotForm.end_time" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="perfumeDuration">Perfume Ad Duration (seconds)</label>
                  <input type="number" id="perfumeDuration" class="form-control" v-model="slotForm.perfume_seconds"
                    min="0" max="3600" placeholder="600">
                  <small class="form-text text-muted">Maximum seconds allocated for perfume ads (triggered by
                    machine)</small>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="generalDuration">General Ad Duration (seconds)</label>
                  <input type="number" id="generalDuration" class="form-control" v-model="slotForm.general_seconds"
                    min="0" max="3600" placeholder="3000">
                  <small class="form-text text-muted">Remaining seconds for general brand ads</small>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="slotStatus">Status</label>
                  <select id="slotStatus" class="form-control" v-model="slotForm.status">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Configuration</label>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="allow_perfume"
                      v-model="slotForm.allow_perfume">
                    <label class="custom-control-label" for="allow_perfume">Allow Perfume Ads</label>
                  </div>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="allow_general"
                      v-model="slotForm.allow_general">
                    <label class="custom-control-label" for="allow_general">Allow General Ads</label>
                  </div>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="autoAssign" v-model="slotForm.autoAssign">
                    <label class="custom-control-label" for="autoAssign">Auto-assign Videos</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <i class="fas fa-save mr-2"></i>{{ editingSlot ? 'Update' : 'Create' }} Slot
              </button>
              <button type="button" class="btn btn-secondary ml-2" @click="closeSlotForm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Slot Assignments Modal -->
  <div v-if="showAssignmentsModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);"
    @click.self="closeAssignmentsModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Assignments for {{ currentSlot?.name }} ({{ formatTimeOnly(currentSlot?.start_time) }}
            - {{ formatTimeOnly(currentSlot?.end_time) }})</h5>
          <button type="button" class="btn-close" @click="closeAssignmentsModal"></button>
        </div>
        <div class="modal-body">
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Device</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="assignment in slotAssignments" :key="assignment.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="video-thumbnail mr-3">
                        <img :src="getVideoThumbnail(assignment.video)" :alt="assignment.video?.title"
                          @error="handleImageError">
                      </div>
                      <div>
                        <div class="font-weight-600">{{ assignment.video?.title }}</div>
                        <div class="text-muted small">{{ formatDuration(assignment.video?.duration_seconds) }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ assignment.video?.brand?.name }}</td>
                  <td>
                    <span :class="getAdTypeBadgeClass(assignment.video?.ad_type)" class="badge">
                      {{ assignment.video?.ad_type }}
                    </span>
                  </td>
                  <td>{{ assignment.video?.duration_seconds }}</td>
                  <td class="text-center">
                    <span v-if="!assignment.machine_id" class="badge badge-info">All Devices</span>
                    <div v-else>
                      <span style="font-weight: bold">{{ assignment.machine?.code }}</span> <br /> <span
                        style="font-size: 12px;">{{ assignment.machine?.position }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getPriorityClass(assignment.priority)">
                      {{ assignment.priority }}
                    </span>
                  </td>
                  <td>
                    <span :class="assignment.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'" class="badge">
                      {{ assignment.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button @click="editAssignment(assignment)" class="btn btn-sm btn-warning" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteAssignment(assignment)" class="btn btn-sm btn-danger" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                      <button @click="openVideoPreview(assignment.video)" class="btn btn-sm btn-info" title="Preview">
                        <i class="fas fa-play"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="slotAssignments.length === 0" class="text-center py-3">
            <p class="text-muted">No assignments found for this slot</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Assignment Form Modal -->
  <div v-if="showAssignmentForm" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);"
    @click.self="closeAssignmentForm">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingAssignment ? 'Edit' : 'Add' }} Assignment</h5>
          <button type="button" class="btn-close" @click="closeAssignmentForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAssignment">
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentVideo">Video</label>
                  <select id="assignmentVideo" v-model="assignmentForm.video_id" @change="onVideoChange"
                    class="form-control" required>
                    <option value="">Select Video</option>
                    <option v-for="video in approvedVideos" :key="video.id" :value="video.id">
                      {{ video.title }} ({{ video.brand?.name }}) - {{ video.adType }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentPriority">Priority</label>
                  <select id="assignmentPriority" v-model="assignmentForm.priority" class="form-control">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentDevice">Device</label>
                  <select id="assignmentDevice" v-model="assignmentForm.machine_id" class="form-control">
                    <option value="">All Devices</option>
                    <option v-for="machine in machines" :key="machine.id" :value="machine.id">
                      {{ machine.code }} - {{ machine.position }}
                    </option>
                  </select>
                  <small class="form-text text-muted">Select a specific device or leave blank to assign to all
                    devices</small>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentStatus">Status</label>
                  <select id="assignmentStatus" v-model="assignmentForm.status" class="form-control">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label>Brand Balance Check</label>
                  <div class="form-control-plaintext video-preview" v-if="selectedAssignmentVideo">
                    <div><strong>Brand:</strong> {{ selectedAssignmentVideo.brand?.name }}</div>
                    <div><strong>Balance:</strong> {{ selectedAssignmentVideo.brand?.balance || 0 }} balance</div>
                    <div v-if="selectedAssignmentVideo.brand?.balance > 0" class="text-success">
                      <i class="fas fa-check-circle"></i> Sufficient balance for assignment
                    </div>
                    <div v-else class="text-danger">
                      <i class="fas fa-exclamation-circle"></i> Insufficient balance for assignment
                    </div>
                  </div>
                  <div class="form-control-plaintext text-muted" v-else>
                    Select a video to check brand balance
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary" :disabled="savingAssignment">
                <i class="fas fa-save mr-2"></i>{{ editingAssignment ? 'Update' : 'Create' }} Assignment
              </button>
              <button type="button" class="btn btn-secondary ml-2" @click="closeAssignmentForm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Video Assignment Modal -->
  <div v-if="showVideoAssignmentModal" class="modal fade show"
    style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeVideoAssignmentModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Assign Video to {{ currentSlot?.name }}</h5>
          <button type="button" class="btn-close" @click="closeVideoAssignmentModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveVideoAssignment">
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label for="videoSelect">Select Video</label>
                  <select id="videoSelect" v-model="videoAssignmentForm.video_id" class="form-control" required>
                    <option value="">Choose a video...</option>
                    <option v-for="video in approvedVideos" :key="video.id" :value="video.id">
                      {{ video.title }} ({{ video.brand?.name }}) - {{ video.adType }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label for="machineSelect">Select Device</label>
                  <select id="machineSelect" v-model="videoAssignmentForm.machine_id" class="form-control">
                    <option value="">Choose a device...</option>
                    <option v-for="machine in machines" :key="machine.id" :value="machine.id">
                      {{ machine.code }} - {{ machine.position }}
                    </option>
                  </select>
                  <small class="form-text text-muted">Select a specific device or leave blank to assign to all
                    devices</small>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentPriority">Priority</label>
                  <select id="assignmentPriority" v-model="videoAssignmentForm.priority" class="form-control">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentStatus">Status</label>
                  <select id="assignmentStatus" v-model="videoAssignmentForm.status" class="form-control">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary" :disabled="savingVideoAssignment">
                <i class="fas fa-save mr-2"></i>Assign Video
              </button>
              <button type="button" class="btn btn-secondary ml-2" @click="closeVideoAssignmentModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Video Preview Modal -->
  <div v-if="showVideoPreviewModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);"
    @click.self="closeVideoPreviewModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Video Preview</h5>
          <button type="button" class="btn-close" @click="closeVideoPreviewModal"></button>
        </div>
        <div class="modal-body p-0">
          <VideoPreview :video="previewVideo" />
        </div>
      </div>
    </div>
  </div>

  <!-- Video Information Modal -->
  <div v-if="showVideoInfoModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);"
    @click.self="closeVideoInfoModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Slot Information - {{ selectedSlot?.name }}</h5>
          <button type="button" class="btn-close" @click="closeVideoInfoModal"></button>
        </div>
        <div class="modal-body">
          <div class="slot-overview">
            <div class="slot-time-display">
              <div class="time-range">
                <div class="time-start">{{ formatTimeOnly(selectedSlot?.start_time) }}</div>
                <div class="time-arrow">→</div>
                <div class="time-end">{{ formatTimeOnly(selectedSlot?.end_time) }}</div>
              </div>
              <div class="time-duration">{{ calculateSlotDuration(selectedSlot?.start_time, selectedSlot?.end_time) }}
              </div>
            </div>

            <div class="slot-stats-grid">
              <div class="stat-card">
                <div class="stat-icon video-count">
                  <i class="fas fa-video"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ slotAssignments?.length || 0 }}</div>
                  <div class="stat-label">Videos Assigned</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon utilization">
                  <i class="fas fa-chart-pie"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ selectedSlot?.utilization || 0 }}%</div>
                  <div class="stat-label">Utilization Rate</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon capacity">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ selectedSlot?.perfume_seconds + selectedSlot?.general_seconds || 0 }}
                  </div>
                  <div class="stat-label">Total Capacity (s)</div>
                </div>
              </div>
            </div>

            <div class="slot-ad-types">
              <h6>Ad Types Configuration</h6>
              <div class="ad-types-grid">
                <div v-if="selectedSlot?.allow_perfume" class="ad-type-card perfume">
                  <div class="ad-type-header">
                    <i class="fas fa-leaf"></i>
                    <span>Perfume Ads</span>
                  </div>
                  <div class="ad-type-duration">{{ selectedSlot?.perfume_seconds }} seconds</div>
                </div>
                <div v-if="selectedSlot?.allow_general" class="ad-type-card general">
                  <div class="ad-type-header">
                    <i class="fas fa-tv"></i>
                    <span>General Ads</span>
                  </div>
                  <div class="ad-type-duration">{{ selectedSlot?.general_seconds }} seconds</div>
                </div>
                <div v-if="!selectedSlot?.allow_perfume && !selectedSlot?.allow_general" class="ad-type-card empty">
                  <div class="ad-type-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>No Ad Types</span>
                  </div>
                  <div class="ad-type-duration">Configure ad types</div>
                </div>
              </div>
            </div>

            <div class="assigned-videos-section">
              <div class="section-header">
                <h6>Assigned Videos</h6>
                <button class="btn btn-sm btn-primary" @click="assignVideoToSlot(selectedSlot)">
                  <i class="fas fa-plus"></i> Add Video
                </button>
              </div>
              <div v-if="slotAssignments.length > 0" class="assigned-videos-grid">
                <div v-for="assignment in slotAssignments" :key="assignment.id" class="video-card">
                  <div class="video-thumbnail">
                    <img :src="getVideoThumbnail(assignment.video)" :alt="assignment.video?.title"
                      @error="handleImageError">
                  </div>
                  <div class="video-info">
                    <div class="video-title">{{ assignment.video?.title }}</div>
                    <div class="video-meta">
                      <span class="badge" :class="getAdTypeBadgeClass(assignment.video?.adType)">
                        {{ assignment.video?.adType }}
                      </span>
                      <span class="video-duration">{{ formatDuration(assignment.video?.durationSeconds) }}</span>
                    </div>
                    <div class="video-brand">{{ assignment.video?.brand?.name }}</div>
                  </div>
                  <div class="video-actions">
                    <button @click="openVideoPreview(assignment.video)" class="btn btn-sm btn-info" title="Preview">
                      <i class="fas fa-play"></i>
                    </button>
                    <button @click="editAssignment(assignment)" class="btn btn-sm btn-warning" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteAssignment(assignment)" class="btn btn-sm btn-danger" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="no-videos">
                <i class="fas fa-video-slash"></i>
                <p>No videos assigned to this slot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Manual Video Assignment Modal -->
  <div v-if="showManualAssignmentForm" class="modal fade show"
    style="display: block; background-color: rgba(0,0,0,0.5);" @click.self="closeManualAssignmentForm">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Assign Video to Slot</h5>
          <button type="button" class="btn-close" @click="closeManualAssignmentForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveManualAssignment">
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="slotSelect">Select Slot</label>
                  <select id="slotSelect" v-model="manualAssignmentForm.slot_id" class="form-control" required>
                    <option value="">Choose a slot...</option>
                    <option v-for="slot in slots" :key="slot.id" :value="slot.id">
                      {{ slot.name }} ({{ formatTimeOnly(slot.start_time) }} - {{ formatTimeOnly(slot.end_time) }})
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="brandSelect">Select Brand</label>
                  <select id="brandSelect" v-model="manualAssignmentForm.brand_id" @change="filterVideosByBrand"
                    class="form-control" required>
                    <option value="">Choose a brand...</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label for="videoSelect">Select Video</label>
                  <select id="videoSelect" v-model="manualAssignmentForm.video_id" class="form-control" required>
                    <option value="">Choose a video...</option>
                    <option v-for="video in filteredVideos" :key="video.id" :value="video.id">
                      {{ video.title }} - {{ formatDuration(video.durationSeconds) }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label for="machineSelect">Select Device</label>
                  <select id="machineSelect" v-model="manualAssignmentForm.machine_id" class="form-control">
                    <option value="">Choose a device...</option>
                    <option v-for="machine in machines" :key="machine.id" :value="machine.id">
                      {{ machine.code }} - {{ machine.position }}
                    </option>
                  </select>
                  <small class="form-text text-muted">Select a specific device or leave blank to assign to all
                    devices</small>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentPriority">Priority</label>
                  <select id="assignmentPriority" v-model="manualAssignmentForm.priority" class="form-control">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-group">
                  <label for="assignmentStatus">Status</label>
                  <select id="assignmentStatus" v-model="manualAssignmentForm.status" class="form-control">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="form-group">
              <button type="submit" class="btn btn-primary" :disabled="savingManualAssignment">
                <i class="fas fa-save mr-2"></i>Assign Video
              </button>
              <button type="button" class="btn btn-secondary ml-2" @click="closeManualAssignmentForm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Machine Selection Modal -->
  <div v-if="showMachineModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);"
    @click.self="closeMachineSelectionModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select Machine for Video Ads</h5>
          <button type="button" class="btn-close" @click="closeMachineSelectionModal"></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="machineSelect">Select Machine</label>
            <select id="machineSelect" v-model="selectedMachineId" class="form-control" required>
              <option value="">Choose a machine...</option>
              <option v-for="machine in machines" :key="machine.id" :value="machine.id">
                {{ machine.code }} - {{ machine.position }}
              </option>
            </select>
            <small class="form-text text-muted">Select a machine to play video ads for</small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeMachineSelectionModal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="openVideoPlayer" :disabled="!selectedMachineId">
            <i class="fas fa-play mr-2"></i>Play Video Ads
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchWithAuth } from '~/utils/auth.js'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import VideoPreview from '~/components/VideoPreview.vue'

definePageMeta({
  middleware: 'admin'
})

const config = useRuntimeConfig()
const apiUrl = `${config.public.apiBase}`
const $toast = useToast()

// Reactive data
const slots = ref([])
const videos = ref([])
const brands = ref([])
const machines = ref([])
const slotAssignments = ref([])
const searchQuery = ref('')
const checkedItems = ref([])
const viewMode = ref('list')
const currentFilter = ref('all')
const selectedSlot = ref(null)
const selectedVideo = ref(null)
const saving = ref(false)
const savingAssignment = ref(false)
const savingVideoAssignment = ref(false)
const savingManualAssignment = ref(false)

// Modal states
const showSlotForm = ref(false)
const showAssignmentsModal = ref(false)
const showAssignmentForm = ref(false)
const showVideoAssignmentModal = ref(false)
const showVideoPreviewModal = ref(false)
const showManualAssignmentForm = ref(false)
const showVideoInfoModal = ref(false)
const showMachineModal = ref(false)
const selectedMachineId = ref('')

// Form states
const editingSlot = ref(null)
const editingAssignment = ref(null)
const currentSlot = ref(null)
const previewVideo = ref(null)

const slotStats = ref({
  active_slots: 0,
  total_slots: 0,
  perfume_slots: 0,
  general_slots: 0,
  utilization: 0
})

const slotForm = ref({
  name: '',
  start_time: '',
  end_time: '',
  perfume_seconds: 600,
  general_seconds: 3000,
  status: 'ACTIVE',
  priority: 'medium',
  allow_perfume: true,
  allow_general: true,
  autoAssign: false
})

const assignmentForm = ref({
  video_id: '',
  slot_id: '',
  machine_id: '',
  priority: 'medium',
  start_date: '',
  end_date: '',
  status: 'ACTIVE'
})

const videoAssignmentForm = ref({
  video_id: '',
  slot_id: '',
  machine_id: '',
  priority: 'medium',
  start_date: '',
  end_date: '',
  status: 'ACTIVE'
})

const manualAssignmentForm = ref({
  slot_id: '',
  brand_id: '',
  video_id: '',
  machine_id: '',
  start_date: '',
  end_date: '',
  priority: 'medium',
  status: 'ACTIVE'
})

// Computed properties
const anyChecked = computed(() => checkedItems.value.length > 0)

const filteredSlots = computed(() => {
  let result = slots.value

  // Apply search filter
  if (searchQuery.value) {
    result = result.filter(slot =>
      slot.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (slot.start_time && slot.start_time.includes(searchQuery.value)) ||
      (slot.end_time && slot.end_time.includes(searchQuery.value))
    )
  }

  // Apply view filter
  if (currentFilter.value === 'active') {
    result = result.filter(slot => slot.status === 'ACTIVE')
  } else if (currentFilter.value === 'perfume') {
    result = result.filter(slot => slot.allow_perfume)
  } else if (currentFilter.value === 'general') {
    result = result.filter(slot => slot.allow_general)
  }

  // Sort slots based on current time
  result = sortSlotsByCurrentTime(result)

  return result
})

const approvedVideos = computed(() => {
  return videos.value.filter(v => v.status === 'active')
})

const selectedAssignmentVideo = computed(() => {
  return videos.value.find(v => v.id === assignmentForm.value.video_id)
})

const filteredVideos = computed(() => {
  let result = approvedVideos.value

  // Filter by brand if selected
  if (manualAssignmentForm.value.brand_id) {
    result = result.filter(video => video.brand?.id === manualAssignmentForm.value.brand_id)
  }

  return result
})

// Methods
const sortSlotsByCurrentTime = (slotsToSort) => {
  if (!slotsToSort || slotsToSort.length === 0) return []

  // Get current time
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeString) => {
    if (!timeString) return 0

    // Handle different time formats
    let hours = 0, minutes = 0

    // Try to match HH:MM format
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})(?::\d{2})?/)
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
    } else {
      // Fallback for other formats
      const date = new Date(`2000-01-01 ${timeString}`)
      if (!isNaN(date.getTime())) {
        hours = date.getHours()
        minutes = date.getMinutes()
      }
    }

    return hours * 60 + minutes
  }

  // Categorize slots
  const currentSlots = []
  const upcomingSlots = []
  const pastSlots = []

  slotsToSort.forEach(slot => {
    const startTimeMinutes = timeToMinutes(slot.start_time)
    const endTimeMinutes = timeToMinutes(slot.end_time)

    // Handle slots that cross midnight (end time < start time)
    let isCurrent = false
    let isPast = false

    if (endTimeMinutes > startTimeMinutes) {
      // Normal slot (doesn't cross midnight)
      if (currentTimeInMinutes >= startTimeMinutes && currentTimeInMinutes < endTimeMinutes) {
        isCurrent = true
      } else if (currentTimeInMinutes >= endTimeMinutes) {
        isPast = true
      }
    } else {
      // Slot crosses midnight
      if (currentTimeInMinutes >= startTimeMinutes || currentTimeInMinutes < endTimeMinutes) {
        isCurrent = true
      } else if (currentTimeInMinutes >= endTimeMinutes && currentTimeInMinutes < startTimeMinutes) {
        isPast = true
      }
    }

    if (isCurrent) {
      currentSlots.push(slot)
    } else if (isPast) {
      pastSlots.push(slot)
    } else {
      upcomingSlots.push(slot)
    }
  })

  // Sort each category by start time
  const sortByStartTime = (a, b) => {
    const aStart = timeToMinutes(a.start_time)
    const bStart = timeToMinutes(b.start_time)
    return aStart - bStart
  }

  currentSlots.sort(sortByStartTime)
  upcomingSlots.sort(sortByStartTime)
  pastSlots.sort(sortByStartTime)

  // Combine: current slots first, then upcoming, then past
  return [...currentSlots, ...upcomingSlots, ...pastSlots]
}

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
    $toast.error('Failed to fetch slots', { duration: 5000, position: 'top-right' })
  }
}

// Fetch slot assignments for a specific slot to get detailed assignment info
const fetchSlotAssignments = async (slot_id) => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/slot/${slot_id}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data = await response.json()
    if (data.success) {
      slotAssignments.value = data.data || []
    } else {
      slotAssignments.value = []
      $toast.error(data.message || 'Failed to fetch slot assignments', { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error fetching slot assignments:', error)
    slotAssignments.value = []
    $toast.error('Failed to fetch slot assignments', { duration: 5000, position: 'top-right' })
  }
}

const fetchVideos = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/video`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data = await response.json()
    if (data.success) {
      videos.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching videos:', error)
    $toast.error('Failed to fetch videos', { duration: 5000, position: 'top-right' })
  }
}

const fetchBrands = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/brand`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data = await response.json()
    if (data.success) {
      brands.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching brands:', error)
    $toast.error('Failed to fetch brands', { duration: 5000, position: 'top-right' })
  }
}

const fetchMachines = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/device/dropdown`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data = await response.json()
    if (data.success) {
      machines.value = data.data || []
    }
  } catch (error) {
    console.error('Error fetching machines:', error)
    $toast.error('Failed to fetch machines', { duration: 5000, position: 'top-right' })
  }
}

const calculateStats = () => {
  const active_slots = slots.value.filter(s => s.status === 'ACTIVE').length
  const perfume_slots = slots.value.filter(s => s.allow_perfume).length
  const general_slots = slots.value.filter(s => s.allow_general).length
  const totalUtilization = slots.value.reduce((sum, s) => sum + (s.utilization || 0), 0)

  slotStats.value = {
    active_slots,
    total_slots: slots.value.length,
    perfume_slots,
    general_slots,
    utilization: slots.value.length > 0 ? Math.round(totalUtilization / slots.value.length) : 0
  }
}
const filterSlots = (filter) => {
  currentFilter.value = filter
}

const getSlotClasses = (slot) => {
  return {
    'slot-active': slot.status === 'ACTIVE',
    'slot-inactive': slot.status === 'INACTIVE',
    'slot-perfume': slot.allow_perfume,
    'slot-general': slot.allow_general,
    'slot-selected': selectedSlot.value?.id === slot.id
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

const getAdTypeBadgeClass = (type) => {
  switch (type) {
    case 'general': return 'badge-primary'
    case 'perfume': return 'badge-success'
    default: return 'badge-secondary'
  }
}

const calculateSlotDuration = (start_time, end_time) => {
  const formattedstart_time = formatTimeOnly(start_time)
  const formattedend_time = formatTimeOnly(end_time)

  const start = new Date(`2000-01-01 ${formattedstart_time}`)
  const end = new Date(`2000-01-01 ${formattedend_time}`)

  if (end < start) {
    end.setDate(end.getDate() + 1)
  }

  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
}

const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null || seconds === 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const formatTimeOnly = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'

  if (dateTimeString.includes('BC') || dateTimeString.startsWith('0001')) {
    const timeMatch = dateTimeString.match(/(\d{2}):(\d{2}):(\d{2})/)
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`
    }
  }

  try {
    const date = new Date(dateTimeString)
    if (isNaN(date.getTime())) {
      const timeMatch = dateTimeString.match(/(\d{1,2}):(\d{2})(?::\d{2})?/)
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, '0')
        const minutes = timeMatch[2]
        return `${hours}:${minutes}`
      }
      return 'N/A'
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    const timeMatch = dateTimeString.match(/(\d{1,2}):(\d{2})(?::\d{2})?/)
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0')
      const minutes = timeMatch[2]
      return `${hours}:${minutes}`
    }
    return 'N/A'
  }
}

const getVideoThumbnail = (video) => {
  // console.log('Getting thumbnail for video:', video);
  if (!video) return '/img/video-placeholder.svg'

  if (video.thumbnail_path) {
    if (video.thumbnail_path.startsWith('/')) {
      return video.thumbnail_path
    }
    if (video.thumbnail_path.startsWith('http')) {
      return video.thumbnail_path
    }
    return `/${video.thumbnail_path}`
  }

  if (video.file) {
    const baseName = video.file.substring(0, video.file.lastIndexOf('.'))
    return `/uploads/videos/thumbnails/${baseName}_thumb.jpg`
  }

  return '/img/video-placeholder.svg'
}

const handleImageError = (event) => {
  event.target.src = '/img/video-placeholder.svg'
}

// Slot management methods
const showAddSlot = () => {
  editingSlot.value = null
  resetSlotForm()
  showSlotForm.value = true
}

const editSlot = (slot) => {
  editingSlot.value = slot
  slotForm.value = { ...slot }
  showSlotForm.value = true
}

const resetSlotForm = () => {
  slotForm.value = {
    name: '',
    start_time: '',
    end_time: '',
    perfume_seconds: 600,
    general_seconds: 3000,
    status: 'ACTIVE',
    priority: 'medium',
    allow_perfume: true,
    allow_general: true,
    autoAssign: false
  }
}

const closeSlotForm = () => {
  showSlotForm.value = false
  resetSlotForm()
}

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
      $toast.success(`Slot ${editingSlot.value ? 'updated' : 'created'} successfully`, { duration: 5000, position: 'top-right' })
      await fetchSlots()
      closeSlotForm()
    } else {
      $toast.error(data.message || `Failed to ${editingSlot.value ? 'update' : 'create'} slot`, { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error saving slot:', error)
    $toast.error(`Failed to ${editingSlot.value ? 'update' : 'create'} slot`, { duration: 5000, position: 'top-right' })
  } finally {
    saving.value = false
  }
}

const deleteSlot = async (slot_id) => {
  if (!confirm('Are you sure you want to delete this slot?')) return

  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slots/${slot_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data = await response.json()
    if (data.success) {
      $toast.success('Slot deleted successfully', { duration: 5000, position: 'top-right' })
      await fetchSlots()
    } else {
      $toast.error(data.message || 'Failed to delete slot', { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error deleting slot:', error)
    $toast.error('Failed to delete slot', { duration: 5000, position: 'top-right' })
  }
}

const duplicateSlot = (slot) => {
  slotForm.value = {
    ...slot,
    name: `${slot.name} (Copy)`,
    id: undefined
  }
  editingSlot.value = null
  showSlotForm.value = true
}

// Bulk operations
const toggleAll = (event) => {
  if (event.target.checked) {
    checkedItems.value = filteredSlots.value.map(s => s.id)
  } else {
    checkedItems.value = []
  }
}

const deleteSelectedSlots = async () => {
  if (!confirm(`Are you sure you want to delete ${checkedItems.value.length} slots?`)) return

  try {
    const accessToken = localStorage.getItem('access_token')
    const strIDs = checkedItems.value.join(",")
    const response = await fetchWithAuth(`${apiUrl}/api/slots/${strIDs}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    const data = await response.json()
    if (data.success) {
      $toast.success('Slots deleted successfully', { duration: 5000, position: 'top-right' })
      checkedItems.value = []
      await fetchSlots()
    } else {
      $toast.error(data.message || 'Failed to delete slots', { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error deleting slots:', error)
    $toast.error('Failed to delete slots', { duration: 5000, position: 'top-right' })
  }
}

const bulkEditSlots = () => {
  $toast.info('Bulk edit feature coming soon', { duration: 5000, position: 'top-right' })
}

// Assignment methods
const selectSlot = (slot) => {
  selectedSlot.value = slot
  slotAssignments.value = slot.assignments || []
  showVideoInfoModal.value = true
}

const selectVideo = (video) => {
  selectedVideo.value = video
}

const viewAssignments = (slot) => {
  currentSlot.value = slot
  slotAssignments.value = slot.assignments || []
  showAssignmentsModal.value = true
}

const closeAssignmentsModal = () => {
  showAssignmentsModal.value = false
  currentSlot.value = null
  slotAssignments.value = []
}

const closeVideoInfoModal = () => {
  showVideoInfoModal.value = false
  selectedSlot.value = null
  slotAssignments.value = []
}

const showAddAssignment = () => {
  editingAssignment.value = null
  assignmentForm.value = {
    video_id: '',
    slot_id: currentSlot.value.id,
    priority: 'medium',
    start_date: '',
    end_date: '',
    status: 'ACTIVE'
  }
  showAssignmentForm.value = true
}

const editAssignment = (assignment) => {
  editingAssignment.value = assignment
  assignmentForm.value = { ...assignment }
  showAssignmentForm.value = true
}

const closeAssignmentForm = () => {
  showAssignmentForm.value = false
  assignmentForm.value = {
    video_id: '',
    slot_id: '',
    priority: 'medium',
    start_date: '',
    end_date: '',
    status: 'ACTIVE'
  }
}

const saveAssignment = async () => {
  try {
    savingAssignment.value = true
    const accessToken = localStorage.getItem('access_token')
    const method = editingAssignment.value ? 'PUT' : 'POST'
    const url = editingAssignment.value
      ? `${apiUrl}/api/slot-assignment/${editingAssignment.value.id}`
      : `${apiUrl}/api/slot-assignment`

    const response = await fetchWithAuth(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentForm.value)
    })

    const data = await response.json()
    if (data.success) {
      $toast.success(`Assignment ${editingAssignment.value ? 'updated' : 'created'} successfully`, { duration: 5000, position: 'top-right' })
      await fetchSlotAssignments(currentSlot.value.id)
      closeAssignmentForm()
    } else {
      $toast.error(data.message || `Failed to ${editingAssignment.value ? 'update' : 'create'} assignment`, { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error saving assignment:', error)
    $toast.error(`Failed to ${editingAssignment.value ? 'update' : 'create'} assignment`, { duration: 5000, position: 'top-right' })
  } finally {
    savingAssignment.value = false
  }
}

const deleteAssignment = async (assignment) => {
  if (!confirm('Are you sure you want to delete this assignment?')) return

  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/${assignment.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data = await response.json()
    if (data.success) {
      $toast.success('Assignment deleted successfully', { duration: 5000, position: 'top-right' })
      await fetchSlotAssignments(currentSlot.value.id)
    } else {
      $toast.error(data.message || 'Failed to delete assignment', { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error deleting assignment:', error)
    $toast.error('Failed to delete assignment', { duration: 5000, position: 'top-right' })
  }
}

const onVideoChange = () => {
  if (assignmentForm.value.video_id) {
    const video = videos.value.find(v => v.id === assignmentForm.value.video_id)
    if (video) {
      // You can set default values based on video properties
      console.log('Selected video:', video);
    }
  }
}

// Video assignment methods
const assignVideoToSlot = (slot) => {
  currentSlot.value = slot
  videoAssignmentForm.value = {
    video_id: '',
    slot_id: slot.id,
    machine_id: '',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ACTIVE'
  }
  showVideoAssignmentModal.value = true
}

const closeVideoAssignmentModal = () => {
  showVideoAssignmentModal.value = false
  videoAssignmentForm.value = {
    video_id: '',
    slot_id: '',
    machine_id: '',
    priority: 'medium',
    start_date: '',
    end_date: '',
    status: 'ACTIVE'
  }
}

const saveVideoAssignment = async () => {
  try {
    // Get selected video
    const selectedVideo = videos.value.find(v => v.id === videoAssignmentForm.value.video_id)
    if (!selectedVideo) {
      $toast.error('Please select a valid video', { duration: 5000, position: 'top-right' })
      return
    }

    // Check if the video is already assigned to this slot on the same device
    let existingAssignment = null

    if (videoAssignmentForm.value.machine_id) {
      // Check for assignment on specific device
      existingAssignment = slotAssignments.value.find(a =>
        a.video_id === videoAssignmentForm.value.video_id &&
        a.slot_id === currentSlot.value.id &&
        a.machine_id === videoAssignmentForm.value.machine_id &&
        a.status === 'ACTIVE'
      )

      if (existingAssignment) {
        $toast.error('This video is already assigned to this slot on the selected device', { duration: 5000, position: 'top-right' })
        return
      }
    } else {
      // Check for assignment on all devices (no specific device)
      existingAssignment = slotAssignments.value.find(a =>
        a.video_id === videoAssignmentForm.value.video_id &&
        a.slot_id === currentSlot.value.id &&
        !a.machine_id && // Assignment for all devices
        a.status === 'ACTIVE'
      )

      if (existingAssignment) {
        $toast.error('This video is already assigned to this slot for all devices', { duration: 5000, position: 'top-right' })
        return
      }
    }

    savingVideoAssignment.value = true
    const accessToken = localStorage.getItem('access_token')

    // Set default dates
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const assignmentData = {
      ...videoAssignmentForm.value,
      start_date: today,
      end_date: thirtyDaysLater,
      ad_type: selectedVideo.adType // Automatically set based on video type
    }

    console.log('Sending assignment data:', assignmentData)

    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentData)
    })

    const data = await response.json()
    if (data.success) {
      $toast.success('Video assigned successfully', { duration: 5000, position: 'top-right' })
      await fetchSlotAssignments(currentSlot.value.id)
      await fetchSlots()
      closeVideoAssignmentModal()
    } else {
      // Handle specific error messages from the backend
      if (data.message && (data.message.includes('full') || data.message.includes('full') || data.message.includes('capacity'))) {
        $toast.error(data.message, { duration: 8000, position: 'top-right' })
      } else if (data.message && (data.message.includes('perfume') || data.message.includes('general'))) {
        $toast.error(data.message, { duration: 8000, position: 'top-right' })
      } else {
        $toast.error(data.message || 'Failed to assign video', { duration: 5000, position: 'top-right' })
      }
    }
  } catch (error) {
    console.error('Error assigning video:', error)
    $toast.error('Failed to assign video', { duration: 5000, position: 'top-right' })
  } finally {
    savingVideoAssignment.value = false
  }
}

// Assignment matrix methods
const isAssigned = (slot, video) => {
  return slotAssignments.value.some(a =>
    a.slot_id === slot.id && a.video_id === video.id && a.status === 'ACTIVE'
  )
}

const getAssignmentCellClass = (slot, video) => {
  const isCompatible = (video.adType === 'perfume' && slot.allow_perfume) ||
    (video.adType === 'general' && slot.allow_general)

  return {
    'assigned': isAssigned(slot, video),
    'compatible': isCompatible,
    'incompatible': !isCompatible
  }
}

const toggleAssignment = async (slot, video) => {
  const isVideoAssigned = isAssigned(slot, video)

  if (isVideoAssigned) {
    const assignment = slotAssignments.value.find(a =>
      a.slot_id === slot.id && a.video_id === video.id && a.status === 'ACTIVE'
    )

    if (assignment) {
      await deleteAssignment(assignment)
    }
  } else {
    assignmentForm.value = {
      video_id: video.id,
      slot_id: slot.id,
      priority: 'medium',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE'
    }

    await saveAssignment()
  }
}

const autoAssignVideos = async () => {
  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment/auto-assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (data.success) {
      $toast.success('Videos auto-assigned successfully', { duration: 5000, position: 'top-right' })
      await fetchSlots()
    } else {
      $toast.error(data.message || 'Failed to auto-assign videos', { duration: 5000, position: 'top-right' })
    }
  } catch (error) {
    console.error('Error auto-assigning videos:', error)
    $toast.error('Failed to auto-assign videos', { duration: 5000, position: 'top-right' })
  }
}

// Drag and drop methods
const handleDragStart = (video) => {
  window.draggedVideo = video
}

const handleDrop = async (slot, video) => {
  if (window.draggedVideo) {
    await toggleAssignment(slot, window.draggedVideo)
    window.draggedVideo = null
  }
}

// Video preview methods
const openVideoPreview = (video) => {
  console.log('Opening video preview for:', video);
  previewVideo.value = video;
  showVideoPreviewModal.value = true;
}

const closeVideoPreviewModal = () => {
  showVideoPreviewModal.value = false
  previewVideo.value = null
}

// Lifecycle
onMounted(() => {
  fetchSlots()
  fetchVideos()
  fetchBrands()
  fetchMachines()
})

// Manual assignment methods
const filterVideosByBrand = async () => {
  if (!manualAssignmentForm.value.brand_id) {
    filteredVideos.value = videos.value
    return
  }

  try {
    const accessToken = localStorage.getItem('access_token')
    const response = await fetchWithAuth(`${apiUrl}/api/video/brand/${manualAssignmentForm.value.brand_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (data.success) {
      filteredVideos.value = data.data
    } else {
      $toast.error('Failed to fetch videos for brand', { duration: 5000, position: 'top-right' })
      filteredVideos.value = videos.value
    }
  } catch (error) {
    console.error('Error fetching videos by brand:', error)
    $toast.error('Failed to fetch videos for brand', { duration: 5000, position: 'top-right' })
    filteredVideos.value = videos.value
  }
}

const closeManualAssignmentForm = () => {
  showManualAssignmentForm.value = false
  manualAssignmentForm.value = {
    slot_id: '',
    brand_id: '',
    video_id: '',
    machine_id: '',
    start_date: '',
    end_date: '',
    priority: 'medium',
    status: 'ACTIVE'
  }
}

const saveManualAssignment = async () => {
  try {
    // Get selected video
    const selectedVideo = videos.value.find(v => v.id === manualAssignmentForm.value.video_id)
    if (!selectedVideo) {
      $toast.error('Please select a valid video', { duration: 5000, position: 'top-right' })
      return
    }

    // Check if the video is already assigned to this slot on the same device
    // If no device is selected (machine_id is empty), check for any assignment on this slot
    if (manualAssignmentForm.value.machine_id) {
      // Check for assignment on specific device
      const existingAssignment = slotAssignments.value.find(a =>
        a.video_id === manualAssignmentForm.value.video_id &&
        a.slot_id === manualAssignmentForm.value.slot_id &&
        a.machine_id === manualAssignmentForm.value.machine_id &&
        a.status === 'ACTIVE'
      )

      if (existingAssignment) {
        $toast.error('This video is already assigned to this slot on the selected device', { duration: 5000, position: 'top-right' })
        return
      }
    } else {
      // Check for assignment on all devices (no specific device)
      const existingAssignment = slotAssignments.value.find(a =>
        a.video_id === manualAssignmentForm.value.video_id &&
        a.slot_id === manualAssignmentForm.value.slot_id &&
        !a.machine_id && // Assignment for all devices
        a.status === 'ACTIVE'
      )

      if (existingAssignment) {
        $toast.error('This video is already assigned to this slot for all devices', { duration: 5000, position: 'top-right' })
        return
      }
    }

    savingManualAssignment.value = true
    const accessToken = localStorage.getItem('access_token')

    // Set default dates
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const assignmentData = {
      ...manualAssignmentForm.value,
      start_date: today,
      end_date: thirtyDaysLater,
      ad_type: selectedVideo.adType // Automatically set based on video type
    }

    const response = await fetchWithAuth(`${apiUrl}/api/slot-assignment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentData)
    })

    const data = await response.json()
    if (data.success) {
      $toast.success('Video assigned successfully', { duration: 5000, position: 'top-right' })
      await fetchSlots()
      closeManualAssignmentForm()
    } else {
      // Handle specific error messages from the backend
      if (data.message && (data.message.includes('full') || data.message.includes('full') || data.message.includes('capacity'))) {
        $toast.error(data.message, { duration: 8000, position: 'top-right' })
      } else if (data.message && (data.message.includes('perfume') || data.message.includes('general'))) {
        $toast.error(data.message, { duration: 8000, position: 'top-right' })
      } else {
        $toast.error(data.message || 'Failed to assign video', { duration: 5000, position: 'top-right' })
      }
    }
  } catch (error) {
    console.error('Error assigning video:', error)
    $toast.error('Failed to assign video', { duration: 5000, position: 'top-right' })
  } finally {
    savingManualAssignment.value = false
  }
}

// Machine selection methods
const openMachineSelectionModal = () => {
  selectedMachineId.value = ''
  showMachineModal.value = true
}

const closeMachineSelectionModal = () => {
  showMachineModal.value = false
  selectedMachineId.value = ''
}

const openVideoPlayer = () => {
  if (!selectedMachineId.value) {
    $toast.error('Please select a machine', { duration: 5000, position: 'top-right' })
    return
  }

  // Find the selected machine to get its code
  const selectedMachine = machines.value.find(m => m.id === selectedMachineId.value)
  if (!selectedMachine) {
    $toast.error('Invalid machine selection', { duration: 5000, position: 'top-right' })
    return
  }

  // Open video player in a new tab with the machine code
  const videoPlayerUrl = `/video-player?machineId=${selectedMachine.code}`
  window.open(videoPlayerUrl, '_blank')

  // Close the modal
  closeMachineSelectionModal()

  $toast.success(`Opening video player for machine ${selectedMachine.code}`, { duration: 5000, position: 'top-right' })
}

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

/* Enhanced Timeline Layout */
.timeline-container {
  padding: 20px 0;
}

.hours-header {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 1px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.hour-label {
  text-align: center;
  font-size: 0.75rem;
  color: #6c757d;
  padding: 8px 0;
  font-weight: 600;
  background: #f8f9fa;
}

.slots-grid {
  display: grid;
  gap: 16px;
}

.slot-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.slot-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6777ef, #47c363);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.slot-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.slot-card:hover::before {
  transform: scaleX(1);
}

.slot-card.slot-active {
  border-color: #47c363;
  background: linear-gradient(135deg, rgba(71, 195, 99, 0.05), rgba(93, 217, 118, 0.1));
}

.slot-card.slot-inactive {
  opacity: 0.6;
  background: #f8f9fa;
}

.slot-card.slot-perfume {
  border-left: 4px solid #28a745;
}

.slot-card.slot-general {
  border-left: 4px solid #007bff;
}

.slot-card.slot-selected {
  border-color: #6777ef;
  box-shadow: 0 0 0 3px rgba(103, 119, 239, 0.2);
}

.slot-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.slot-header h6 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.slot-time {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.slot-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
}

.stat-icon.video-count {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.stat-icon.utilization {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.stat-icon.capacity {
  background: linear-gradient(135deg, #6777ef, #5a67d8);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slot-types {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.slot-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slot-type-badge.perfume {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.slot-type-badge.general {
  background: linear-gradient(135deg, #cce7ff, #b3d9ff);
  color: #004085;
  border: 1px solid #b3d9ff;
}

.slot-progress {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-bar.bg-success {
  background: linear-gradient(90deg, #28a745, #5cb85c);
}

.progress-bar.bg-warning {
  background: linear-gradient(90deg, #ffc107, #ffca2c);
}

.progress-bar.bg-danger {
  background: linear-gradient(90deg, #dc3545, #e74c3c);
}

/* Video Information Modal Styles */
.slot-overview {
  padding: 20px 0;
}

.slot-time-display {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
}

.time-range {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.time-start,
.time-end {
  background: #6777ef;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  min-width: 80px;
  text-align: center;
}

.time-arrow {
  color: #6c757d;
  font-size: 1.5rem;
  font-weight: bold;
}

.time-duration {
  font-size: 1rem;
  color: #6c757d;
  font-weight: 500;
}

.slot-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-card .stat-icon {
  width: 50px;
  height: 50px;
  font-size: 1.3rem;
  margin-bottom: 12px;
}

.slot-ad-types {
  margin-bottom: 24px;
}

.slot-ad-types h6 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.ad-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.ad-type-card {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.ad-type-card.perfume {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border-color: #28a745;
}

.ad-type-card.general {
  background: linear-gradient(135deg, #cce7ff, #b3d9ff);
  border-color: #007bff;
}

.ad-type-card.empty {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.ad-type-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ad-type-header i {
  font-size: 1.2rem;
}

.ad-type-header span {
  font-weight: 600;
  color: #2c3e50;
}

.ad-type-duration {
  font-size: 0.9rem;
  color: #6c757d;
}

.assigned-videos-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h6 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.assigned-videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.video-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  display: flex;
  gap: 12px;
  align-items: center;
  transition: all 0.3s ease;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.video-thumbnail {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.video-duration {
  font-size: 0.75rem;
  color: #6c757d;
}

.video-brand {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.video-actions {
  display: flex;
  gap: 4px;
}

.no-videos {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-videos i {
  font-size: 3rem;
  margin-bottom: 16px;
  color: #dee2e6;
}

.no-videos p {
  margin: 0;
  font-size: 1rem;
}

/* Assignment Matrix Styles */
.assignment-matrix {
  overflow-x: auto;
}

.matrix-header {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 10px;
}

.matrix-corner {
  width: 150px;
  padding: 10px;
  font-weight: 600;
  text-align: center;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.matrix-video-header {
  width: 120px;
  padding: 10px;
  text-align: center;
  border-right: 1px solid #e9ecef;
}

.video-thumbnail {
  width: 60px;
  height: 40px;
  margin: 0 auto 5px;
  overflow: hidden;
  border-radius: 4px;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-title {
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-brand {
  font-size: 0.6rem;
  color: #6c757d;
  margin-bottom: 2px;
}

.video-type .badge {
  font-size: 0.5rem;
  padding: 2px 4px;
}

.matrix-body {
  max-height: 400px;
  overflow-y: auto;
}

.matrix-row {
  display: flex;
  border-bottom: 1px solid #e9ecef;
}

.matrix-slot-header {
  width: 150px;
  padding: 10px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.matrix-slot-header .slot-name {
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 2px;
}

.matrix-slot-header .slot-time {
  font-size: 0.7rem;
  color: #6c757d;
  margin-bottom: 2px;
}

.matrix-cell {
  width: 120px;
  height: 60px;
  padding: 10px;
  text-align: center;
  border-right: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;
}

.matrix-cell:hover {
  background: #f8f9fa;
}

.matrix-cell.assigned {
  background: #d4edda;
}

.matrix-cell.compatible {
  border: 1px dashed #28a745;
}

.matrix-cell.incompatible {
  background: #f8d7da;
  cursor: not-allowed;
}

.assignment-indicator {
  color: #28a745;
  font-size: 1.2rem;
}

/* Video List Styles */
.video-list {
  max-height: 400px;
  overflow-y: auto;
}

.video-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.video-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
}

.video-item.selected {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.video-item .video-thumbnail {
  width: 60px;
  height: 40px;
  margin-right: 12px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.video-info {
  flex: 1;
}

.video-info .video-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.video-preview {
  font-size: 0.875rem;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
}

.badge-primary {
  background-color: #007bff;
}

.badge-success {
  background-color: #28a745;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-danger {
  background-color: #dc3545;
}

.badge-info {
  background-color: #17a2b8;
}

.badge-secondary {
  background-color: #6c757d;
}

.progress {
  background-color: #e9ecef;
}

.modal {
  z-index: 1050;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 0.75;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hours-header {
    grid-template-columns: repeat(12, 1fr);
  }

  .slots-grid {
    grid-template-columns: 1fr;
  }

  .slot-stats {
    grid-template-columns: 1fr;
  }

  .slot-stats-grid {
    grid-template-columns: 1fr;
  }

  .ad-types-grid {
    grid-template-columns: 1fr;
  }

  .assigned-videos-grid {
    grid-template-columns: 1fr;
  }

  .time-range {
    flex-direction: column;
    gap: 8px;
  }

  .time-start,
  .time-end {
    min-width: auto;
    width: 100%;
  }
}
</style>
