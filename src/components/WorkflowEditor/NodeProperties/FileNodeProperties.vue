<template>
  <div class="file-properties">
    <el-form label-position="top">
      <el-form-item label="文件路径">
        <el-input
          v-model="localData.filePath.fieldValue"
          placeholder="请输入文件路径"
          @input="updateNodeData"
        />
        <div class="field-description">要操作的文件路径</div>
      </el-form-item>
      
      <el-form-item label="操作类型">
        <el-select 
          v-model="localData.operation.fieldValue" 
          @change="updateNodeData"
          placeholder="请选择操作类型"
          style="width: 100%"
        >
          <el-option
            v-for="option in localData.operation.options"
            :key="option"
            :label="getOperationLabel(option)"
            :value="option"
          />
        </el-select>
        <div class="field-description">文件操作类型</div>
      </el-form-item>
      
      <el-form-item 
        v-if="localData.operation.fieldValue !== 'read' && localData.operation.fieldValue !== 'delete'"
        label="文件内容"
      >
        <el-input
          v-model="localData.content.fieldValue"
          type="textarea"
          :rows="4"
          placeholder="请输入文件内容"
          @input="updateNodeData"
        />
        <div class="field-description">写入文件的内容</div>
      </el-form-item>
      
      <div class="operation-preview">
        <el-alert
          :title="getOperationDescription(localData.operation.fieldValue)"
          type="info"
          :closable="false"
        />
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import type { NodeProps } from '@/types/node'
import type { FileNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<{
  node: NodeProps<FileNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<FileNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<FileNodeData>({
  filePath: {
    fieldName: '文件路径',
    fieldValue: '',
    fieldDesc: '要操作的文件路径',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  operation: {
    fieldName: '操作类型',
    fieldValue: 'read',
    fieldDesc: '文件操作类型',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['read', 'write', 'append', 'delete'],
    show: true,
    required: true,
  },
  content: {
    fieldName: '文件内容',
    fieldValue: '',
    fieldDesc: '写入文件的内容',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: false,
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

// 获取操作标签
const getOperationLabel = (operation: string) => {
  switch (operation) {
    case 'read':
      return '读取文件'
    case 'write':
      return '写入文件'
    case 'append':
      return '追加文件'
    case 'delete':
      return '删除文件'
    default:
      return operation
  }
}

// 获取操作描述
const getOperationDescription = (operation?: string) => {
  switch (operation) {
    case 'read':
      return '读取指定路径的文件内容，将内容作为输出传递给下一个节点'
    case 'write':
      return '将指定内容写入到文件中，如果文件已存在则覆盖'
    case 'append':
      return '将指定内容追加到文件末尾，如果文件不存在则创建新文件'
    case 'delete':
      return '删除指定路径的文件'
    default:
      return '请选择文件操作类型'
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
.file-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.operation-preview {
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