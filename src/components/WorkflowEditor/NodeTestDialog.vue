<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`测试节点: ${node?.data.label || '未知节点'}`"
    width="600px"
    :before-close="handleDialogClose"
  >
    <div class="node-test-dialog">
      <!-- 通用数组字段处理 -->
      <div v-if="node && hasArrayFields(node.data)">
        <el-form :model="formData" label-position="top" ref="nodeTestFormRef">
          <el-form-item
            v-for="(field, fieldName) in node.data"
            :key="fieldName"
            :label="field.fieldName"
            v-show="field.show !== false"
          >
            <div v-if="isFieldDataArray(field)">
              <div v-for="(item, index) in formData[fieldName]" :key="index" class="array-item">
                <div class="variable-input-group">
                  <el-input v-model="item.fieldName" placeholder="字段名" style="width: 40%" />
                  <el-input v-model="item.fieldValue" placeholder="字段值" style="width: 40%; margin-left: 10px" />
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    circle
                    @click="removeArrayItem(fieldName, index)"
                    style="margin-left: 10px;"
                  />
                </div>
              </div>
              <el-button type="primary" link @click="addArrayItem(fieldName)" style="margin-top: 10px">
                + 添加{{ field.fieldName }}
              </el-button>
            </div>
            <el-input
              v-else-if="field.fieldType === FieldType.TEXT || field.fieldType === FieldType.DIV"
              v-model="formData[fieldName]"
              :placeholder="field.fieldDesc"
            />
            <el-input
              v-else-if="field.fieldType === FieldType.TEXTAREA"
              v-model="formData[fieldName]"
              type="textarea"
              :rows="3"
              :placeholder="field.fieldDesc"
            />
            <el-input-number
              v-else-if="field.fieldType === FieldType.INPUT_NUMBER"
              v-model="formData[fieldName]"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
            <el-switch
              v-else-if="field.fieldType === FieldType.SWITCH"
              v-model="formData[fieldName]"
            />
            <el-select
              v-else-if="field.fieldType === FieldType.SELECT && fieldName === 'providers'"
              v-model="formData[fieldName]"
              style="width: 100%"
              :loading="providerLoading"
              value-key="id"
            >
              <el-option
                v-for="provider in providerOptions"
                :key="provider.value.id"
                :label="provider.label"
                :value="provider.value"
              />
            </el-select>
            <el-select
              v-else-if="field.fieldType === FieldType.SELECT"
              v-model="formData[fieldName]"
              style="width: 100%"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <!-- 其他多选情况 -->
            <el-select
              v-else-if="field.fieldType === FieldType.MULTI_SELECT"
              v-model="formData[fieldName]"
              multiple
              style="width: 100%"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <!-- 文件上传 -->
            <div v-else-if="field.fieldType === FieldType.UPLOAD" class="upload-field">
              <el-input
                v-model="formData[fieldName]"
                :placeholder="field.fieldDesc || '请输入文件URL或上传文件'"
                type="danger"
              />
              <el-upload
                class="upload-demo"
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="(file) => handleFileUpload(fieldName, file)"
              >
                <el-button size="small" type="primary" style="margin-top: 8px"> 点击上传 </el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 其他节点类型保持原有逻辑，但排除已由通用数组处理的节点 -->
      <el-form v-else-if="node && !hasArrayFields(node.data)" :model="formData" label-position="top" ref="nodeTestFormRef">
        <el-form-item
          v-for="(field, fieldName) in node.data"
          :key="fieldName"
          :label="field.fieldName"
          v-show="field.show !== false"
        >
          <el-input
            v-if="field.fieldType === FieldType.TEXT || field.fieldType === FieldType.DIV"
            v-model="formData[fieldName]"
            :placeholder="field.fieldDesc"
          />
          <el-input
            v-else-if="field.fieldType === FieldType.TEXTAREA"
            v-model="formData[fieldName]"
            type="textarea"
            :rows="3"
            :placeholder="field.fieldDesc"
          />
          <el-input-number
            v-else-if="field.fieldType === FieldType.INPUT_NUMBER"
            v-model="formData[fieldName]"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
          <el-switch
            v-else-if="field.fieldType === FieldType.SWITCH"
            v-model="formData[fieldName]"
          />
          <el-select
            v-else-if="field.fieldType === FieldType.SELECT && fieldName === 'providers'"
            v-model="formData[fieldName]"
            style="width: 100%"
            :loading="providerLoading"
            value-key="id"
          >
            <el-option
              v-for="provider in providerOptions"
              :key="provider.value.id"
              :label="provider.label"
              :value="provider.value"
            />
          </el-select>
          <el-select
            v-else-if="field.fieldType === FieldType.SELECT"
            v-model="formData[fieldName]"
            style="width: 100%"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <!-- 其他多选情况 -->
          <el-select
            v-else-if="field.fieldType === FieldType.MULTI_SELECT"
            v-model="formData[fieldName]"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <!-- 文件上传 -->
          <div v-else-if="field.fieldType === FieldType.UPLOAD" class="upload-field">
            <el-input
              v-model="formData[fieldName]"
              :placeholder="field.fieldDesc || '请输入文件URL或上传文件'"
              type="danger"
            />
            <el-upload
              class="upload-demo"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file) => handleFileUpload(fieldName, file)"
            >
              <el-button size="small" type="primary" style="margin-top: 8px"> 点击上传 </el-button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>

      <div v-if="result || htmlContent" class="test-result">
        <h4>测试结果:</h4>
        <!-- HTML显示节点特殊处理 -->
        <div v-if="resultType === 'htmlDisplay'" class="html-result" v-html="htmlContent"></div>
        <div v-if="resultType === 'qwenVL'" class="html-result" v-html="htmlContent"></div>

        <!-- 其他类型结果保持原有显示方式 -->
        <pre v-else>{{ result }}</pre>
      </div>
      <div v-if="error" class="test-error">
        <el-alert :title="error" type="error" />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="executeNodeTest" :loading="loading" :disabled="!node">
          执行测试
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FieldType, type WorkflowNode } from '@/types/node'
import { testNode as apiTestNode } from '@/api/nodeService'
import { ModelService } from '@/api/modelService'
import type { ProviderConfig } from '@/types/model'
import { FileStorageService } from '@/api/cloudStorageService'
import type { StorageFileUploadRequest } from '@/types/cloudStorage'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  node: {
    type: Object as () => WorkflowNode | null,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'update:node'])

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// 表单数据
const formData = ref<Record<string, any>>({})
const result = ref<any>(null)
const resultType = ref<string | null>(null)
const htmlContent = ref<string>('')
const error = ref<string | null>(null)
const loading = ref(false)
const nodeTestFormRef = ref()

// 厂商配置相关
const providerOptions = ref<Array<{ label: string; value: any }>>([])
const providerLoading = ref(false)

// 处理文件上传
const handleFileUpload = async (fieldName: string, file: any) => {
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
    formData.value[fieldName] = response.url
    ElMessage.success('文件上传成功')
  } catch (error: any) {
    ElMessage.error('文件上传失败: ' + (error.message || '未知错误'))
  }
  return false // 阻止自动上传
}

// 获取厂商配置列表
const fetchProviderConfigs = async () => {
  providerLoading.value = true
  try {
    const response = await ModelService.listProviderConfigs()
    providerOptions.value = response.providerConfigs.map((config: ProviderConfig) => ({
      label: config.name,
      value: config,
    }))
    console.log('Provider configs:', providerOptions.value)
  } catch (err: any) {
    ElMessage.error('获取厂商配置列表失败: ' + (err.message || '未知错误'))
  } finally {
    providerLoading.value = false
  }
}

// 监听节点变化，初始化表单数据
watch(
  () => props.node,
  (newNode) => {
    if (newNode) {
      initializeFormData(newNode)
      // 如果节点包含providers字段，加载厂商配置
      if (newNode.data && newNode.data.providers) {
        fetchProviderConfigs()
      }
    }
  },
  { immediate: true },
)

// 监听对话框可见性变化，当对话框关闭时清除结果
watch(
  () => props.visible,
  (newVisible) => {
    if (!newVisible) {
      // 清除测试结果
      result.value = null
      resultType.value = null
      htmlContent.value = ''
      error.value = null
      loading.value = false
    }
  },
)

// 初始化表单数据
const initializeFormData = (node: WorkflowNode) => {
  const data: Record<string, any> = {}

  Object.entries(node.data).forEach(([key, field]: [string, any]) => {
    // 检查字段是否为 FieldData 数组
    if (Array.isArray(field) && field.length > 0 && field.every((item: any) => item && typeof item === 'object' && 'fieldName' in item && 'fieldValue' in item)) {
      // 对于数组字段，复制整个数组
      data[key] = field.map((item: any) => ({
        ...item,
        fieldValue: item.fieldValue || '',
      }))
    } else if (field && typeof field === 'object' && 'fieldValue' in field) {
      // 对于普通 FieldData 类型字段
      data[key] = field.fieldValue !== undefined ? field.fieldValue : ''

      // 特殊处理多选字段
      if (field.fieldType === 'multiSelect' && Array.isArray(field.fieldValue)) {
        data[key] = [...field.fieldValue]
      }
    }
  })

  formData.value = data
}

// 检查节点数据是否包含数组类型的字段
const hasArrayFields = (nodeData: any): boolean => {
  if (!nodeData) return false
  
  return Object.values(nodeData).some(field => {
    return Array.isArray(field) || (field && typeof field === 'object' && field.list === true)
  })
}

// 判断字段是否为 FieldData 数组
const isFieldDataArray = (field: any): boolean => {
  return Array.isArray(field) && 
         field.length > 0 && 
         field.every(item => item && typeof item === 'object' && 'fieldName' in item && 'fieldValue' in item)
}

// 添加数组项
const addArrayItem = (fieldName: string) => {
  if (props.node?.data && props.node.data[fieldName]) {
    const field = props.node.data[fieldName]
    
    // 根据字段类型确定默认值
    const newItem = {
      fieldType: field.fieldType || 'input',
      fieldName: `${field.fieldName || '字段'}${formData.value[fieldName].length + 1}`,
      fieldDesc: `${field.fieldName || '字段'} ${formData.value[fieldName].length + 1}`,
      fieldValue: '',
      options: field.options || [],
      show: field.show !== undefined ? field.show : true,
      list: field.list !== undefined ? field.list : false,
      required: field.required !== undefined ? field.required : false,
    }
    
    formData.value[fieldName].push(newItem)
  }
}

// 删除数组项
const removeArrayItem = (fieldName: string, index: number) => {
  if (props.node?.data && formData.value[fieldName]) {
    formData.value[fieldName].splice(index, 1)
  }
}

// 执行节点测试
const executeNodeTest = async () => {
  if (!props.node) return

  loading.value = true
  result.value = null
  resultType.value = null
  htmlContent.value = ''
  error.value = null

  try {
    // 构造测试请求参数
    let request

    // 检查是否有数组类型的字段
    const hasArrayField = Object.values(props.node!.data).some(field => {
      return Array.isArray(field) || (field && typeof field === 'object' && field.list === true)
    })
    
    // 如果有数组类型的字段，进行特殊处理
    if (hasArrayField) {
      // 构造符合原始结构的nodeData
      const nodeData: Record<string, any> = {}
      Object.entries(props.node!.data).forEach(([key, field]: [string, any]) => {
        if (isFieldDataArray(field)) {
          // 对于数组字段，使用更新后的值
          nodeData[key] = formData.value[key]
        } else {
          // 对于非数组字段，按照 FieldData 结构组织数据
          nodeData[key] = {
            fieldType: field?.fieldType || 'input',
            fieldName: field?.fieldName || key,
            fieldDesc: field?.fieldDesc || key,
            fieldValue: formData.value[key],
            options: field?.options || [],
            show: field?.show !== undefined ? field.show : true,
            list: field?.list !== undefined ? field.list : false,
            required: field?.required !== undefined ? field.required : false,
          }
        }
      })

      // inputData按照map[string]string结构传递
      const inputData: Record<string, string> = {}
      Object.entries(formData.value).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // 对于数组字段，将其中的每个元素的fieldName作为key，fieldValue作为value
          value.forEach((item: any) => {
            if (item && typeof item === 'object' && 'fieldName' in item && 'fieldValue' in item) {
              inputData[item.fieldName] = item.fieldValue || ''
            }
          })
        } else {
          // 对于非数组字段，直接使用key-value
          inputData[key] = value
        }
      })

      request = {
        nodeType: props.node!.type || '',
        nodeData: nodeData,
        inputData: inputData,
      }
    } else {
      // 其他节点类型的通用处理
      const nodeData: Record<string, any> = {}
      Object.entries(formData.value).forEach(([key, value]) => {
        // 按照 FieldData 结构组织数据
        const originalField = props.node!.data[key]
        nodeData[key] = {
          fieldType: originalField?.fieldType || 'input',
          fieldName: key,
          fieldDesc: originalField?.fieldDesc || key,
          fieldValue: value,
          options: originalField?.options || [],
          show: originalField?.show !== undefined ? originalField.show : true,
          list: originalField?.list !== undefined ? originalField.list : false,
          required: originalField?.required !== undefined ? originalField.required : false,
        }
      })

      request = {
        nodeType: props.node!.type || '',
        nodeData: nodeData,
        inputData: formData.value, // 将表单数据作为输入数据传递
      }
    }

    // 调用后端API测试节点
    const response = await apiTestNode(request)

    if (response.success) {
      const resultOutput = response.output
      const resultNodeType = response.output.type
      // 判断输出类型并处理
      if (resultOutput.output && resultNodeType) {
        resultType.value = resultNodeType
        if (resultNodeType === 'htmlDisplay' && resultOutput.output) {
          htmlContent.value = resultOutput.output.htmlContent
        } else if (resultNodeType === 'qwenVL' && resultOutput.output) {
          // 提取 Markdown 代码块中的 HTML 内容
          htmlContent.value = extractHtmlFromMarkdown(resultOutput.output)
        } else {
          result.value = JSON.stringify(response.output, null, 2)
        }
      } else {
        result.value = JSON.stringify(response.output, null, 2)
      }
      ElMessage.success('节点测试执行成功')
    } else {
      throw new Error(response.error || '节点测试执行失败')
    }
  } catch (err: any) {
    error.value = err.message || '测试执行失败'
    ElMessage.error('节点测试执行失败: ' + (err.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 从 Markdown 代码块中提取 HTML 内容
const extractHtmlFromMarkdown = (markdown: string): string => {
  // 匹配 Markdown 代码块的正则表达式
  const codeBlockRegex = /```(?:html)?([\s\S]*?)```/
  const match = markdown.match(codeBlockRegex)

  // 如果找到代码块，返回其中的内容，否则返回原始内容
  return match ? match[1].trim() : markdown
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
}

// 处理对话框关闭
const handleDialogClose = (done: () => void) => {
  ElMessageBox.confirm('确定要关闭测试窗口吗？未保存的测试结果将会丢失', '确认关闭', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 清除测试结果
      result.value = null
      resultType.value = null
      htmlContent.value = ''
      error.value = null
      loading.value = false
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}
</script>

<style scoped>
.node-test-dialog {
  max-height: 70vh;
  overflow-y: auto;
}

.test-result {
  max-height: 300px;
  overflow: auto;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  margin-top: 15px;
}

.test-result pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
}

.html-result {
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: white;
}

.test-error {
  margin-top: 15px;
}

.variable-item {
  margin-bottom: 10px;
}

.upload-field {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

.variable-input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
