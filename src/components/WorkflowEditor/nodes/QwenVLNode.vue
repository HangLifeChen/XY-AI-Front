<template>
  <div :class="['qwen-vl-node', { selected: selected }]">
    <div class="node-header">
      <Handle type="source" :position="Position.Left" id="only_qwenVL_trigger" title="触发输入" />
      <el-icon><Picture /></el-icon>
      <span>通义千问VL</span>
      <el-tooltip v-if="!isConfigured" content="请配置模型厂商和图片" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="providers" title="模型厂商输入" />
        <Handle type="source" :position="Position.Right" id="providers" title="模型厂商输出" />
        <span class="property-label">模型厂商</span>
        <span
          class="property-value"
          :class="{
            'not-configured':
              !nodeData?.providers?.fieldValue || nodeData?.providers?.fieldValue?.length === 0,
          }"
        >
          {{ getProvidersPreview }}
        </span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="image" title="图片输入" />
        <Handle type="source" :position="Position.Right" id="image" title="图片输出" />
        <span class="property-label">图片</span>
        <span class="property-value" :class="{ 'not-configured': !getImagePreview }">
          {{ getImagePreview }}
        </span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="imageUrl" title="图片链接输入" />
        <Handle type="source" :position="Position.Right" id="imageUrl" title="图片链接输出" />
        <span class="property-label">图片链接</span>
        <span class="property-value" :class="{ 'not-configured': !nodeData?.imageUrl?.fieldValue }">
          {{ getImageUrlPreview }}
        </span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="promptType" title="提示词类型输入" />
        <Handle type="source" :position="Position.Right" id="promptType" title="提示词类型输出" />
        <span class="property-label">提示词类型</span>
        <span class="property-value">{{ nodeData?.promptType?.fieldValue || 'image' }}</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="model" title="模型输入" />
        <Handle type="source" :position="Position.Right" id="model" title="模型输出" />
        <span class="property-label">模型</span>
        <span class="property-value">{{ nodeData?.model?.fieldValue || '默认模型' }}</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="temperature" title="温度输入" />
        <Handle type="source" :position="Position.Right" id="temperature" title="温度输出" />
        <span class="property-label">温度</span>
        <span class="property-value">{{ nodeData?.temperature?.fieldValue || 0.7 }}</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="maxTokens" title="最大token数输入" />
        <Handle type="source" :position="Position.Right" id="maxTokens" title="最大token数输出" />
        <span class="property-label">最大token数</span>
        <span class="property-value">{{ nodeData?.maxTokens?.fieldValue || 10000 }}</span>
      </div>

      <div class="output-item">
        <span class="output-label">HTML输出</span>
        <Handle type="source" :position="Position.Right" id="output" title="HTML输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Picture, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed, onMounted, ref } from 'vue'
import { FieldType, type NodeProps, type QwenVLNodeData } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import { ModelService } from '@/api/modelService'
import type { ProviderConfig } from '@/types/model'

const props = defineProps<NodeProps<QwenVLNodeData>>()

// 默认节点数据
const DEFAULT_NODE: QwenVLNodeData = {
  model: {
    fieldName: '模型',
    fieldValue: 'qwen-vl-plus',
    fieldDesc: '选择Qwen-VL模型版本',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  providers: {
    fieldName: '模型厂商',
    fieldValue: [],
    fieldDesc: '选择模型厂商',
    fieldType: FieldType.SELECT,
    list: true,
    options: [],
    show: true,
    required: true,
  },
  image: {
    fieldName: '图片',
    fieldValue: '',
    fieldDesc: '上传图片文件',
    fieldType: FieldType.UPLOAD,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  imageUrl: {
    fieldName: '图片链接',
    fieldValue: '',
    fieldDesc: '图片的URL链接',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  promptType: {
    fieldName: '提示词类型',
    fieldValue: 'image',
    fieldDesc: '提示词类型',
    fieldType: FieldType.SELECT,
    list: false,
    options: [
      { label: 'Image', value: 'image' },
      { label: 'Image URL', value: 'imageUrl' },
    ],
    show: true,
    required: false,
  },
  temperature: {
    fieldName: '温度',
    fieldValue: 0.7,
    fieldDesc: '控制生成文本的随机性',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  maxTokens: {
    fieldName: '最大token数',
    fieldValue: 10000,
    fieldDesc: '限制生成文本的最大长度',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  responseFormat: {
    fieldName: '响应格式',
    fieldValue: 'html',
    fieldDesc: '输出格式',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['html'],
    show: true,
    required: true,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<QwenVLNodeData>([], (data) => {
  // 验证至少有一个图片输入（图片文件或图片链接）
  const hasImage = !!data.image?.fieldValue || !!data.imageUrl?.fieldValue
  if (!data.providers?.fieldValue || data.providers.fieldValue.length === 0) {
    return { valid: false, message: '模型厂商不能为空' }
  }
  if (!hasImage) {
    return { valid: false, message: '请提供图片或图片链接' }
  }
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 获取厂商配置列表
const providerConfigs = ref<ProviderConfig[]>([])

const fetchProviderConfigs = async () => {
  try {
    const response = await ModelService.listProviderConfigs()
    providerConfigs.value = response.providerConfigs
    // 更新选项
    if (nodeData.value?.providers) {
      nodeData.value.providers.options = response.providerConfigs.map((config) => ({
        label: config.name,
        value: config,
      }))
    }
  } catch (error) {
    console.error('获取厂商配置列表失败:', error)
  }
}

onMounted(() => {
  fetchProviderConfigs()
})

// 计算节点是否已配置
const isConfigured = computed(() => {
  return (
    nodeData.value?.providers?.fieldValue &&
    nodeData.value?.providers?.fieldValue?.length > 0 &&
    (!!nodeData.value?.image?.fieldValue || !!nodeData.value?.imageUrl?.fieldValue)
  )
})

// 获取模型厂商预览
const getProvidersPreview = computed(() => {
  try {
    const providers = nodeData.value?.providers?.fieldValue || []
    if (!providers || providers.length === 0) return '未设置模型厂商'

    // 查找厂商配置的描述

    const preview = providers.name
    // 如果预览文本太长，截断显示
    if (preview.length > 20) {
      return preview.substring(0, 20) + '...'
    }
    return preview
  } catch (error) {
    console.error('Error in getProvidersPreview:', error)
    return '错误'
  }
})

// 获取图片预览
const getImagePreview = computed(() => {
  try {
    const image = nodeData.value?.image?.fieldValue || ''
    if (!image) return '未设置图片'

    // 如果是上传的图片，显示已上传
    if (nodeData.value?.image?.fieldType === 'upload' && image) {
      return '图片已上传'
    }

    // 如果是URL，显示URL预览
    if (image.length > 20) {
      return image.substring(0, 20) + '...'
    }
    return image || '未设置图片'
  } catch (error) {
    console.error('Error in getImagePreview:', error)
    return '错误'
  }
})

// 获取图片链接预览
const getImageUrlPreview = computed(() => {
  try {
    const imageUrl = nodeData.value?.imageUrl?.fieldValue || ''
    if (!imageUrl) return '未设置图片链接'

    // 如果图片链接太长，截断显示
    if (imageUrl.length > 20) {
      return imageUrl.substring(0, 20) + '...'
    }
    return '链接已设置'
  } catch (error) {
    console.error('Error in getImageUrlPreview:', error)
    return '错误'
  }
})
</script>

<style scoped>
.qwen-vl-node {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  min-width: 200px;
  max-width: 300px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.qwen-vl-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.qwen-vl-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.qwen-vl-node.invalid {
  border-color: var(--el-color-danger);
}

.qwen-vl-node.invalid .warning-icon {
  color: var(--el-color-danger);
}

.node-header {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success-dark-2);
  padding: 8px 12px;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
}

.warning-icon {
  color: var(--el-color-warning);
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.node-content {
  padding: 12px;
  position: relative;
  min-height: 60px;
}

.property-item {
  display: flex;
  align-items: center;
  margin: 12px 0;
  position: relative;
  padding-left: 15px;
}

.property-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 70px;
}

.property-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-color-info-light-9);
  font-size: 13px;
}

.property-value.not-configured {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.output-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  position: relative;
  padding-left: 15px;
}

.output-label {
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--el-color-info-light-5);
  border: 2px solid var(--el-border-color-darker);
  transition: all 0.2s ease;
}

:deep(.vue-flow__handle:hover) {
  background: var(--el-color-primary-light-5);
  border-color: var(--el-color-primary);
  transform: scale(1.2);
}

:deep(.vue-flow__handle-left) {
  left: -5px;
}

:deep(.vue-flow__handle-right) {
  right: -5px;
}

@media (max-width: 768px) {
  .qwen-vl-node {
    min-width: 160px;
    max-width: 250px;
  }

  .property-label {
    min-width: 60px;
    font-size: 12px;
  }

  .property-value {
    font-size: 12px;
  }
}
</style>
