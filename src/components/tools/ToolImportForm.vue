<template>
  <div class="tool-import-form">
    <el-tabs type="border-card" class="import-tabs">
      <el-tab-pane label="JSON导入">
        <el-form
          ref="jsonFormRef"
          :model="jsonForm"
          :rules="jsonRules"
          label-position="left"
          label-width="100px"
        >
          <el-form-item label="工具定义" prop="definition">
            <el-input
              v-model="jsonForm.definition"
              type="textarea"
              :rows="10"
              placeholder="请粘贴JSON格式的工具定义"
            />
          </el-form-item>
        </el-form>

        <div class="form-actions">
          <el-space direction="horizontal" style="width: 100%; justify-content: flex-end">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" :loading="isLoading" @click="handleJsonImport">
              导入
            </el-button>
          </el-space>
        </div>
      </el-tab-pane>

      <el-tab-pane label="URL导入">
        <el-form
          ref="urlFormRef"
          :model="urlForm"
          :rules="urlRules"
          label-position="left"
          label-width="100px"
        >
          <el-form-item label="工具URL" prop="url">
            <el-input v-model="urlForm.url" placeholder="请输入工具定义的URL地址" />
          </el-form-item>
        </el-form>

        <div class="form-actions">
          <el-space direction="horizontal" style="width: 100%; justify-content: flex-end">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" :loading="isLoading" @click="handleUrlImport"> 
              导入 
            </el-button>
          </el-space>
        </div>
      </el-tab-pane>

      <el-tab-pane label="文件导入">
        <el-upload
          ref="uploadRef"
          v-model:file-list="fileList"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".json"
          :on-change="handleUploadChange"
        >
          <div class="upload-area">
            <el-icon :size="48">
              <Upload />
            </el-icon>
            <div style="margin-top: 8px">点击或拖拽文件到此区域上传</div>
            <div style="font-size: 12px; color: #999; margin-top: 4px">
              支持 .json 格式的工具定义文件
            </div>
          </div>
        </el-upload>

        <div class="form-actions">
          <el-space direction="horizontal" style="width: 100%; justify-content: flex-end">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" :loading="isLoading" @click="handleFileImport">
              导入
            </el-button>
          </el-space>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { 
  FormInstance, 
  FormRules, 
  UploadFiles, 
  UploadFile,
  UploadProps
} from 'element-plus'

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'import', definition: any): void
  (e: 'cancel'): void
}>()

const jsonFormRef = ref<FormInstance | null>(null)
const urlFormRef = ref<FormInstance | null>(null)
const uploadRef = ref()
const fileList = ref<UploadFile[]>([])

// JSON导入表单
const jsonForm = reactive({
  definition: '',
})

const jsonRules: FormRules = {
  definition: [
    { required: true, message: '请输入工具定义', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        try {
          if (!value) return callback()
          JSON.parse(value)
          callback()
        } catch (error) {
          callback(new Error('JSON格式不正确'))
        }
      },
      trigger: 'blur',
    },
  ],
}

// URL导入表单
const urlForm = reactive({
  url: '',
})

const urlRules: FormRules = {
  url: [
    { required: true, message: '请输入URL', trigger: 'blur' },
    {
      type: 'url',
      message: 'URL格式不正确',
      trigger: 'blur',
    },
  ],
}

// 处理JSON导入
const handleJsonImport = () => {
  jsonFormRef.value?.validate((valid) => {
    if (valid) {
      try {
        const definition = JSON.parse(jsonForm.definition)
        emit('import', definition)
      } catch (error: any) {
        ElMessage.error(`JSON解析失败: ${error.message}`)
      }
    }
  })
}

// 处理URL导入
const handleUrlImport = async () => {
  urlFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const response = await fetch(urlForm.url)
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`)
        }
        const definition = await response.json()
        emit('import', definition)
      } catch (error: any) {
        ElMessage.error(`URL导入失败: ${error.message}`)
      }
    }
  })
}

// 处理文件上传变化
const handleUploadChange: UploadProps['onChange'] = (file, files) => {
  fileList.value = files
}

// 处理文件导入
const handleFileImport = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  const file = fileList.value[0].raw
  if (!file) {
    ElMessage.error('文件对象无效')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const definition = JSON.parse(content)
      emit('import', definition)
    } catch (error: any) {
      ElMessage.error(`文件解析失败: ${error.message}`)
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsText(file)
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.tool-import-form {
  padding: 16px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.form-actions {
  margin-top: 24px;
}

.import-tabs {
  height: 400px;
}
</style>
