<template>
  <div class="code-execution-properties">
    <el-form label-position="top">
      <!-- 编程语言 -->
      <el-form-item label="编程语言" required>
        <el-select
          v-model="localData.language.fieldValue"
          placeholder="请选择编程语言"
          style="width: 100%"
          @change="updateNodeData"
        >
          <el-option v-for="lang in languages" :key="lang" :label="lang" :value="lang" />
        </el-select>
        <div class="field-description">选择代码执行的编程语言</div>
      </el-form-item>

      <!-- 代码编辑器 -->
      <el-form-item label="执行代码" required>
        <el-input
          v-model="localData.code.fieldValue"
          type="textarea"
          :rows="8"
          placeholder="请输入要执行的代码"
          @input="updateNodeData"
        />
        <div class="field-description">输入要执行的代码</div>
      </el-form-item>

      <!-- 参数管理 -->
      <el-form-item label="输入参数">
        <div class="parameters-list">
          <div
            v-for="(param, index) in localData.parameters.fieldValue"
            :key="index"
            class="param-item"
          >
            <el-input
              v-model="param.fieldName"
              placeholder="参数名称"
              style="width: 40%"
              @input="updateNodeData"
            />
            <el-input
              v-model="param.fieldValue"
              placeholder="参数值"
              style="width: 40%; margin-left: 10px"
              @input="updateNodeData"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              style="margin-left: 10px"
              @click="removeParameter(index)"
            />
          </div>
          <el-button type="primary" size="small" @click="addParameter" style="margin-top: 10px">
            添加参数
          </el-button>
        </div>
        <div class="field-description">为代码执行添加输入参数</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { FieldType, type NodeProps } from '@/types/node'
import type { CodeExecutionNodeData, FieldData } from '@/types/node'

const props = defineProps<{
  node: NodeProps<CodeExecutionNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<CodeExecutionNodeData>): void
}>()

// 编程语言选项
const languages = ['javascript', 'python', 'bash']

// 创建本地响应式数据
const localData = reactive<CodeExecutionNodeData>({
  language: {
    fieldName: '编程语言',
    fieldValue: 'javascript',
    fieldDesc: '代码执行的编程语言',
    fieldType: FieldType.SELECT,
    list: false,
    options: languages,
    show: true,
    required: true,
  },
  code: {
    fieldName: '执行代码',
    fieldValue: '// 在这里编写代码\nreturn "Hello, World!";',
    fieldDesc: '要执行的代码',
    fieldType: FieldType.SELECT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  parameters: {
    fieldName: '输入参数',
    fieldValue: [],
    fieldDesc: '代码执行的输入参数',
    fieldType: FieldType.DIV,
    list: true,
    options: [],
    show: true,
    required: false,
  },
})

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    Object.assign(localData, props.node.data)

    // 确保parameters字段是数组
    if (!Array.isArray(localData.parameters.fieldValue)) {
      localData.parameters.fieldValue = []
    }
  }
})

// 添加参数
const addParameter = () => {
  localData.parameters.fieldValue.push({
    fieldName: `param${localData.parameters.fieldValue.length + 1}`,
    fieldValue: '',
    fieldDesc: '',
    fieldType: 'text',
    list: false,
    options: [],
    show: true,
    required: false,
  })
  updateNodeData()
}

// 移除参数
const removeParameter = (index: number) => {
  localData.parameters.fieldValue.splice(index, 1)
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

      // 确保parameters字段是数组
      if (!Array.isArray(localData.parameters.fieldValue)) {
        localData.parameters.fieldValue = []
      }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.code-execution-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.parameters-list {
  width: 100%;
}

.param-item {
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
  font-family: monospace;
}

:deep(.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  background-color: var(--el-fill-color-light);
}
</style>
