<template>
  <div class="ollama-properties">
    <el-form label-position="top">
      <!-- Base URL -->
      <el-form-item label="Base URL">
        <el-input
          v-model="localData.baseURL.fieldValue"
          placeholder="请输入Ollama服务地址，例如: http://localhost:11434"
          @input="updateNodeData"
        />
        <div class="field-description">Ollama服务的Base URL地址</div>
      </el-form-item>

      <!-- 模型输入 -->
      <el-form-item label="模型">
        <el-input
          v-model="localData.model.fieldValue"
          placeholder="请输入模型名称，例如: llama2"
          @input="updateNodeData"
        />
        <div class="field-description">输入Ollama模型名称</div>
      </el-form-item>

      <!-- 提示词 -->
      <el-form-item label="提示词" required>
        <el-input
          v-model="localData.prompt.fieldValue"
          type="textarea"
          :rows="4"
          placeholder="请输入提示词"
          @input="updateNodeData"
        />
        <div class="field-description">输入提示词以指导AI生成内容</div>
      </el-form-item>

      <!-- 系统提示词 -->
      <el-form-item label="系统提示词">
        <el-input
          v-model="localData.systemPrompt.fieldValue"
          type="textarea"
          :rows="3"
          placeholder="请输入系统提示词（可选）"
          @input="updateNodeData"
        />
        <div class="field-description">系统提示词用于设置AI的行为和角色</div>
      </el-form-item>

      <!-- 温度 -->
      <el-form-item label="温度">
        <el-slider
          v-model="localData.temperature.fieldValue"
          :min="0"
          :max="1"
          :step="0.01"
          show-input
          @change="updateNodeData"
        />
        <div class="field-description">控制生成文本的随机性，值越高结果越随机</div>
      </el-form-item>

      <!-- 最大token数 -->
      <el-form-item label="最大token数">
        <el-input-number
          v-model="localData.maxTokens.fieldValue"
          :min="1"
          :max="32768"
          :step="100"
          style="width: 100%"
          @change="updateNodeData"
        />
        <div class="field-description">限制生成文本的最大长度</div>
      </el-form-item>

      <!-- 核采样 -->
      <el-form-item label="核采样 (Top-P)">
        <el-slider
          v-model="localData.topP.fieldValue"
          :min="0"
          :max="1"
          :step="0.01"
          show-input
          @change="updateNodeData"
        />
        <div class="field-description">控制生成文本的多样性，值越高结果越多样</div>
      </el-form-item>

      <!-- 响应格式 -->
      <el-form-item label="响应格式">
        <el-select
          v-model="localData.responseFormat.fieldValue"
          placeholder="请选择响应格式"
          style="width: 100%"
          @change="updateNodeData"
        >
          <el-option
            v-for="format in responseFormatOptions"
            :key="format"
            :label="format"
            :value="format"
          />
        </el-select>
        <div class="field-description">选择AI响应的输出格式</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { FieldType, type NodeProps, type OllamaNodeData } from '@/types/node'

const props = defineProps<{
  node: NodeProps<OllamaNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<OllamaNodeData>): void
}>()

// 选项列表
const responseFormatOptions = ref(['text', 'json'])

// 创建本地响应式数据
const localData = reactive<OllamaNodeData>({
  baseURL: {
    fieldName: 'Base URL',
    fieldValue: 'http://localhost:11434',
    fieldDesc: '',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  model: {
    fieldName: '模型',
    fieldValue: 'llama2',
    fieldDesc: '',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  prompt: {
    fieldName: '提示词',
    fieldValue: '',
    fieldDesc: '',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  systemPrompt: {
    fieldName: '系统提示词',
    fieldValue: '',
    fieldDesc: '',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  temperature: {
    fieldName: '温度',
    fieldValue: 0.8,
    fieldDesc: '',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  maxTokens: {
    fieldName: '最大token数',
    fieldValue: 2048,
    fieldDesc: '',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  topP: {
    fieldName: '核采样',
    fieldValue: 0.9,
    fieldDesc: '',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  responseFormat: {
    fieldName: '响应格式',
    fieldValue: 'text',
    fieldDesc: '',
    fieldType: FieldType.SELECT,
    list: false,
    options: responseFormatOptions.value,
    show: true,
    required: true,
  },
})

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    Object.assign(localData, props.node.data)
  }
})

// 更新节点数据
const updateNodeData = () => {
  if (props.node.id) {
    props.node.data = { ...localData }
    const updatedNode = { ...props.node }
    emit('update:node', updatedNode)
  }
}

// 监听节点数据变化
watch(
  () => props.node.data,
  (newData) => {
    if (newData) {
      Object.assign(localData, newData)
    }
  },
  { deep: true },
)
</script>

<style scoped>
.ollama-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

:deep(.el-select .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  font-family: var(--el-font-family);
}

:deep(.el-slider) {
  margin-top: 10px;
}

:deep(.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  background-color: var(--el-fill-color-light);
}
</style>