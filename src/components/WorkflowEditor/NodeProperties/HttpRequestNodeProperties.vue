<template>
  <div class="http-request-properties">
    <el-form label-position="top">
      <!-- URL -->
      <el-form-item label="请求URL" required>
        <el-input
          v-model="localData.url.fieldValue"
          placeholder="请输入请求URL，例如: https://api.example.com/data"
          @input="updateNodeData"
        />
        <div class="field-description">HTTP请求的目标URL地址</div>
      </el-form-item>

      <!-- 方法 -->
      <el-form-item label="请求方法" required>
        <el-select
          v-model="localData.method.fieldValue"
          placeholder="请选择请求方法"
          style="width: 100%"
          @change="updateNodeData"
        >
          <el-option v-for="method in httpMethods" :key="method" :label="method" :value="method" />
        </el-select>
        <div class="field-description">HTTP请求方法</div>
      </el-form-item>

      <!-- 请求头 -->
      <el-form-item label="请求头">
        <el-input
          v-model="localData.headers.fieldValue"
          type="textarea"
          :rows="4"
          placeholder='请输入请求头，JSON格式，例如: {"Content-Type": "application/json"}'
          @input="updateNodeData"
        />
        <div class="field-description">HTTP请求头，以JSON格式输入</div>
      </el-form-item>

      <!-- 请求体 -->
      <el-form-item label="请求体">
        <el-input
          v-model="localData.body.fieldValue"
          type="textarea"
          :rows="5"
          placeholder="请输入请求体内容"
          @input="updateNodeData"
        />
        <div class="field-description">HTTP请求体内容</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { FieldType, type NodeProps } from '@/types/node'
import type { HttpRequestNodeData } from '@/types/node'

const props = defineProps<{
  node: NodeProps<HttpRequestNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<HttpRequestNodeData>): void
}>()

// HTTP方法选项
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

// 创建本地响应式数据
const localData = reactive<HttpRequestNodeData>({
  url: {
    fieldName: '请求URL',
    fieldValue: '',
    fieldDesc: 'HTTP请求的URL地址',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  method: {
    fieldName: '请求方法',
    fieldValue: 'GET',
    fieldDesc: 'HTTP请求方法',
    fieldType: FieldType.SELECT,
    list: false,
    options: httpMethods,
    show: true,
    required: true,
  },
  headers: {
    fieldName: '请求头',
    fieldValue: '{}',
    fieldDesc: 'HTTP请求头，JSON格式',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  body: {
    fieldName: '请求体',
    fieldValue: '',
    fieldDesc: 'HTTP请求体',
    fieldType: FieldType.TEXTAREA,
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
.http-request-properties {
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
