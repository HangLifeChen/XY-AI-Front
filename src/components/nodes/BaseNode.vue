<template>
  <div
    :class="['workflow-node', `node-type-${nodeType.toLowerCase()}`, { selected: selected }]"
    @click="$emit('select', id)"
  >
    <div class="node-header" :style="{ backgroundColor: nodeColor }">
      <div class="node-icon" v-if="icon">
        <component :is="icon" />
      </div>
      <div class="node-title">{{ title }}</div>
      <div class="node-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="node-content">
      <slot></slot>
    </div>

    <div class="node-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>

    <!-- 输入连接点 -->
    <template v-for="(handle, index) in inputHandles" :key="`input-${handle}`">
      <div
        :class="['node-handle', 'node-input-handle', `handle-${handle}`]"
        :data-handle-id="handle"
        :data-handle-type="'target'"
      ></div>
    </template>

    <!-- 输出连接点 -->
    <template v-for="(handle, index) in outputHandles" :key="`output-${handle}`">
      <div
        :class="['node-handle', 'node-output-handle', `handle-${handle}`]"
        :data-handle-id="handle"
        :data-handle-type="'source'"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NodeTypes, getNodeColor } from '../../constants/nodeTypes'
import { getNodeHandles } from '../../utils/nodeFactory'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  nodeType: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: Object,
    default: null,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['select'])

// 计算节点颜色
const nodeColor = computed(() => {
  return getNodeColor(props.nodeType as keyof typeof NodeTypes)
})

// 获取节点的输入输出连接点
const { inputs: inputHandles, outputs: outputHandles } = getNodeHandles(
  props.nodeType as keyof typeof NodeTypes,
)
</script>

<style scoped>
.workflow-node {
  position: relative;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  max-width: 300px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.workflow-node.selected {
  border-color: #2196f3;
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: white;
  font-weight: 500;
}

.node-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.node-title {
  flex-grow: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-actions {
  display: flex;
  align-items: center;
}

.node-content {
  padding: 12px;
  font-size: 12px;
}

.node-footer {
  padding: 8px 12px;
  border-top: 1px solid #eee;
  font-size: 12px;
}

.node-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #fff;
  border: 2px solid #555;
  border-radius: 50%;
  cursor: crosshair;
}

.node-input-handle {
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
}

.node-output-handle {
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
}

/* 特殊连接点位置 */
.handle-input {
  top: 50%;
  left: -6px;
}

.handle-output {
  top: 50%;
  right: -6px;
}

.handle-true {
  top: 40%;
  right: -6px;
}

.handle-false {
  top: 60%;
  right: -6px;
}

.handle-body {
  top: 40%;
  right: -6px;
}

.handle-exit {
  top: 60%;
  right: -6px;
}

/* 节点类型特定样式 */
.node-type-input .node-header {
  background-color: #4caf50;
}

.node-type-output .node-header {
  background-color: #f44336;
}

.node-type-condition .node-header {
  background-color: #ff9800;
}

.node-type-loop .node-header {
  background-color: #9c27b0;
}

.node-type-agent .node-header {
  background-color: #2196f3;
}

.node-type-task .node-header {
  background-color: #607d8b;
}
</style>
