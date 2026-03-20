<template>
  <div class="export-modal">
    <div class="modal-overlay" @click.self="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>导出工作流</h3>
        <button @click="$emit('close')" class="close-btn">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div class="modal-body">
        <div class="export-options">
          <div class="option-group">
            <label>文件名</label>
            <input type="text" v-model="fileName" class="filename-input" />
          </div>

          <div class="option-group">
            <label>导出格式</label>
            <select v-model="exportFormat" class="format-select">
              <option value="json">JSON (.json)</option>
              <option value="workflow">工作流格式 (.workflow)</option>
            </select>
          </div>

          <div class="option-group">
            <label>
              <input type="checkbox" v-model="includeMetadata" />
              包含元数据
            </label>
          </div>

          <div class="option-group">
            <label>
              <input type="checkbox" v-model="minify" />
              压缩输出
            </label>
          </div>
        </div>

        <div v-if="isExporting" class="export-progress">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          <span class="progress-text">导出中... {{ progress }}%</span>
        </div>

        <div v-if="error" class="error-message"><i class="icon-error"></i> {{ error }}</div>

        <div v-if="exportSuccess" class="success-message">
          <i class="icon-success"></i> 导出成功！
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn cancel-btn">取消</button>
        <button @click="startExport" class="btn export-btn" :disabled="isExporting">
          <i class="icon-download"></i> 导出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { saveAs } from 'file-saver'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  workflowId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const workflowStore = useWorkflowStore()
const fileName = ref('')
const exportFormat = ref('json')
const includeMetadata = ref(true)
const minify = ref(false)
const isExporting = ref(false)
const progress = ref(0)
const error = ref(null)
const exportSuccess = ref(false)

const workflowName = computed(() => {
  return fileName.value || `工作流_${new Date().toISOString().slice(0, 10)}`
})

const startExport = async () => {
  try {
    isExporting.value = true
    error.value = null
    exportSuccess.value = false
    progress.value = 0

    // 模拟进度更新
    const interval = setInterval(() => {
      progress.value = Math.min(progress.value + 10, 90)
    }, 200)

    // 获取工作流数据
    const workflow = await workflowStore.getWorkflow(props.workflowId)

    // 准备导出数据
    let exportData = { ...workflow }
    if (!includeMetadata.value) {
      delete exportData.metadata
      delete exportData.createdAt
      delete exportData.updatedAt
    }

    // 格式化JSON
    const jsonString = minify.value
      ? JSON.stringify(exportData)
      : JSON.stringify(exportData, null, 2)

    // 创建Blob
    const blob = new Blob([jsonString], {
      type: 'application/json',
    })

    // 完成导出
    clearInterval(interval)
    progress.value = 100

    // 设置文件扩展名
    const extension = exportFormat.value === 'workflow' ? '.workflow' : '.json'
    saveAs(blob, `${workflowName.value}${extension}`)

    exportSuccess.value = true
    setTimeout(() => emit('close'), 1500)
  } catch (err) {
    error.value = '导出失败: ' + err.message
  } finally {
    isExporting.value = false
    progress.value = 0
  }
}
</script>

<style scoped>
.export-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group label {
  font-weight: 500;
}

.filename-input,
.format-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  width: 100%;
}

.export-progress {
  margin-top: 20px;
  height: 24px;
  background: #f5f5f5;
  border-radius: 4px;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: #cc1616;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #f5222d;
}

.success-message {
  margin-top: 16px;
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #52c41a;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cancel-btn {
  background: white;
  border: 1px solid #d9d9d9;
}

.export-btn {
  background: #cc1616;
  color: white;
  border: none;
}

.export-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>
