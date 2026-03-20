<template>
  <div class="crawler-properties">
    <el-form label-position="top">
      <el-form-item label="目标网址" required>
        <el-input
          v-model="localData.url.fieldValue"
          placeholder="请输入要抓取的网页URL"
          @input="updateNodeData"
        />
        <div class="field-description">要抓取的网页URL</div>
      </el-form-item>
      
      <el-form-item label="输出格式" required>
        <el-select
          v-model="localData.format.fieldValue"
          placeholder="请选择输出格式"
          style="width: 100%"
          @change="updateNodeData"
        >
          <el-option label="文本格式" value="text" />
          <el-option label="HTML格式" value="html" />
        </el-select>
        <div class="field-description">选择输出内容的格式</div>
      </el-form-item>
      
      <div class="crawler-preview">
        <el-alert
          title="网页爬取配置说明"
          type="info"
          :closable="false"
          description="配置目标网址和输出格式，系统将自动抓取网页的标题和内容"
        />
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import type { NodeProps } from '@/types/node'
import type { CrawlerNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<{
  node: NodeProps<CrawlerNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<CrawlerNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<CrawlerNodeData>({
  url: {
    fieldName: '目标网址',
    fieldValue: '',
    fieldDesc: '要抓取的网页URL',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  format: {
    fieldName: '输出格式',
    fieldValue: 'text',
    fieldDesc: '输出格式',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['text', 'html'],
    show: true,
    required: true,
  }
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
.crawler-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.crawler-preview {
  margin-top: 16px;
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
</style>