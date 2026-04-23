<template>
  <el-dialog
    title="测试工作流"
    v-model="dialogVisible"
    width="90%"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <div class="test-dialog-content">
      <div class="split-layout">
        <!-- 左侧：输入参数部分 -->
        <div class="input-section">
          <h3>输入参数</h3>
          <div class="input-scroll-container">
            <el-form :model="inputParams" label-width="100px" label-position="top">
              <template v-if="inputNodes.length === 0">
                <div class="no-inputs">
                  <el-empty description="没有找到输入节点" />
                </div>
              </template>
              <template v-for="node in inputNodes" :key="node.id">
                <div class="node-fields">
                  <template
                    v-for="(field, fieldKey) in getNodeFields(node)"
                    :key="`${node.id}-${fieldKey}`"
                  >
                    <el-form-item
                      v-if="field.show !== false"
                      :label="
                        (field.fieldName || fieldKey) +
                        (field.isArrayItem ? ` [${field.arrayIndex}]` : '')
                      "
                      :prop="`${node.id}.${fieldKey}`"
                      :class="{ 'array-field-item': field.isArrayItem }"
                    >
                      <div class="field-description" v-if="field.fieldDesc">
                        {{ field.fieldDesc }}
                      </div>

                      <!-- 文本输入 -->
                      <template v-if="field.fieldType === FieldType.TEXT">
                        <el-input
                          v-model="inputParams[node.id][fieldKey]"
                          :placeholder="`请输入${field.fieldName || fieldKey}`"
                          type="text"
                        />
                      </template>

                      <!-- 数字输入 -->
                      <template v-else-if="field.fieldType === FieldType.INPUT_NUMBER">
                        <el-input-number
                          v-model="inputParams[node.id][fieldKey]"
                          :placeholder="`请输入数字`"
                          style="width: 100%"
                        />
                      </template>

                      <!-- 布尔值输入 -->
                      <template v-else-if="field.fieldType === 'boolean'">
                        <el-switch v-model="inputParams[node.id][fieldKey]" />
                      </template>

                      <!-- 选择器 -->
                      <template v-else-if="field.fieldType === FieldType.SELECT">
                        <el-select
                          v-model="inputParams[node.id][fieldKey]"
                          :placeholder="`请选择${field.fieldName || fieldKey}`"
                          style="width: 100%"
                          value-key="id"
                        >
                          <el-option
                            v-for="(option, index) in getFieldOptions(field)"
                            :key="index"
                            :label="typeof option === 'object' ? option.label : option"
                            :value="typeof option === 'object' ? option.value : option"
                          />
                        </el-select>
                      </template>

                      <!-- 多行文本输入 -->
                      <template v-else-if="field.fieldType === FieldType.TEXTAREA">
                        <el-input
                          v-model="inputParams[node.id][fieldKey]"
                          :placeholder="`请输入${field.fieldName || fieldKey}`"
                          type="textarea"
                          :rows="4"
                        />
                      </template>

                      <!-- 日期选择器 -->
                      <template v-else-if="field.fieldType === FieldType.DATE">
                        <el-date-picker
                          v-model="inputParams[node.id][fieldKey]"
                          type="date"
                          :placeholder="`请选择日期`"
                          style="width: 100%"
                        />
                      </template>

                      <!-- 文件上传 -->
                      <template v-else-if="field.fieldType === FieldType.UPLOAD">
                        <el-input
                          v-model="inputParams[node.id][fieldKey]"
                          :placeholder="`请输入文件URL或上传文件`"
                          type="text"
                        />
                        <el-upload
                          class="upload-demo"
                          action=""
                          :auto-upload="false"
                          :show-file-list="false"
                          :on-change="(file) => handleFileUpload(node.id, fieldKey, file)"
                        >
                          <el-button size="small" type="primary" style="margin-top: 8px">
                            点击上传
                          </el-button>
                        </el-upload>
                      </template>

                      <!-- 默认文本输入 -->
                      <template v-else>
                        <el-input
                          v-model="inputParams[node.id][fieldKey]"
                          :placeholder="`请输入${field.fieldName || fieldKey}`"
                        />
                      </template>
                    </el-form-item>
                  </template>
                </div>
              </template>
            </el-form>
          </div>
        </div>

        <!-- 右侧：输出结果部分 -->
        <div class="output-section">
          <h3>执行结果</h3>
          <div class="output-content" ref="outputContent">
            <template v-if="isExecuting">
              <el-progress :percentage="executionProgress" />
              <div class="executing-status">正在执行...</div>
            </template>
            <template v-else>
              <div v-if="!hasExecuted" class="no-result">点击执行按钮开始测试工作流</div>
              <div v-else class="result-container">
                <div v-for="(result, index) in executionResults" :key="index" class="result-item">
                  <div class="result-node-name">{{ result.nodeName }}</div>
                  <div class="result-content" :class="{ 'has-error': result.error }">
                    <component :is="getResultComponent(result.data)" :data="result.data" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button
          type="primary"
          @click="executeWorkflow"
          :loading="isExecuting"
          :disabled="!hasInputNodes"
        >
          执行
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { ElMessage } from 'element-plus'
import type { Node } from '@vue-flow/core'
import { executeWorkflow as executeWorkflowApi } from '@/api/workflow'
import { marked } from 'marked'
import { FileStorageService } from '@/api/cloudStorageService'
import type { StorageFileUploadRequest } from '@/types/cloudStorage'
import { FieldType } from '@/types/node'

// 设置 marked 选项
marked.setOptions({
  gfm: true,
  breaks: true,
  smartypants: true,
})

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:visible'])

const workflowStore = useWorkflowStore()

// 对话框可见性控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// 输入参数状态
const inputParams = ref<Record<string, Record<string, any>>>({})
const isExecuting = ref(false)
const executionProgress = ref(0)
const hasExecuted = ref(false)
const executionResults = ref<Array<{ nodeName: string; data: any; error?: boolean }>>([])

// 处理文件上传
const handleFileUpload = async (nodeId: string, fieldKey: string, file: any) => {
  try {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.raw.type)) {
      ElMessage.error('只支持 JPG、PNG 格式的图片')
      return false
    }

    // 检查文件大小 (5MB)
    if (file.raw.size > 5 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 5MB')
      return false
    }

    // 上传到云存储
    const uploadRequest: StorageFileUploadRequest = {
      file: file.raw,
    }

    const response = await FileStorageService.uploadFile(uploadRequest)
    // 将返回的URL设置到对应的输入字段中
    inputParams.value[nodeId][fieldKey] = response.url
    ElMessage.success('文件上传成功')
  } catch (error: any) {
    ElMessage.error('文件上传失败: ' + (error.message || '未知错误'))
  }
  return false // 阻止自动上传
}

// 获取节点的字段
const getNodeFields = (node: Node) => {
  const fields: Record<string, any> = {}
  // 遍历节点的data对象，找出符合FieldData结构的字段
  for (const key in node.data) {
    console.log('getNodeFields', key, node.data[key])
    const field = node.data[key]

    if (field) {
      // 如果字段是数组，处理数组中的每个元素
      if (Array.isArray(field)) {
        field.forEach((item, index) => {
          // 为数组中的每个元素创建一个唯一的键
          const arrayFieldKey = `${key}_${index}`
          fields[arrayFieldKey] = {
            ...item,
            // 添加一个标记，表示这是数组中的一个元素
            isArrayItem: true,
            // 保存原始键和索引，以便后续处理
            originalKey: key,
            arrayIndex: index,
          }
        })
      } else {
        // 非数组字段直接添加
        fields[key] = field
      }
    }
  }
  return fields
}

// 获取字段的选项列表
const getFieldOptions = (field: any): Array<string | { label: string; value: any }> => {
  console.log('getFieldOptions', field)
  // 如果字段有options属性且是数组，则返回该数组
  if (field.options && Array.isArray(field.options)) {
    return field.options
  }

  // 如果没有options属性或options不是数组，则返回空数组
  return []
}

// 初始化节点的输入参数
const initNodeInputParams = () => {
  const params: Record<string, Record<string, any>> = {}

  inputNodes.value.forEach((node) => {
    params[node.id] = {}
    const fields = getNodeFields(node)
    for (const key in fields) {
      const field = fields[key]

      // 使用字段的默认值初始化
      if (field.isArrayItem) {
        // 对于数组元素，从原始数组中获取值
        const originalKey = field.originalKey
        const index = field.arrayIndex

        if (
          Array.isArray(node.data[originalKey]) &&
          node.data[originalKey][index] &&
          node.data[originalKey][index].fieldValue !== undefined
        ) {
          params[node.id][key] = node.data[originalKey][index].fieldValue
        } else {
          params[node.id][key] = field.fieldValue !== undefined ? field.fieldValue : null
        }
      } else {
        // 非数组字段直接使用默认值
        params[node.id][key] = field.fieldValue !== undefined ? field.fieldValue : null
      }
    }
  })

  return params
}

// 将表单数据转换回原始结构（处理数组字段）
const convertFormDataToOriginal = (formData: Record<string, Record<string, any>>) => {
  const result: Record<string, Record<string, any>> = {}

  // 遍历每个节点
  for (const nodeId in formData) {
    result[nodeId] = {}
    const nodeData = formData[nodeId]
    const arrayFields: Record<string, any[]> = {}

    // 第一遍：收集所有非数组字段和创建数组容器
    for (const key in nodeData) {
      const value = nodeData[key]
      const fields = getNodeFields(workflowStore.nodes.find((n) => n.id === nodeId) as Node)
      const fieldInfo = fields[key]

      if (fieldInfo && fieldInfo.isArrayItem) {
        // 如果是数组项，先创建数组容器
        const originalKey = fieldInfo.originalKey
        if (!arrayFields[originalKey]) {
          arrayFields[originalKey] = []
        }
      } else {
        // 非数组字段直接添加
        result[nodeId][key] = value
      }
    }

    // 第二遍：填充数组字段
    for (const key in nodeData) {
      const value = nodeData[key]
      const fields = getNodeFields(workflowStore.nodes.find((n) => n.id === nodeId) as Node)
      const fieldInfo = fields[key]

      if (fieldInfo && fieldInfo.isArrayItem) {
        const originalKey = fieldInfo.originalKey
        const index = fieldInfo.arrayIndex

        // 确保数组有足够的长度
        while (arrayFields[originalKey].length <= index) {
          arrayFields[originalKey].push(null)
        }

        // 移除我们添加的元数据，只保留原始字段数据
        const cleanValue = { ...value }
        delete cleanValue.isArrayItem
        delete cleanValue.originalKey
        delete cleanValue.arrayIndex

        // 设置数组元素
        arrayFields[originalKey][index] = cleanValue
      }
    }

    // 将处理好的数组添加到结果中
    for (const arrayKey in arrayFields) {
      result[nodeId][arrayKey] = arrayFields[arrayKey]
    }
  }

  return result
}

// 创建节点数据的深拷贝并更新字段值
const createUpdatedNodesClone = () => {
  // 深拷贝所有节点
  const nodesClone = workflowStore.nodes.map((node) => ({
    ...node,
    data: JSON.parse(JSON.stringify(node.data)),
  }))
  // 遍历每个输入节点的克隆
  for (const node of nodesClone.filter((node) => node.category !== 'output')) {
    const nodeId = node.id
    const nodeParams = inputParams.value[nodeId]
    if (!nodeParams) continue

    // 遍历节点的所有字段
    for (const key in nodeParams) {
      const value = nodeParams[key]
      const fields = getNodeFields(node)
      const fieldInfo = fields[key]

      if (!fieldInfo) continue

      if (fieldInfo.isArrayItem) {
        // 如果是数组项，更新数组中对应索引的元素
        const originalKey = fieldInfo.originalKey
        const index = fieldInfo.arrayIndex

        // 确保node.data[originalKey]是一个数组
        if (!Array.isArray(node.data[originalKey])) {
          node.data[originalKey] = []
        }

        // 确保数组有足够的长度
        while (node.data[originalKey].length <= index) {
          node.data[originalKey].push({})
        }

        // 更新数组元素的fieldValue
        node.data[originalKey][index].fieldValue = value
      } else {
        // 如果是普通字段，直接更新fieldValue
        if (node.data[key] && typeof node.data[key] === 'object') {
          node.data[key].fieldValue = value
        } else {
          node.data[key] = { fieldValue: value }
        }
      }
    }
  }

  return nodesClone
}

// 获取所有输入节点
const inputNodes = computed(() => {
  console.log('inputNodes', workflowStore.nodes)
  return workflowStore.nodes.filter((node) => node.category !== 'startEnd')
})

// 检查是否有输入节点
const hasInputNodes = computed(() => inputNodes.value.length > 0)

// 关闭对话框
const closeDialog = () => {
  if (isExecuting.value) {
    ElMessage.warning('工作流正在执行中，请等待执行完成')
    return
  }
  dialogVisible.value = false
}
// 从 Markdown 代码块中提取 HTML 内容
const extractHtmlFromMarkdown = (markdown: string): string => {
  // 匹配 Markdown 代码块的正则表达式
  const codeBlockRegex = /```(?:html)?([\s\S]*?)```/
  const match = markdown.match(codeBlockRegex)

  // 如果找到代码块，返回其中的内容，否则返回原始内容
  return match ? match[1].trim() : markdown
}
// 根据数据类型返回适当的显示组件
const getResultComponent = (data: any) => {
  console.log('getResultComponent', data)
  // 如果是对象且有type字段
  if (typeof data === 'object' && data !== null && data.type) {
    // 如果是textDisplay类型，使用特殊显示组件
    if (data.type === 'textDisplay') {
      return TextDisplayResult
    }
    // 如果是htmlDisplay类型，使用HTML显示组件
    if (data.type === 'htmlDisplay') {
      return HtmlDisplayResult
    }
  }
  // 默认使用文本显示组件
  return DefaultResult
}

// 默认结果显示组件
const DefaultResult = {
  props: ['data', 'error'],
  setup(props: { data: any }) {
    return () => {
      // 如果是纯文本，使用 Markdown 渲染
      if (typeof props.data === 'string') {
        return h('div', {
          innerHTML: marked.parse(props.data),
          class: { 'markdown-content': true, 'error-content': props.error },
        })
      }
      // 如果是对象，格式化为JSON显示
      else if (typeof props.data === 'object') {
        return h(
          'pre',
          { class: { 'error-content': props.error } },
          JSON.stringify(props.data, null, 2),
        )
      }
      // 其他类型转换为字符串显示，并使用 Markdown 渲染
      else {
        return h('div', {
          innerHTML: marked.parse(String(props.data)),
          class: { 'markdown-content': true, 'error-content': props.error },
        })
      }
    }
  },
}

// TextDisplay节点结果展示组件
const TextDisplayResult = {
  props: ['data'],
  setup(props: { data: any }) {
    return () => {
      console.log('TextDisplayResult', props)
      const children = []

      // 显示标题（如果存在）
      if (props.data.title) {
        children.push(h('h3', { class: 'text-display-title' }, props.data.title))
      }

      // 显示内容
      if (props.data.content) {
        // 始终使用 Markdown 渲染内容
        children.push(
          h('div', {
            class: 'text-display-content markdown-content',
            innerHTML: marked.parse(props.data.content),
          }),
        )
      }

      return h('div', { class: 'text-display-result' }, children)
    }
  },
}

// HTML显示结果组件
const HtmlDisplayResult = {
  props: ['data'],
  setup(props: { data: any }) {
    return () => {
      // 提取HTML内容并渲染
      const htmlContent = extractHtmlFromMarkdown(props.data.htmlContent) || ''
      return h('div', {
        class: 'html-display-result',
        innerHTML: htmlContent,
      })
    }
  },
}

// 执行工作流
const executeWorkflow = async () => {
  try {
    isExecuting.value = true
    executionProgress.value = 0
    executionResults.value = []

    // 验证必填输入
    for (const node of inputNodes.value) {
      const fields = getNodeFields(node)
      for (const key in fields) {
        const field = fields[key]
        if (
          field.required &&
          (!inputParams.value[node.id] ||
            inputParams.value[node.id][key] === undefined ||
            inputParams.value[node.id][key] === null)
        ) {
          throw new Error(`${node.data.label || node.id} 的 ${field.fieldName || key} 是必填项`)
        }
      }
    }

    // 模拟工作流执行进度
    const progressInterval = setInterval(() => {
      if (executionProgress.value < 90) {
        executionProgress.value += 10
      }
    }, 500)

    // 创建节点数据的副本并更新字段值
    const updatedNodesClone = createUpdatedNodesClone()

    // 调用工作流执行引擎的API，传递节点数据的副本
    const results = await executeWorkflowApi(
      workflowStore.currentWorkflow?.id || '',
      updatedNodesClone,
      workflowStore.edges,
    )
    console.log('results', results)
    // 清理进度条定时器
    clearInterval(progressInterval)
    executionProgress.value = 100

    if (results.error) {
      // 处理执行结果
      executionResults.value = [
        {
          nodeName: '错误',
          data: results.error,
          error: true,
        },
      ]
    } else {
      for (let [key, value] of Object.entries(results.result)) {
        executionResults.value.push({
          nodeName: key,
          data: value,
          error: false,
        })
      }
    }

    hasExecuted.value = true
    ElMessage.success('工作流执行完成')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '工作流执行失败')
    executionResults.value = [
      {
        nodeName: '错误',
        data: error instanceof Error ? error.message : '未知错误',
        error: true,
      },
    ]
  } finally {
    isExecuting.value = false
  }
}

// 监听对话框打开，重置状态
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      // 初始化输入参数
      inputParams.value = initNodeInputParams()
      hasExecuted.value = false
      executionResults.value = []
      executionProgress.value = 0
    }
  },
)
</script>

<style scoped>
.test-dialog-content {
  max-height: 70vh;
  overflow: hidden;
}

.split-layout {
  display: flex;
  gap: 20px;
  height: 100%;
}

.input-section,
.output-section {
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.input-section {
  width: 40%;
  min-width: 300px;
}

.output-section {
  width: 60%;
  flex: 1;
}

.input-scroll-container {
  overflow-y: auto;
  max-height: calc(70vh - 100px);
  padding-right: 8px;
}

.node-fields {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background-color: var(--el-bg-color);
}

.node-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 8px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.no-inputs {
  padding: 20px 0;
}

.output-content {
  margin-top: 12px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
  overflow-y: auto;
  max-height: calc(70vh - 100px);
  flex: 1;
}

.no-result {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 40px 0;
}

.executing-status {
  text-align: center;
  margin-top: 12px;
  color: var(--el-color-primary);
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}

.result-node-name {
  background-color: var(--el-bg-color-page);
  padding: 8px 12px;
  font-weight: 500;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.result-content {
  padding: 12px;
  background-color: var(--el-bg-color);
  overflow-x: auto;
}

.result-content.has-error {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.result-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.text-display-result {
  padding: 12px 0;
}

.text-display-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--el-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 8px;
}

.text-display-content {
  line-height: 1.6;
}

.text-display-content.markdown-content {
  line-height: 1.6;
}

.text-display-content.markdown-content :deep(p) {
  margin: 8px 0;
}

.text-display-content.markdown-content :deep(h1),
.text-display-content.markdown-content :deep(h2),
.text-display-content.markdown-content :deep(h3) {
  margin: 16px 0 8px 0;
  color: var(--el-text-color-primary);
}

.text-display-content.markdown-content :deep(ul),
.text-display-content.markdown-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.text-display-content.markdown-content :deep(li) {
  margin: 4px 0;
}

.text-display-content.markdown-content :deep(code) {
  background-color: var(--el-fill-color-light);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.text-display-content.markdown-content :deep(pre) {
  background-color: var(--el-fill-color-dark);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.text-display-content.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.text-display-content.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--el-border-color);
  padding-left: 12px;
  margin: 8px 0;
  color: var(--el-text-color-secondary);
}

.text-display-content.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}

.text-display-content.markdown-content :deep(th),
.text-display-content.markdown-content :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
  text-align: left;
}

.text-display-content.markdown-content :deep(th) {
  background-color: var(--el-fill-color-light);
  font-weight: bold;
}

.html-display-result {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background-color: white;
}

.error-content {
  color: var(--el-color-danger);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .split-layout {
    flex-direction: column;
  }

  .input-section,
  .output-section {
    width: 100%;
  }

  .input-scroll-container,
  .output-content {
    max-height: 300px;
  }
}

/* 数组字段样式 */
.array-field-item {
  border-left: 3px solid var(--el-color-primary-light-5);
  padding-left: 10px;
  margin-left: -10px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
}

.array-field-item :deep(.el-form-item__label) {
  display: flex;
  align-items: center;
}

.array-field-item :deep(.el-form-item__label)::after {
  content: '数组元素';
  font-size: 12px;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary-dark-2);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

.upload-demo {
  width: 100%;
}
</style>
