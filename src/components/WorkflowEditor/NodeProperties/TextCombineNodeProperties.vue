<template>
  <div class="text-combine-properties">
    <el-form label-position="top">
      <el-form-item label="模板">
        <el-input
          v-model="localData.template.fieldValue"
          type="textarea"
          :rows="5"
          placeholder="请输入模板文本，使用 {{.变量名}} 作为占位符"
          @input="updateNodeData"
        />
        <div class="template-help">
          <el-alert
            title="模板语法说明"
            type="info"
            :closable="false"
            description="在模板中使用 {{.变量名}} 作为占位符，变量名将自动添加到变量列表中"
          />
        </div>
      </el-form-item>

      <el-form-item label="变量列表">
        <div class="variables-list">
          <div v-for="(variable, index) in localData.variables" :key="index" class="variable-item">
            <div class="variable-info">
              <span class="variable-name">{{ variable.fieldName }}</span>
              <el-tag size="small" class="variable-type-tag">
                {{ getVariableTypeLabel(variable.fieldType) }}
              </el-tag>
            </div>
            <div class="variable-actions">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                circle
                @click="removeVariable(index)"
              />
            </div>
          </div>
          <div class="add-variable">
            <el-button type="primary" size="small" @click="showAddVariableDialog"
              >添加变量</el-button
            >
          </div>
        </div>
      </el-form-item>
    </el-form>

    <!-- 添加变量对话框 -->
    <el-dialog
      v-model="addVariableDialogVisible"
      title="添加变量"
      width="300px"
      :close-on-click-modal="false"
    >
      <el-form :model="newVariable" label-position="top">
        <el-form-item label="变量名称" required>
          <el-input v-model="newVariable.name" placeholder="请输入变量名称" />
        </el-form-item>
        <el-form-item label="变量类型" required>
          <el-radio-group v-model="newVariable.type">
            <el-radio label="input">单行文本</el-radio>
            <el-radio label="textarea">多行文本</el-radio>
            <el-radio label="select">列表选项</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 列表选项的额外配置 -->
        <el-form-item v-if="newVariable.type === 'select'" label="选项列表">
          <div v-for="(option, index) in newVariable.options" :key="index" class="option-item">
            <el-input v-model="newVariable.options[index]" placeholder="选项值" />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click="removeOption(index)"
            />
          </div>
          <el-button type="primary" size="small" @click="addOption">添加选项</el-button>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="newVariable.description"
            type="textarea"
            :rows="2"
            placeholder="请输入变量描述（可选）"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="newVariable.required">必填</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addVariableDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddVariable">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { FieldType, type NodeProps, type TextCombineNodeData } from '../../../types/node'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  node: NodeProps<TextCombineNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<TextCombineNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<TextCombineNodeData>({
  template: {
    fieldValue: '',
    fieldType: FieldType.TEXTAREA,
    fieldDesc: '在这里写模版，只支持golang模版语法',
    list: false,
    fieldName: '模版',
    options: [],
    show: true,
    required: true,
  },
  variables: [],
})

// 添加变量对话框控制
const addVariableDialogVisible = ref(false)

// 新变量临时数据
const newVariable = reactive({
  name: '',
  type: 'input', // 默认为单行文本
  description: '',
  required: true,
  options: ['选项1', '选项2'], // 默认选项（仅用于select类型）
})

// 初始化本地数据
onMounted(() => {
  localData.template = props.node.data?.template || {
    fieldValue: '这是一个模板，可以包含变量如 {{.变量1}} 和 {{.变量2}}',
    fieldType: FieldType.TEXTAREA,
    fieldDesc: '在这里写模版，只支持golang模版语法',
    list: false,
    fieldName: '模版',
    options: [],
    show: true,
    required: true,
  }
  localData.variables = props.node.data?.variables || []
})

// 显示添加变量对话框
const showAddVariableDialog = () => {
  // 重置新变量数据
  newVariable.name = `变量${localData.variables.length + 1}`
  newVariable.type = 'text'
  newVariable.description = ''
  newVariable.required = true
  newVariable.options = ['选项1', '选项2']

  // 显示对话框
  addVariableDialogVisible.value = true
}

// 确认添加变量
const confirmAddVariable = () => {
  // 验证变量名不为空
  if (!newVariable.name.trim()) {
    // 可以添加错误提示
    return
  }

  // 根据选择的类型创建变量
  const variable = {
    fieldName: newVariable.name,
    fieldDesc: newVariable.description,
    fieldValue: '',
    fieldType:
      newVariable.type === 'select'
        ? 'select'
        : newVariable.type === 'textarea'
          ? 'textarea'
          : 'text',
    options: newVariable.type === 'select' ? [...newVariable.options] : [],
    show: true,
    list: false,
    required: newVariable.required,
  }

  // 添加到变量列表
  localData.variables.push(variable)

  // 更新节点数据
  updateNodeData()

  // 关闭对话框
  addVariableDialogVisible.value = false
}

// 添加选项（用于select类型）
const addOption = () => {
  newVariable.options.push(`选项${newVariable.options.length + 1}`)
}

// 移除选项
const removeOption = (index: number) => {
  newVariable.options.splice(index, 1)
}

// 获取变量类型的显示标签
const getVariableTypeLabel = (type: string): string => {
  switch (type) {
    case 'text':
    case 'input':
      return '单行文本'
    case 'textarea':
      return '多行文本'
    case 'select':
      return '列表选项'
    default:
      return '文本'
  }
}

// 移除变量
const removeVariable = (index: number) => {
  localData.variables.splice(index, 1)
  updateNodeData()
}

// 更新节点数据
const updateNodeData = () => {
  if (props.node.id) {
    props.node.data = localData
    const updatedNode = props.node
    emit('update:node', updatedNode)
  }
}

// 监听模板变化，自动提取变量
watch(
  () => localData.template,
  () => {},
)

// 监听节点数据变化，更新本地数据
watch(
  () => props.node.data,
  (newData, oldData) => {
    console.log('TextCombineNode props.node.data changed:', newData, oldData)
    if (newData) {
      localData.template = newData.template || '这是一个模板，可以包含变量如 {{变量1}} 和 {{变量2}}'
      localData.variables = newData.variables || []
    }
  },
  { deep: true },
)
</script>

<style scoped>
.text-combine-properties {
  padding: 16px;
}

.template-help {
  margin-top: 8px;
}

.variables-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.variable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.variable-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.variable-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.variable-type-tag {
  font-size: 12px;
  padding: 0 8px;
  height: 20px;
  line-height: 20px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-8);
}

.variable-actions {
  display: flex;
  gap: 8px;
}

.add-variable {
  margin-top: 8px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* 选项列表样式 */
.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.option-item :deep(.el-input) {
  flex: 1;
}

/* 表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

/* 变量类型选择器样式 */
:deep(.el-radio) {
  margin-right: 0;
  padding: 8px 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-radio.is-checked) {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

/* 必填选项样式 */
:deep(.el-checkbox) {
  margin-right: 0;
}

/* 对话框内容区域最大高度 */
:deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
