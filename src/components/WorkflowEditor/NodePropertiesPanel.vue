<template>
  <div class="properties-panel" :class="{ 'is-visible': localNodeData }">
    <template v-if="localNodeData">
      <div class="panel-header">
        <h3>节点属性</h3>
        <el-button link type="primary" @click="closePanel" class="close-button">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="panel-content">
        <el-form label-position="top" size="small" @submit.prevent>
          <!-- 通用属性 -->
          <el-form-item label="节点ID">
            <el-input v-model="localNodeData.id" disabled />
          </el-form-item>

          <el-form-item label="节点类型">
            <el-tag>{{ localNodeData.type }}</el-tag>
          </el-form-item>

          <el-divider>节点配置</el-divider>

          <!-- 根据节点类型显示特定属性 -->
          <component
            :is="getPropertiesComponent(localNodeData.type || '')"
            v-if="getPropertiesComponent(localNodeData.type || '')"
            :node="localNodeData"
            @update:node="updateNode"
          />

          <!-- 默认属性编辑器 -->
          <template v-else>
            <el-form-item
              v-for="(value, key) in localNodeData.data"
              :key="key"
              :label="formatLabel(key)"
            >
              <template v-if="typeof value === 'boolean'">
                <el-switch
                  :model-value="localNodeData.data[key]"
                  @update:model-value="(val) => updateLocalData(key, val)"
                />
              </template>

              <template v-else-if="typeof value === 'number'">
                <el-input-number
                  :model-value="localNodeData.data[key]"
                  :step="0.1"
                  @update:model-value="(val) => updateLocalData(key, val)"
                />
              </template>

              <template v-else-if="Array.isArray(value)">
                <el-select
                  :model-value="localNodeData.data[key]"
                  multiple
                  @update:model-value="(val) => updateLocalData(key, val)"
                >
                  <el-option v-for="item in value" :key="item" :label="item" :value="item" />
                </el-select>
              </template>

              <template v-else-if="typeof value === 'object' && value !== null">
                <el-input
                  type="textarea"
                  :rows="4"
                  :model-value="JSON.stringify(value, null, 2)"
                  @update:model-value="(val) => updateObjectValue(key, val)"
                />
              </template>

              <template v-else>
                <el-input
                  :model-value="localNodeData.data[key]"
                  @update:model-value="(val) => updateLocalData(key, val)"
                />
              </template>
            </el-form-item>
          </template>
        </el-form>
      </div>

      <div class="panel-footer">
        <el-button type="danger" size="small" @click="deleteNode"> 删除节点 </el-button>
      </div>
    </template>
    <div v-else class="empty-state">
      <el-empty description="请选择一个节点来查看和编辑其属性" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { useWorkflowStore } from '@/stores/workflow'
import type { WorkflowNode } from '@/types/node'
import { ElMessageBox } from 'element-plus'

const workflowStore = useWorkflowStore()

// 获取当前选中的节点
const selectedNode = computed(() => workflowStore.selectedNode)

// 创建本地响应式数据来存储节点数据，避免直接修改计算属性
const localNodeData = ref<WorkflowNode | null>(null)

// 当选中节点变化时，更新本地数据
watch(
  selectedNode,
  (newNode, oldNode) => {
    if (newNode) {
      // 使用深拷贝确保本地数据与原始数据分离
      localNodeData.value = JSON.parse(JSON.stringify(newNode))
    } else {
      localNodeData.value = null
    }
  },
  { immediate: true },
)

import TongyiNodeProperties from './NodeProperties/TongyiNodeProperties.vue'
import TextCombineNodeProperties from './NodeProperties/TextCombineNodeProperties.vue'
import TextDisplayNodeProperties from './NodeProperties/TextDisplayNodeProperties.vue'
import StartNodeProperties from './NodeProperties/StartNodeProperties.vue'
import EndNodeProperties from './NodeProperties/EndNodeProperties.vue'
import ConditionNodeProperties from './NodeProperties/ConditionNodeProperties.vue'
import HttpRequestNodeProperties from './NodeProperties/HttpRequestNodeProperties.vue'
import CodeExecutionNodeProperties from './NodeProperties/CodeExecutionNodeProperties.vue'
import LoopNodeProperties from './NodeProperties/LoopNodeProperties.vue'
import OllamaNodeProperties from './NodeProperties/OllamaNodeProperties.vue'
import HtmlDisplayNodeProperties from './NodeProperties/HtmlDisplayNodeProperties.vue'
import A2ATaskNodeProperties from './NodeProperties/A2ATaskNodeProperties.vue'
import CallAgentNodeProperties from './NodeProperties/CallAgentNodeProperties.vue'

// 根据节点类型获取对应的属性编辑组件
const getPropertiesComponent = (type: string) => {
  const components: { [key: string]: any } = {
    tongyi: TongyiNodeProperties,
    textCombine: TextCombineNodeProperties,
    textDisplay: TextDisplayNodeProperties,
    start: StartNodeProperties,
    end: EndNodeProperties,
    condition: ConditionNodeProperties,
    httpRequest: HttpRequestNodeProperties,
    codeExecution: CodeExecutionNodeProperties,
    loop: LoopNodeProperties,
    ollama: OllamaNodeProperties,
    crawler: CrawlerNodeProperties,
    htmlDisplay: HtmlDisplayNodeProperties,
    qwenVL: QwenVLNodeProperties,
    a2aTask: A2ATaskNodeProperties,
    callAgent: CallAgentNodeProperties,
    file: FileNodeProperties,
    trigger: TriggerNodeProperties,
    database: DatabaseNodeProperties,
  }
  return components[type]
}

// 格式化属性标签
const formatLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

import { ElMessage } from 'element-plus'
import { h } from 'vue'
import CrawlerNodeProperties from './NodeProperties/CrawlerNodeProperties.vue'
import QwenVLNodeProperties from './NodeProperties/QwenVLNodeProperties.vue'
import FileNodeProperties from './NodeProperties/FileNodeProperties.vue'
import TriggerNodeProperties from './NodeProperties/TriggerNodeProperties.vue'
import DatabaseNodeProperties from './NodeProperties/DatabaseNodeProperties.vue'

// 更新节点数据
const updateNode = (updatedNode?: WorkflowNode) => {
  if (localNodeData.value) {
    console.log('NodePropertiesPanel updateNode called with:', updatedNode)

    if (updatedNode) {
      // 如果子组件提供了完整的节点数据，使用它
      const nodeData = JSON.parse(JSON.stringify(updatedNode.data))
      // 更新本地数据
      localNodeData.value.data = nodeData
      // 更新 store
      workflowStore.updateNode(updatedNode.id, nodeData)
    } else {
      // 否则使用当前本地节点的数据
      const nodeData = JSON.parse(JSON.stringify(localNodeData.value.data))
      workflowStore.updateNode(localNodeData.value.id, nodeData)
    }

    // 提供视觉反馈
    ElMessage.success({
      message: '节点更新成功',
      duration: 1000,
    })
  }
}

// 更新对象类型的值
const updateObjectValue = (key: string, value: string) => {
  if (localNodeData.value) {
    try {
      const parsedValue = JSON.parse(value)
      // 更新本地数据
      localNodeData.value.data = {
        ...localNodeData.value.data,
        [key]: parsedValue,
      }
      // 同步到 store
      saveChanges()
    } catch (error) {
      console.error('Invalid JSON:', error)
      ElMessage.error({
        message: 'JSON 格式无效',
        duration: 2000,
      })
    }
  }
}

// 更新本地数据字段
const updateLocalData = (key: string, value: any) => {
  if (localNodeData.value) {
    // 更新本地数据
    localNodeData.value.data = {
      ...localNodeData.value.data,
      [key]: value,
    }
    // 同步到 store
    saveChanges()
  }
}

// 更新本地样式
const updateLocalStyle = (key: string, value: any) => {
  if (localNodeData.value) {
    // 更新本地样式
    localNodeData.value.style = {
      ...localNodeData.value.style,
      [key]: value,
    }
    // 同步到 store
    saveChanges()
  }
}

// 保存更改到 store
const saveChanges = () => {
  if (localNodeData.value) {
    // 更新节点数据
    workflowStore.updateNode(
      localNodeData.value.id,
      JSON.parse(JSON.stringify(localNodeData.value.data)),
    )
    // 更新节点样式
    workflowStore.updateNodeStyle(
      localNodeData.value.id,
      JSON.parse(JSON.stringify(localNodeData.value.style)),
    )
  }
}

// 更新节点样式
const updateNodeStyle = () => {
  if (localNodeData.value) {
    workflowStore.updateNodeStyle(
      localNodeData.value.id,
      JSON.parse(JSON.stringify(localNodeData.value.style)),
    )
  }
}

// 删除节点
const deleteNode = () => {
  if (!selectedNode.value) return

  ElMessageBox.confirm('确定要删除这个节点吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    if (selectedNode.value) {
      workflowStore.deleteNode(selectedNode.value.id)
      closePanel()
    }
  })
}

// 关闭面板
const closePanel = () => {
  workflowStore.setSelectedNode(null)
}

// 保存并关闭
const saveAndClose = () => {
  if (localNodeData.value) {
    // 保存本地数据到 store
    saveChanges()
  }
  closePanel()
}

const renderProperties = () => {
  if (!selectedNode.value) return null

  const nodeType = selectedNode.value.type
  const nodeProps = {
    node: selectedNode.value,
    onUpdateNode: handleNodeUpdate,
  }

  switch (nodeType) {
    case 'start':
      return h(StartNodeProperties, nodeProps)
    case 'end':
      return h(EndNodeProperties, nodeProps)
    case 'condition':
      return h(ConditionNodeProperties, nodeProps)
    case 'textCombine':
      return h(TextCombineNodeProperties, nodeProps)
    case 'tongyi':
      return h(TongyiNodeProperties, nodeProps)
    case 'textDisplay':
      return h(TextDisplayNodeProperties, nodeProps)
    case 'httpRequest':
      return h(HttpRequestNodeProperties, nodeProps)
    case 'codeExecution':
      return h(CodeExecutionNodeProperties, nodeProps)
    case 'loop':
      return h(LoopNodeProperties, nodeProps)
    case 'ollama':
      return h(OllamaNodeProperties, nodeProps)
    case 'htmlDisplay':
      return h(HtmlDisplayNodeProperties, nodeProps)
    default:
      return h('div', { class: 'no-properties' }, '未找到属性面板')
  }
}

// 暴露方法给父组件
defineExpose({
  onNodeClick: (node: WorkflowNode) => {
    // 确保节点有样式属性
    // const nodeWithStyle = {
    //   ...node,
    //   style: node.style || {
    //     background: '#fff',
    //     borderColor: '#ddd',
    //     color: '#333',
    //     borderWidth: 1,
    //     borderRadius: 4,
    //   },
    // }
    // 设置选中节点，watch 会自动更新 localNodeData
    workflowStore.setSelectedNode(node)
  },
})
</script>

<style scoped>
.properties-panel {
  position: absolute;
  top: 75px;
  right: 0;
  bottom: 55px;
  width: 300px;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 100;
  flex-direction: column;
  display: none;
  overflow-y: auto;
}

.properties-panel.is-visible {
  display: flex;
  transform: translateX(0);
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.close-button {
  padding: 4px;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  line-height: 1;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-tag) {
  text-transform: capitalize;
}

.el-divider {
  margin: 16px 0;
}

:deep(.el-divider__text) {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
