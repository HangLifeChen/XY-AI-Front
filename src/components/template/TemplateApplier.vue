<template>
  <div class="template-applier">
    <el-form ref="formRef" :model="formData" label-position="left" label-width="100px">
      <div class="template-info">
        <h3>{{ template.name }}</h3>
        <p>{{ template.description }}</p>
      </div>

      <el-form-item label="应用方式" prop="applyType">
        <el-radio-group v-model="formData.applyType">
          <el-radio value="new">创建新实例</el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="form-actions">
        <el-space>
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :disabled="!isFormValid"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            应用模板
          </el-button>
        </el-space>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTemplateStore } from '@/stores/templateStore'
import type { AnyTemplate } from '@/types/template'
import type { FormInstance, FormRules } from 'element-plus'

export interface Props {
  template: AnyTemplate
  onApplied?: (result: any) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'complete'): void
}>()

const templateStore = useTemplateStore()
const formRef = ref<FormInstance | null>(null)
const isSubmitting = ref(false)
const targetOptions = ref<{ label: string; value: string }[]>([])

const formData = reactive({
  applyType: 'new' as 'new' | 'existing',
  targetId: '' as string,
})

const rules = reactive<FormRules>({
  applyType: [{ required: true, message: '请选择应用方式', trigger: 'change' }],
  targetId: [
    {
      required: true,
      message: '请选择目标实例',
      validator: (_, value, callback) => {
        if (formData.applyType === 'existing' && !value) {
          callback(new Error('请选择目标实例'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
})

const isFormValid = computed(() => {
  return formData.applyType === 'new' || (formData.applyType === 'existing' && !!formData.targetId)
})

onMounted(async () => {
  await loadTargetOptions()
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
    let result
    // 创建新实例
    const instanceData = {
      name: `${props.template.name} 实例`,
      description: `基于模板 "${props.template.name}" 创建的实例`,
    }
    result = await templateStore.applyTemplate(props.template, instanceData)

    if (result) {
      ElMessage.success('模板应用成功')
      emit('complete')
      props.onApplied?.(result)
    } else if (formData.applyType === 'new') {
      ElMessage.error('模板应用失败')
    }
  } catch (err: any) {
    ElMessage.error(`应用失败: ${err instanceof Error ? err.message : '未知错误'}`)
  } finally {
    isSubmitting.value = false
  }
}

async function loadTargetOptions() {
  // 这里需要根据实际项目情况实现
  targetOptions.value = [
    { label: '示例实例 1', value: 'instance-1' },
    { label: '示例实例 2', value: 'instance-2' },
  ]
  // 实际实现可能需要调用不同的API
  // if (props.template.type === 'workflow') {
  //   targetOptions.value = workflows.map(w => ({ label: w.name, value: w.id }))
  // } else if (props.template.type === 'agent') {
  //   const agents = await agentService.getAgents()
  //   targetOptions.value = agents.map(a => ({ label: a.name, value: a.id }))
  // }
}
</script>

<style scoped>
.template-applier {
  width: 100%;
  padding: 16px;
}

.template-info {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.template-info h3 {
  margin-bottom: 8px;
}

.template-info p {
  margin: 0;
  color: #666;
}

.form-actions {
  margin-top: 24px;
  text-align: right;
}
</style>
