<template>
  <div class="import-modal">
    <div class="modal-overlay" @click.self="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>导入工作流</h3>
        <button @click="$emit('close')" class="close-btn">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div class="modal-body">
        <div
          class="upload-area"
          @dragover.prevent="dragover = true"
          @dragleave="dragover = false"
          @drop.prevent="handleDrop"
          :class="{ dragover: dragover }"
        >
          <div class="upload-icon">
            <i class="icon-upload"></i>
          </div>
          <p>拖放文件到此处或</p>
          <input
            type="file"
            ref="fileInput"
            accept=".json,.workflow"
            @change="handleFileSelect"
            class="file-input"
          />
          <button class="btn select-btn" @click="triggerFileInput">选择文件</button>
          <p class="hint">支持JSON格式的工作流文件</p>
        </div>

        <div v-if="isLoading" class="progress-container">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          <span class="progress-text">{{ progress }}%</span>
        </div>

        <div v-if="error" class="error-message"><i class="icon-error"></i> {{ error }}</div>

        <div v-if="importedWorkflow" class="import-preview">
          <h4>导入预览</h4>
          <div class="preview-content">
            <p><strong>名称:</strong> {{ importedWorkflow.name }}</p>
            <p><strong>描述:</strong> {{ importedWorkflow.description || '无' }}</p>
            <p><strong>节点数:</strong> {{ importedWorkflow.nodes.length }}</p>
            <p><strong>连接数:</strong> {{ importedWorkflow.edges.length }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn cancel-btn">取消</button>
        <button
          @click="confirmImport"
          class="btn confirm-btn"
          :disabled="!importedWorkflow || isLoading"
        >
          确认导入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Close } from '@element-plus/icons-vue'

const emit = defineEmits(['close', 'imported'])

const workflowStore = useWorkflowStore()
const fileInput = ref(null)
const dragover = ref(false)
const isLoading = ref(false)
const progress = ref(0)
const error = ref(null)
const importedWorkflow = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  dragover.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file) => {
  error.value = null
  importedWorkflow.value = null
  isLoading.value = true
  progress.value = 0

  const reader = new FileReader()
  reader.onprogress = (e) => {
    if (e.lengthComputable) {
      progress.value = Math.round((e.loaded / e.total) * 100)
    }
  }
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target.result)
      validateWorkflow(content)
      importedWorkflow.value = content
    } catch (err) {
      error.value = '文件解析失败: ' + err.message
    } finally {
      isLoading.value = false
    }
  }
  reader.onerror = () => {
    error.value = '文件读取失败'
    isLoading.value = false
  }
  reader.readAsText(file)
}

const validateWorkflow = (workflow) => {
  if (!workflow.name) {
    throw new Error('工作流名称缺失')
  }
  if (!Array.isArray(workflow.nodes)) {
    throw new Error('无效的节点数据')
  }
  if (!Array.isArray(workflow.edges)) {
    throw new Error('无效的连接数据')
  }
}

const confirmImport = async () => {
  try {
    isLoading.value = true
    await workflowStore.importWorkflow(importedWorkflow.value)
    emit('imported', importedWorkflow.value)
    emit('close')
  } catch (err) {
    error.value = '导入失败: ' + err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.import-modal {
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
  width: 600px;
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

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area.dragover {
  border-color: #cc1616;
  background-color: #f0f7ff;
}

.upload-icon {
  font-size: 48px;
  color: #cc1616;
  margin-bottom: 16px;
}

.file-input {
  display: none;
}

.select-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #cc1616;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.hint {
  margin-top: 8px;
  color: #999;
  font-size: 14px;
}

.progress-container {
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
  color: white;
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

.import-preview {
  margin-top: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.preview-content {
  margin-top: 12px;
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
}

.cancel-btn {
  background: white;
  border: 1px solid #d9d9d9;
}

.confirm-btn {
  background: #cc1616;
  color: white;
  border: none;
}

.confirm-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>
