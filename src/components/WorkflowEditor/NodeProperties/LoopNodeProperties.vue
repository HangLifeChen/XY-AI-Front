<template>
  <div class="loop-properties">
    <el-form label-position="top">
      <!-- 循环次数 -->
      <el-form-item label="循环次数" required>
        <el-input-number
          v-model="localData.count.fieldValue"
          :min="1"
          :max="1000"
          :step="1"
          style="width: 100%"
          @change="updateNodeData"
        />
        <div class="field-description">设置循环执行的次数</div>
      </el-form-item>

      <!-- 循环变量名 -->
      <el-form-item label="循环变量名" required>
        <el-input
          v-model="localData.variable.fieldValue"
          placeholder="请输入循环变量名，例如: item"
          @input="updateNodeData"
        />
        <div class="field-description">在循环体中引用当前项的变量名</div>
      </el-form-item>

      <!-- 循环说明 -->
      <el-alert
        title="使用说明"
        type="info"
        :closable="false"
        description="连接到'循环体'的节点将在每次循环中执行，连接到'循环结束'的节点将在循环完成后执行。"
      />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { FieldType, type NodeProps } from '@/types/node'
import type { LoopNodeData } from '@/types/node'

const props = defineProps<{
  node: NodeProps<LoopNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<LoopNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<LoopNodeData>({
  count: {
    fieldName: '循环次数',
    fieldValue: 3,
    fieldDesc: '循环执行的次数',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  variable: {
    fieldName: '循环变量',
    fieldValue: 'item',
    fieldDesc: '循环中使用的变量名',
    fieldType: FieldType.TEXT,
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
.loop-properties {
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

:deep(.el-alert) {
  margin-top: 20px;
}
</style>
