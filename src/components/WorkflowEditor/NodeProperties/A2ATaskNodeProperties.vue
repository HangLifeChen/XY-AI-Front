<template>
  <div class="a2a-task-properties">
    <el-form label-position="top">
      <!-- 目标端点 -->
      <el-form-item label="目标端点" required>
        <el-input
          v-model="localData.endpoint.fieldValue"
          placeholder="请输入A2A端点URL"
          @input="updateNodeData"
        />
        <div class="field-description">A2A智能体的端点URL</div>
      </el-form-item>

      <!-- 任务描述 -->
      <el-form-item label="任务描述" required>
        <el-input
          v-model="localData.taskDescription.fieldValue"
          type="textarea"
          :rows="3"
          placeholder="请输入任务描述"
          @input="updateNodeData"
        />
        <div class="field-description">发送给A2A智能体的任务描述</div>
      </el-form-item>

      <!-- 输入变量 -->
      <el-form-item label="输入变量">
        <div class="variables-list">
          <div
            v-for="(variable, index) in localData.inputVariables.fieldValue"
            :key="index"
            class="variable-item"
          >
            <el-input
              v-model="variable.name"
              placeholder="变量名"
              style="width: 40%"
              @input="updateNodeData"
            />
            <el-input
              v-model="variable.value"
              placeholder="变量值"
              style="width: 40%; margin-left: 10px"
              @input="updateNodeData"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              style="margin-left: 10px"
              @click="removeVariable(index)"
            />
          </div>
          <el-button type="primary" size="small" @click="addVariable" style="margin-top: 10px">
            添加变量
          </el-button>
        </div>
        <div class="field-description">为A2A任务添加输入变量</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { FieldType, type NodeProps } from '@/types/node'
import type { A2ATaskNodeData } from '@/types/node'

const props = defineProps<{
  node: NodeProps<A2ATaskNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<A2ATaskNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<A2ATaskNodeData>({
  endpoint: {
    fieldName: '目标端点',
    fieldValue: '',
    fieldDesc: 'A2A智能体的端点URL',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  taskDescription: {
    fieldName: '任务描述',
    fieldValue: '',
    fieldDesc: '发送给A2A智能体的任务描述',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  inputVariables: {
    fieldName: '输入变量',
    fieldValue: [],
    fieldDesc: 'A2A任务的输入变量',
    fieldType: FieldType.DIV,
    list: true,
    options: [],
    show: true,
    required: false,
  },
  output: {
    fieldName: '输出',
    fieldValue: null,
    fieldDesc: 'A2A任务的输出结果',
    fieldType: FieldType.DIV,
    list: false,
    options: [],
    show: true,
    required: false,
  },
})

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    Object.assign(localData, props.node.data)

    // 确保inputVariables字段是数组
    if (!Array.isArray(localData.inputVariables.fieldValue)) {
      localData.inputVariables.fieldValue = []
    }
  }
})

// 添加变量
const addVariable = () => {
  localData.inputVariables.fieldValue.push({
    name: '',
    value: '',
  })
  updateNodeData()
}

// 移除变量
const removeVariable = (index: number) => {
  localData.inputVariables.fieldValue.splice(index, 1)
  updateNodeData()
}

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

      // 确保inputVariables字段是数组
      if (!Array.isArray(localData.inputVariables.fieldValue)) {
        localData.inputVariables.fieldValue = []
      }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.a2a-task-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.variables-list {
  width: 100%;
}

.variable-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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
