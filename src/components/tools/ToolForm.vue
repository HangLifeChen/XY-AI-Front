<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" style="padding: 20px">
    <el-form-item label="工具名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入工具名称" />
    </el-form-item>

    <el-form-item label="工具描述" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        placeholder="请输入工具描述，该描述将用于指导AI何时使用此工具"
        :rows="3"
      />
    </el-form-item>
    <div class="form-actions">
      <el-space>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </el-space>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Tool } from '@/types/tool'

const props = defineProps<{
  tool?: Tool
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submit', form: any): void
}>()

const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  id: '',
  name: '',
  description: '',
  toolType: 'system',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入工具名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入工具描述', trigger: 'blur' }],
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', formData)
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}

onMounted(() => {
  if (props.tool) {
    formData.id = props.tool.id!
    formData.name = props.tool.name!
    formData.description = props.tool.description!
    formData.toolType = props.tool.toolType!
  } else {
    // 重置表单数据
    formData.id = ''
    formData.name = ''
    formData.description = ''
    formData.toolType = 'system'
  }
})

// 监听工具属性变化，确保表单正确更新
watch(
  () => props.tool,
  (newTool) => {
    if (newTool) {
      formData.id = newTool.id!
      formData.name = newTool.name!
      formData.description = newTool.description!
      formData.toolType = newTool.toolType!
    } else {
      // 重置表单数据
      formData.id = ''
      formData.name = ''
      formData.description = ''
      formData.toolType = 'system'
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.form-actions {
  padding: 16px;
  text-align: right;
}
</style>
