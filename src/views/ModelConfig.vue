<template>
  <div class="model-config">
    <el-page-header @back="$router.push('/')" content="大模型配置" />

    <el-tabs v-model="activeTab" type="card" class="config-tabs">
      <el-tab-pane label="API配置" name="api">
        <el-form :model="apiConfig" label-width="120px" label-position="left">
          <el-form-item label="OpenAI API Key" required>
            <el-input
              v-model="apiConfig.openaiKey"
              type="password"
              show-password
              placeholder="输入OpenAI API Key"
            />
          </el-form-item>
          <el-form-item label="API Base URL">
            <el-input v-model="apiConfig.apiBase" placeholder="https://api.openai.com/v1" />
          </el-form-item>
          <el-form-item label="默认模型">
            <el-select v-model="apiConfig.defaultModel" placeholder="选择默认模型">
              <el-option
                v-for="model in modelOptions"
                :key="model.value"
                :label="model.label"
                :value="model.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveApiConfig">保存配置</el-button>
            <el-button @click="testApiConnection">测试连接</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="模型参数" name="params">
        <el-form :model="modelParams" label-width="120px" label-position="left">
          <el-form-item label="Temperature">
            <el-slider v-model="modelParams.temperature" :min="0" :max="2" :step="0.1" show-input />
          </el-form-item>
          <el-form-item label="Max Tokens">
            <el-input-number v-model="modelParams.maxTokens" :min="100" :max="4000" :step="100" />
          </el-form-item>
          <el-form-item label="Top P">
            <el-slider v-model="modelParams.topP" :min="0" :max="1" :step="0.05" show-input />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveModelParams">保存参数</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface ApiConfig {
  openaiKey: string
  apiBase: string
  defaultModel: string
}

interface ModelParams {
  temperature: number
  maxTokens: number
  topP: number
}

const activeTab = ref('api')

const apiConfig = ref<ApiConfig>({
  openaiKey: '',
  apiBase: 'https://api.openai.com/v1',
  defaultModel: 'gpt-3.5-turbo',
})

const modelParams = ref<ModelParams>({
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
})

const modelOptions = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
]

const saveApiConfig = () => {
  // 实际项目中这里应该调用API保存配置
  ElMessage.success('API配置已保存')
}

const testApiConnection = () => {
  // 这里应该实现API连接测试逻辑
  ElMessage.info('开始测试API连接...')
  setTimeout(() => {
    ElMessage.success('API连接测试成功')
  }, 1500)
}

const saveModelParams = () => {
  // 实际项目中这里应该调用API保存参数
  ElMessage.success('模型参数已保存')
}
</script>

<style scoped>
.model-config {
  padding: 20px;
}
.config-tabs {
  margin-top: 20px;
}
</style>
