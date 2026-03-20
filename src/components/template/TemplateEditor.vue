<template>
  <div class="template-editor">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="left"
      label-width="100px"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入模板名称"
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          placeholder="请输入模板描述"
          type="textarea"
          :rows="3"
        />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请输入标签，按回车确认"
          style="width: 100%"
        >
          <el-option
            v-for="tag in formData.tags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="缩略图" prop="thumbnail">
        <div v-if="formData.thumbnail" class="thumbnail-preview">
          <img :src="formData.thumbnail" alt="缩略图预览" />
          <el-button
            type="danger"
            circle
            class="thumbnail-remove"
            @click="removeThumbnail"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <el-upload
          v-else
          list-type="picture-card"
          :auto-upload="false"
          :on-change="handleUpload"
          :file-list="fileList"
        >
          <el-icon><Plus /></el-icon>
          <div class="el-upload__text">
            点击上传缩略图
          </div>
        </el-upload>
      </el-form-item>

      <div class="form-actions">
        <el-space>
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            保存修改
          </el-button>
        </el-space>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import type { AnyTemplate } from '@/types/template'
import { useTemplateStore } from '@/stores/templateStore'

const props = defineProps<{
  template: AnyTemplate
}>()

const emit = defineEmits<{
  (e: 'updated', id: string): void
  (e: 'cancel'): void
}>()

const templateStore = useTemplateStore()
const formRef = ref<FormInstance | null>(null)
const isSubmitting = ref(false)
const fileList = ref<UploadFile[]>([])

const formData = reactive({
  name: '',
  description: '',
  tags: [] as string[],
  thumbnail: undefined as string | undefined,
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入模板描述', trigger: 'blur' },
  ],
  tags: [
    { type: 'array', message: '请至少添加一个标签', trigger: 'change' },
  ],
}

const isValid = computed(() => {
  return formData.name && formData.description
})

onMounted(() => {
  formData.name = props.template.name
  formData.description = props.template.description
  formData.tags = [...props.template.tags]
  formData.thumbnail = props.template.thumbnail
})

function handleCancel() {
  emit('cancel')
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitForm()
    }
  })
}

async function submitForm() {
  isSubmitting.value = true
  try {
    const result = await templateStore.updateTemplate(props.template.id, {
      name: formData.name,
      description: formData.description,
      tags: formData.tags,
      thumbnail: formData.thumbnail,
    })
    if (result) {
      ElMessage.success('模板更新成功')
      emit('updated', result.id)
    } else {
      ElMessage.error('模板更新失败')
    }
  } catch (err) {
    ElMessage.error('模板更新失败')
  } finally {
    isSubmitting.value = false
  }
}

function handleUpload(file: UploadFile) {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.thumbnail = e.target?.result as string
    fileList.value = [file]
  }
  reader.readAsDataURL(file.raw as File)
}

function removeThumbnail() {
  formData.thumbnail = undefined
  fileList.value = []
}
</script>

<style scoped>
.template-editor {
  width: 100%;
  padding: 16px;
}

.thumbnail-preview {
  position: relative;
  max-width: 200px;
  overflow: hidden;
}

.thumbnail-preview img {
  width: 100%;
  display: block;
}

.thumbnail-remove {
  position: absolute;
  top: 8px;
  right: 8px;
}

.form-actions {
  text-align: right;
  margin-top: 20px;
}
</style>