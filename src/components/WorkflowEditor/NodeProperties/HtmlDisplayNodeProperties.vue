<template>
  <div class="html-display-properties">
    <el-form label-position="top">
      <el-form-item label="HTML内容">
        <el-input
          v-model="localData.htmlContent.fieldValue"
          type="textarea"
          :rows="8"
          placeholder="请输入HTML内容"
          @input="updateNodeData"
        />
      </el-form-item>

      <el-form-item label="预览">
        <div class="preview-container">
          <iframe class="html-preview" :srcDoc="localData.htmlContent.fieldValue"></iframe>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { type NodeProps, type HtmlDisplayNodeData, FieldType } from '../../../types/node'
import { useWorkflowStore } from '../../../stores/workflow'
import { watch, reactive, onMounted } from 'vue'

const props = defineProps<{
  node: NodeProps<HtmlDisplayNodeData>
}>()
const workflowStore = useWorkflowStore()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<HtmlDisplayNodeData>): void
}>()
// 创建本地响应式数据
const localData = reactive<HtmlDisplayNodeData>({
  htmlContent: {
    fieldValue: '<p>请输入HTML内容</p>',
    fieldDesc: 'HTML内容',
    fieldType: FieldType.TEXTAREA,
    list: false,
    fieldName: 'HTML内容',
    options: [],
    show: true,
    required: true,
  },
})

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    localData.htmlContent = props.node.data?.htmlContent || {
      fieldValue: '<p>请输入HTML内容</p>',
      fieldDesc: 'HTML内容',
      fieldType: FieldType.TEXTAREA,
      list: false,
      fieldName: 'HTML内容',
      options: [],
      show: true,
      required: true,
    }
  }
})

// 更新节点数据
const updateNodeData = () => {
  console.log('更新节点数据', props)
  if (props.node.id) {
    const updatedNode = workflowStore.updateNode(props.node.id, {
      ...localData,
      output: localData.htmlContent?.fieldValue, // 更新输出值
    })
    emit('update:node', updatedNode)
  }
}
// 监听节点数据变化，更新本地数据
watch(
  () => props.node.data,
  (newData) => {
    if (newData) {
      localData.htmlContent = newData.htmlContent || {
        fieldValue: '<p>请输入HTML内容</p>',
        fieldDesc: 'HTML内容',
        fieldType: FieldType.TEXTAREA,
        list: false,
        fieldName: 'HTML内容',
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
.html-display-properties {
  padding: 16px;
}

.preview-container {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  height: 200px;
}

.html-preview {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
