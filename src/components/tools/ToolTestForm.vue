<template>
  <div class="tool-test-form">
    <template v-if="!tool">
      <el-alert type="warning" title="未找到工具信息，无法进行测试" show-icon />
    </template>

    <template v-else>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="名称">
          {{ tool.name }}
        </el-descriptions-item>
        <el-descriptions-item label="描述">
          {{ tool.description }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="margin-top: 20px"
      >
        <template v-for="param in parametersList" :key="param.name">
          <el-form-item :label="param.name" :prop="param.name">
            <!-- 有枚举值的字符串类型 -->
            <el-select
              v-if="param.type === 'string' && param.enum"
              v-model="formData[param.name]"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option v-for="item in param.enum" :key="item" :label="item" :value="item" />
            </el-select>

            <!-- 字符串类型 -->
            <el-input
              v-else-if="param.type === 'string'"
              v-model="formData[param.name]"
              :placeholder="`请输入${param.name}`"
            />

            <!-- 数字类型 -->
            <el-input-number
              v-else-if="param.type === 'number'"
              v-model="formData[param.name]"
              style="width: 100%"
            />

            <!-- 布尔类型 -->
            <el-switch v-else-if="param.type === 'boolean'" v-model="formData[param.name]" />

            <!-- 数组类型 -->
            <el-input
              v-else-if="param.type === 'array'"
              v-model="formData[param.name]"
              type="textarea"
              :placeholder="`请输入${param.name}，以逗号分隔`"
            />

            <!-- 对象类型 -->
            <el-input
              v-else-if="param.type === 'object'"
              v-model="formData[param.name]"
              type="textarea"
              :placeholder="`请输入${param.name}，JSON格式`"
            />

            <!-- 其他类型默认使用文本输入框 -->
            <el-input v-else v-model="formData[param.name]" :placeholder="`请输入${param.name}`" />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="isTesting">执行测试</el-button>
          <el-button @click="handleReset" style="margin-left: 10px">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 测试结果展示 -->
      <div v-if="testResult" class="test-result">
        <el-divider content-position="left">测试结果</el-divider>
        <el-alert
          :type="testResult.success ? 'success' : 'error'"
          :title="testResult.success ? '执行成功' : '执行失败'"
          show-icon
        />
        <pre v-if="testResult.success" class="result-data">{{
          formatResultData(testResult.data)
        }}</pre>
        <pre v-if="!testResult.success" class="result-error">{{ testResult.message }}</pre>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Tool } from '@/types/tool'
import { ToolService } from '@/api/toolService'

const props = defineProps<{
  tool?: Tool
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const formRef = ref<FormInstance | null>(null)
const formData = reactive<Record<string, any>>({})
const rules = reactive<FormRules>({})
const testResult = ref<{
  success: boolean
  data?: any
  message?: string
  executionTime: number
} | null>(null)
const isTesting = ref(false)

// 根据类型获取默认值
const getDefaultValueForType = (param: any): any => {
  if (param.type === 'string') {
    return ''
  } else if (param.type === 'number') {
    return 0
  } else if (param.type === 'boolean') {
    return false
  } else if (param.type === 'array') {
    return []
  } else if (param.type === 'object') {
    return {}
  } else {
    return ''
  }
}

// 计算参数列表
const parametersList = computed(() => {
  if (!props.tool?.parametersSchema) return []

  return Object.entries(props.tool.parametersSchema).map(([key, paramSchema]) => {
    return {
      name: key,
      type: paramSchema.Type || 'string',
      required: paramSchema.Required || false,
      description: paramSchema.Desc || '',
      enum: paramSchema.Enum || null,
    }
  })
})

// 当工具变化时，初始化表单数据
watch(
  () => props.tool,
  (newTool) => {
    if (newTool) {
      // 清空表单数据
      Object.keys(formData).forEach((key) => {
        delete formData[key]
      })

      // 初始化表单数据和规则
      parametersList.value.forEach((param) => {
        // 设置默认值
        formData[param.name] = getDefaultValueForType(param)

        // 设置验证规则
        if (param.required) {
          rules[param.name] = [{ required: true, message: `请输入${param.name}`, trigger: 'blur' }]
        }
      })

      // 清空测试结果
      testResult.value = null
    }
  },
  { immediate: true },
)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      await executeTest()
    }
  })
}

// 执行测试
const executeTest = async () => {
  if (!props.tool) return

  isTesting.value = true
  testResult.value = null

  try {
    const result = await ToolService.testTool(props.tool.id, { ...formData })
    testResult.value = result
    if (result.success) {
      ElMessage.success('测试执行成功')
    } else {
      ElMessage.error('测试执行失败')
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      error: error.message || '测试执行失败',
      executionTime: 0,
    }
    ElMessage.error('测试执行失败')
  } finally {
    isTesting.value = false
  }
}

// 格式化结果数据
const formatResultData = (data: any) => {
  if (typeof data === 'string') {
    try {
      // 尝试解析为 JSON
      const parsed = JSON.parse(data)
      return JSON.stringify(parsed, null, 2)
    } catch {
      // 如果解析失败，直接返回原字符串
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  testResult.value = null
}
</script>

<style scoped>
.tool-test-form {
  padding: 16px;
}

.test-result {
  margin-top: 20px;
}

.result-data,
.result-error {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 10px;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  max-height: 300px;
  overflow-y: auto;
}

.result-error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.execution-time {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}
</style>
