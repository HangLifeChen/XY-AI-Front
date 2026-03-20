<template>
  <div class="model-config">
    <el-form label-position="top">
      <el-form-item label="模型类型">
        <el-select v-model="config.modelType" placeholder="请选择模型">
          <el-option
            v-for="model in availableModels"
            :key="model.value"
            :label="model.label"
            :value="model.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="温度 (Temperature)">
        <el-slider v-model="config.temperature" :min="0" :max="1" :step="0.1" show-input />
        <div class="param-description">
          控制输出的随机性。较低的值使输出更确定，较高的值使输出更随机。
        </div>
      </el-form-item>

      <el-form-item label="最大Token数">
        <el-input-number v-model="config.maxTokens" :min="100" :max="10000000" :step="100" />
        <div class="param-description">控制生成响应的最大长度。较大的值会产生更长的响应。</div>
      </el-form-item>

      <el-form-item label="Top P">
        <el-slider v-model="config.topP" :min="0" :max="1" :step="0.1" show-input />
        <div class="param-description">控制输出的多样性。较低的值限制模型只考虑最可能的选项。</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave">保存配置</el-button>
        <el-button @click="handleReset">重置默认值</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

interface ModelConfig {
  modelType: string
  temperature: number
  maxTokens: number
  topP: number
}

const props = defineProps({
  modelValue: {
    type: Object as () => ModelConfig,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const config = reactive<ModelConfig>({ ...props.modelValue })

const availableModels = ref([
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-2', label: 'Claude 2' },
  { value: 'llama-2', label: 'Llama 2' },
])

const handleSave = () => {
  emit('update:modelValue', { ...config })
  emit('save', { ...config })
}

const handleReset = () => {
  Object.assign(config, {
    modelType: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
  })
}
</script>

<style scoped>
.model-config {
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.param-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
