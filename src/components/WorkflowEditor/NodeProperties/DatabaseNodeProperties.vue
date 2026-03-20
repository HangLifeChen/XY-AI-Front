<template>
  <div class="database-properties">
    <el-form label-position="top">
      <el-form-item label="连接字符串">
        <el-input
          v-model="localData.connectionString.fieldValue"
          placeholder="请输入数据库连接字符串"
          @input="updateNodeData"
        />
        <div class="field-description">数据库连接字符串</div>
      </el-form-item>
      
      <el-form-item label="查询语句">
        <el-input
          v-model="localData.query.fieldValue"
          type="textarea"
          :rows="4"
          placeholder="请输入SQL查询语句"
          @input="updateNodeData"
        />
        <div class="field-description">SQL查询语句</div>
      </el-form-item>
      
      <el-form-item label="查询参数">
        <el-input
          v-model="parameterInput"
          placeholder="请输入查询参数，多个参数用逗号分隔"
          @input="updateParameters"
        />
        <div class="field-description">SQL查询参数，多个参数用逗号分隔</div>
      </el-form-item>
      
      <div class="database-preview">
        <el-alert
          title="数据库查询配置说明"
          type="info"
          :closable="false"
          description="配置数据库连接字符串、SQL查询语句和可选的查询参数，系统将执行查询并将结果作为输出传递给下一个节点"
        />
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted, ref } from 'vue'
import type { NodeProps } from '@/types/node'
import type { DatabaseNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<{
  node: NodeProps<DatabaseNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<DatabaseNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<DatabaseNodeData>({
  connectionString: {
    fieldName: '连接字符串',
    fieldValue: '',
    fieldDesc: '数据库连接字符串',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  query: {
    fieldName: '查询语句',
    fieldValue: 'SELECT * FROM table',
    fieldDesc: 'SQL查询语句',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  parameters: {
    fieldName: '查询参数',
    fieldValue: [],
    fieldDesc: 'SQL查询参数',
    fieldType: FieldType.TEXT,
    list: true,
    options: [],
    show: true,
    required: false,
  }
})

// 参数输入框的本地状态
const parameterInput = ref('')

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    Object.assign(localData, props.node.data)
    // 将参数数组转换为字符串
    if (Array.isArray(localData.parameters.fieldValue)) {
      parameterInput.value = localData.parameters.fieldValue.join(', ')
    }
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

// 更新参数
const updateParameters = () => {
  // 将输入的字符串转换为数组
  if (parameterInput.value) {
    localData.parameters.fieldValue = parameterInput.value
      .split(',')
      .map(param => param.trim())
      .filter(param => param.length > 0)
  } else {
    localData.parameters.fieldValue = []
  }
  updateNodeData()
}

// 监听节点数据变化
watch(
  () => props.node.data,
  (newData) => {
    if (newData) {
      Object.assign(localData, newData)
      // 同步参数输入框
      if (Array.isArray(localData.parameters.fieldValue)) {
        parameterInput.value = localData.parameters.fieldValue.join(', ')
      }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.database-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.database-preview {
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