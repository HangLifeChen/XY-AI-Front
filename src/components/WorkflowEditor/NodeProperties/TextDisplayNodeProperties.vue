<template>
  <div class="text-display-properties">
    <el-form label-position="top">
      <el-form-item label="标题">
        <el-input
          v-model="localData.title.fieldValue"
          placeholder="请输入标题"
          @input="updateNodeData"
        />
      </el-form-item>

      <el-form-item label="内容">
        <el-input
          v-model="localData.content.fieldValue"
          type="textarea"
          :rows="5"
          placeholder="请输入要显示的文本内容"
          @input="updateNodeData"
        />
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="localData.renderMarkdown.fieldValue" @change="updateNodeData"
          >渲染为Markdown</el-checkbox
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { FieldType, type NodeProps, type TextDisplayNodeData } from '../../../types/node'
import { useWorkflowStore } from '../../../stores/workflow'
import { watch, reactive, onMounted } from 'vue'

const props = defineProps<{
  node: NodeProps<TextDisplayNodeData>
}>()
const workflowStore = useWorkflowStore()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<TextDisplayNodeData>): void
}>()
// 创建本地响应式数据
const localData = reactive<TextDisplayNodeData>({
  title: {
    fieldValue: '文本标题',
    fieldDesc: '标题',
    fieldType: FieldType.DIV,
    list: false,
    fieldName: '标题',
    options: [],
    show: true,
    required: true,
  },
  content: {
    fieldValue: '文本内容',
    fieldDesc: '内容',
    fieldType: FieldType.DIV,
    list: false,
    fieldName: '文本内容',
    options: [],
    show: true,
    required: true,
  },
  renderMarkdown: {
    fieldValue: true,
    fieldDesc: '',
    fieldType: FieldType.VAL,
    list: false,
    fieldName: '是否渲染为Markdown',
    options: [],
    show: true,
    required: true,
  },
})

// 初始化本地数据
onMounted(() => {
  localData.title = props.node.data?.title || {
    fieldValue: '文本标题',
    fieldDesc: '标题',
    fieldType: FieldType.DIV,
    list: false,
    fieldName: '标题',
    options: [],
    show: true,
    required: true,
  }
  localData.content = props.node.data?.content || {
    fieldValue: '文本内容',
    fieldDesc: '内容',
    fieldType: FieldType.DIV,
    list: false,
    fieldName: '文本内容',
    options: [],
    show: true,
    required: true,
  }
  localData.renderMarkdown =
    props.node.data?.renderMarkdown !== undefined
      ? props.node.data?.renderMarkdown
      : {
          fieldValue: true,
          fieldDesc: '',
          fieldType: FieldType.VAL,
          list: false,
          fieldName: '是否渲染为Markdown',
          options: [],
          show: true,
          required: true,
        }
})

// 更新节点数据
const updateNodeData = () => {
  if (props.node.id) {
    const updatedNode = workflowStore.updateNode(props.node.id, {
      ...localData,
      output: localData.content?.fieldValue, // 更新输出值
    })
    emit('update:node', updatedNode)
  }
}
// 监听节点数据变化，更新本地数据
watch(
  () => props.node.data,
  (newData) => {
    console.log('节点数据已更新')
    if (newData) {
      localData.title = newData.title || {
        fieldValue: '文本标题',
        fieldDesc: '标题',
        fieldType: FieldType.DIV,
        list: false,
        fieldName: '标题',
        options: [],
        show: true,
        required: true,
      }
      localData.content = newData.content || {
        fieldValue: '文本内容',
        fieldDesc: '文本内容',
        fieldType: FieldType.DIV,
        list: false,
        fieldName: '文本内容',
        options: [],
        show: true,
        required: true,
      }
      localData.renderMarkdown =
        newData.renderMarkdown !== undefined
          ? newData.renderMarkdown
          : {
              fieldValue: true,
              fieldDesc: '',
              fieldType: FieldType.VAL,
              list: false,
              fieldName: '是否渲染为Markdown',
              options: [],
              show: true,
              required: true,
            }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.text-display-properties {
  padding: 16px;
}
</style>
