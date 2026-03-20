<template>
  <div class="template-importer">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="left"
      label-width="100px"
    >
      <el-form-item label="导入方式" prop="importType">
        <el-radio-group v-model="formData.importType">
          <el-radio value="file">文件导入</el-radio>
          <el-radio value="json">JSON内容</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="formData.importType === 'file'">
        <el-form-item label="模板文件" prop="file">
          <el-upload
            accept=".json"
            :auto-upload="false"
            :on-change="handleFileUpload"
            :file-list="fileList"
            drag
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="JSON内容" prop="jsonContent">
          <el-input
            v-model="formData.jsonContent"
            type="textarea"
            placeholder="请粘贴模板JSON内容"
            :rows="5"
          />
        </el-form-item>
      </template>

      <div v-if="templatePreview" class="template-preview">
        <el-descriptions border>
          <el-descriptions-item label="名称">
            {{ templatePreview.name }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ getTemplateTypeLabel(templatePreview.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="标签">
            <el-space size="small">
              <el-tag
                v-for="tag in templatePreview.tags"
                :key="tag"
                size="small"
              >
                {{ tag }}
              </el-tag>
            </el-space>
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ templatePreview.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="form-actions">
        <el-space>
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :disabled="!isFormValid"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            导入模板
          </el-button>
        </el-space>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import type { AnyTemplate } from '@/types/template'
import { useTemplateStore } from '@/stores/templateStore'

const props = defineProps<{
  onSuccess?: (template: AnyTemplate) => void
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const templateStore = useTemplateStore()
const formRef = ref<FormInstance | null>(null)
const isSubmitting = ref(false)
const templatePreview = ref<AnyTemplate | null>(null)
const fileList = ref<UploadFile[]>([])

const formData = reactive({
  importType: 'file' as 'file' | 'json',
  file: null as File | null,
  jsonContent: '',
  templateData: null as any,
})

const rules: FormRules = {
  file: [
    { required: true, message: '请选择模板文件', trigger: 'change' },
  ],
  jsonContent: [
    { required: true, message: '请输入模板JSON内容', trigger: 'blur' },
  ],
}

const isFormValid = computed(() => {
  return (
    (formData.importType === 'file' && formData.file) ||
    (formData.importType === 'json' && formData.jsonContent)
  )
})

watch(
  () => formData.jsonContent,
  (newValue) => {
    if (formData.importType === 'json' && newValue) {
      try {
        const data = JSON.parse(newValue)
        formData.templateData = data
        validateTemplateData(data)
      } catch (err) {
        templatePreview.value = null
      }
    }
  }
)

function handleCancel() {
  emit('cancel')
}

async function handleSubmit() {
  if (!isFormValid.value) {
    ElMessage.error('无效的模板数据')
    return
  }

  isSubmitting.value = true
  try {
    const result = await templateStore.importTemplate(
      formData.importType === 'file'
        ? { file: formData.file!, type: 'file' }
        : { content: formData.jsonContent, type: 'json' }
    )

    if (result) {
      ElMessage.success('模板导入成功')
      props.onSuccess?.(result)
    } else {
      ElMessage.error('模板导入失败')
    }
  } catch (err: any) {
    ElMessage.error(`导入失败: ${err instanceof Error ? err.message : '未知错误'}`)
  } finally {
    isSubmitting.value = false
  }
}

function handleFileUpload(file: UploadFile) {
  if (!file.raw) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)
      formData.templateData = data
      validateTemplateData(data)
      formData.file = file.raw as File
      fileList.value = [file]
    } catch (err) {
      ElMessage.error('无效的模板文件')
    }
  }
  reader.readAsText(file.raw as File)
}

function validateTemplateData(data: any) {
  if (!data || typeof data !== 'object') {
    ElMessage.error('无效的模板数据')
    templatePreview.value = null
    return
  }

  const requiredFields = ['name', 'description', 'type', 'tags', 'definition']
  const missingFields = requiredFields.filter((field) => !(field in data))

  if (missingFields.length > 0) {
    ElMessage.error(`缺少必要字段: ${missingFields.join(', ')}`)
    templatePreview.value = null
    return
  }

  templatePreview.value = data as AnyTemplate
}

function getTemplateTypeLabel(type: string) {
  switch (type) {
    case 'workflow':
      return '工作流'
    case 'agent':
      return '智能体'
    case 'prompt':
      return '提示词'
    default:
      return '未知'
  }
}
</script>

<style scoped>
.template-importer {
  padding: 16px;
}

.form-actions {
  margin-top: 24px;
  text-align: right;
}

.template-preview {
  margin-top: 16px;
}
</style>