<template>
  <div class="start-properties">
    <el-form label-position="top">
      <el-form-item label="输出值">
        <el-input
          v-model="localData.output.fieldValue"
          placeholder="请输入开始节点的输出值"
          @input="updateNodeData"
        />
        <div class="field-description">开始节点触发时输出的值</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { FieldType, type NodeProps } from '@/types/node'
import type { StartNodeData } from '@/types/node'

const props = defineProps<{
  node: NodeProps<StartNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<StartNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<StartNodeData>({
  output: {
    fieldName: '输出',
    fieldValue: '开始',
    fieldDesc: '开始节点输出',
    fieldType: FieldType.DIV,
    list: false,
    options: [],
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
.start-properties {
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

:deep(.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  background-color: var(--el-fill-color-light);
}
</style>
