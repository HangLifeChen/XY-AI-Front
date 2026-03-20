<template>
  <div class="document-upload-form">
    <el-alert
      title="上传须知"
      type="info"
      description="支持 PDF、Word、TXT、Markdown 等文档格式，单个文件大小不超过 50MB"
      show-icon
      closable
      class="upload-info"
    />

    <el-upload
      multiple
      :auto-upload="false"
      :on-change="handleChange"
      :before-upload="beforeUpload"
      :file-list="fileList"
      drag
    >
      <el-icon class="el-icon--upload"><Upload /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">支持 PDF、DOC、DOCX、TXT、MD 等格式，单个文件不超过 50MB</div>
      </template>
    </el-upload>

    <div class="upload-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        @click="submitUpload"
        :loading="uploading"
        :disabled="fileList.length === 0"
      >
        开始上传
      </el-button>
    </div>

    <div v-if="uploading" class="upload-status">
      <el-progress :percentage="uploadProgress" :stroke-width="15" striped striped-flow />
      <div class="progress-text">正在上传: {{ uploadingFileName }}</div>
    </div>

    <el-alert
      v-if="uploadError"
      type="error"
      :title="uploadError.title"
      :description="uploadError.description"
      show-icon
      closable
      @close="uploadError = null"
      class="upload-alert"
    />

    <el-alert
      v-if="uploadSuccess"
      type="success"
      title="上传成功"
      :description="`成功上传 ${uploadedCount} 个文件`"
      show-icon
      closable
      @close="uploadSuccess = false"
      class="upload-alert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { UploadFile, UploadProps } from 'element-plus'
import { KnowledgeBaseService } from '@/api/knowledgeBaseService'

const props = defineProps<{
  knowledgeBaseId: string
}>()

const emit = defineEmits<{
  (e: 'uploaded', success: boolean): void
  (e: 'cancel'): void
}>()

const fileList = ref<UploadFile[]>([])
const uploading = ref(false)
const uploadError = ref<{ title: string; description: string } | null>(null)
const uploadSuccess = ref(false)
const uploadProgress = ref(0)
const uploadingFileName = ref('')
const uploadedCount = ref(0)

const handleChange: UploadProps['onChange'] = (file, files) => {
  fileList.value = files
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const allowedTypes = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'text/plain': 'TXT',
    'text/markdown': 'Markdown',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  }

  const maxSize = 50 * 1024 * 1024 // 50MB

  if (!Object.keys(allowedTypes).includes(file.type)) {
    ElMessage.error('不支持的文件格式，请上传 PDF、Word、TXT 或 Markdown 文件')
    return false
  }

  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 50MB')
    return false
  }

  return true
}

const submitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }

  uploadedCount.value = 0
  uploadProgress.value = 0
  uploadSuccess.value = false
  uploadError.value = null
  uploading.value = true

  try {
    // 逐个上传文件
    for (const [i, fileItem] of fileList.value.entries()) {
      const file = fileItem.raw
      if (!file) continue

      uploadingFileName.value = file.name
      uploadProgress.value = Math.round(((i + 1) / fileList.value.length) * 100)

      try {
        await KnowledgeBaseService.uploadDocument(props.knowledgeBaseId, file)
        uploadedCount.value++
      } catch (error: any) {
        throw new Error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
      }
    }

    // 所有文件上传完成
    uploading.value = false
    uploadSuccess.value = true
    uploadProgress.value = 100
    ElMessage.success(`成功上传 ${uploadedCount.value} 个文件`)
    emit('uploaded', true)

    // 重置状态
    setTimeout(() => {
      fileList.value = []
      uploadedCount.value = 0
      uploadProgress.value = 0
    }, 2000)
  } catch (error: any) {
    uploading.value = false
    uploadError.value = {
      title: '上传失败',
      description: error.message || '文件上传失败',
    }
    ElMessage.error(error.message || '文件上传失败')
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.document-upload-form {
  padding: 16px;
}

.upload-info {
  margin-bottom: 20px;
}

.upload-actions {
  margin: 20px 0;
  text-align: right;
}

.upload-status {
  margin: 20px 0;
}

.progress-text {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.upload-alert {
  margin-top: 16px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload-list__item) {
  transition: none;
}
</style>
