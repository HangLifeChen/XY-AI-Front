<template>
  <div class="custom-node" :class="`node-${data.type}`" :style="{ borderColor: data.color }">
    <div class="node-header" :style="{ backgroundColor: data.color }">
      <el-icon class="node-icon">
        <component :is="data.icon"></component>
      </el-icon>
      <span class="node-label">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <slot></slot>
    </div>
    <div class="node-handles">
      <Handle type="target" position="top" :style="{ background: data.color }" />
      <Handle type="source" position="bottom" :style="{ background: data.color }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle } from '@vue-flow/core'

defineProps<{
  data: {
    label: string
    icon: string
    color: string
    type: string
  }
}>()
</script>

<style scoped>
.custom-node {
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  min-width: 150px;
  font-size: 12px;
  overflow: hidden;
}

.node-header {
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.node-icon {
  font-size: 16px;
}

.node-label {
  font-weight: bold;
}

.node-content {
  padding: 8px;
}

.node-handles {
  position: relative;
}

:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #555;
}

:deep(.vue-flow__handle-top) {
  top: -4px;
}

:deep(.vue-flow__handle-bottom) {
  bottom: -4px;
}
</style>
