<template>
  <div class="condition-properties">
    <el-form label-position="top">
      <el-form-item label="条件表达式" required>
        <el-input
          v-model="localData.condition.fieldValue"
          type="textarea"
          :rows="4"
          placeholder="请输入条件表达式，例如: {{.score}} > 60"
          @input="updateNodeData"
        />
        <div class="field-description">
          条件表达式用于判断流程走向。支持变量引用，如
          &#123;&#123;.变量名&#125;&#125;，并可使用比较运算符（>, <, >=, <=, ==, !=）。
        </div>
      </el-form-item>

      <el-form-item label="为真时的分支标签">
        <el-input
          v-model="localData.trueBranch.fieldValue"
          placeholder="请输入为真时的分支标签"
          @input="updateNodeData"
        />
        <div class="field-description">条件为真时输出连接的标签名称</div>
      </el-form-item>

      <el-form-item label="为假时的分支标签">
        <el-input
          v-model="localData.falseBranch.fieldValue"
          placeholder="请输入为假时的分支标签"
          @input="updateNodeData"
        />
        <div class="field-description">条件为假时输出连接的标签名称</div>
      </el-form-item>

      <el-form-item label="示例表达式">
        <div class="example-list">
          <div class="example-item" @click="useExample('{{.score}} > 60')">
            &#123;&#123;.score&#125;&#125; > 60
          </div>
          <div class="example-item" @click="useExample('{{.status}} == active')">
            &#123;&#123;.status&#125;&#125; == "active"
          </div>
          <div class="example-item" @click="useExample('{{.count}} >= 1 && {{.type}} == premium')">
            &#123;&#123;.count&#125;&#125; >= 1 && &#123;&#123;.type&#125;&#125; == "premium"
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { FieldType, type NodeProps } from '@/types/node'
import type { ConditionNodeData } from '@/types/node'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  node: NodeProps<ConditionNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<ConditionNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<ConditionNodeData>({
  condition: {
    fieldName: '条件表达式',
    fieldValue: '',
    fieldDesc: '条件判断表达式，如: {{.变量名}} > 10',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  trueBranch: {
    fieldName: '为真时的分支',
    fieldValue: 'true',
    fieldDesc: '条件为真时执行的分支',
    fieldType: FieldType.DIV,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  falseBranch: {
    fieldName: '为假时的分支',
    fieldValue: 'false',
    fieldDesc: '条件为假时执行的分支',
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

// 使用示例表达式
const useExample = (expression: string) => {
  localData.condition.fieldValue = expression
  updateNodeData()
  ElMessage.success('已应用示例表达式')
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
.condition-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-item {
  padding: 8px 12px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
  font-size: 13px;
  color: var(--el-color-primary);
  transition: all 0.2s ease;
}

.example-item:hover {
  background: var(--el-color-primary-light-7);
  border-color: var(--el-color-primary);
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
