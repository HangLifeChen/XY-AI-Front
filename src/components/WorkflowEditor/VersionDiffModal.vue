<template>
  <div class="version-diff-modal">
    <div class="modal-overlay" @click.self="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>版本差异比较</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="icon-close"></i>
        </button>
      </div>

      <div class="diff-controls">
        <div class="version-selectors">
          <select v-model="viewMode" class="mode-select">
            <option value="side-by-side">并排比较</option>
            <option value="inline">行内比较</option>
          </select>
        </div>
      </div>

      <div class="diff-container" :class="viewMode">
        <div class="diff-panel">
          <div class="panel-header">
            <span class="version-label">当前版本 (v{{ current.version }})</span>
          </div>
          <div class="panel-content">
            <pre>{{ formattedCurrent }}</pre>
          </div>
        </div>
        <div class="diff-panel">
          <div class="panel-header">
            <span class="version-label">历史版本 (v{{ version.number }})</span>
          </div>
          <div class="panel-content">
            <pre>{{ formattedVersion }}</pre>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { diffWords } from 'diff'

const props = defineProps({
  current: {
    type: Object,
    required: true,
  },
  version: {
    type: Object,
    required: true,
  },
})

const viewMode = ref('side-by-side')

const formattedCurrent = computed(() => {
  return JSON.stringify(props.current, null, 2)
})

const formattedVersion = computed(() => {
  return JSON.stringify(props.version, null, 2)
})

// 更精细的差异比较函数
const computeDiff = () => {
  const currentStr = JSON.stringify(props.current, null, 2)
  const versionStr = JSON.stringify(props.version, null, 2)
  return diffWords(versionStr, currentStr)
}
</script>

<style scoped>
.version-diff-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #999;
}

.diff-controls {
  padding: 12px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.diff-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.diff-container.side-by-side {
  flex-direction: row;
}

.diff-container.inline {
  flex-direction: column;
}

.diff-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #f0f0f0;
}

.diff-panel:last-child {
  border-right: none;
}

.panel-header {
  padding: 8px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  font-family: monospace;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 12px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  background: #cc1616;
  color: white;
  border: none;
  cursor: pointer;
}

.mode-select {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

.version-label {
  font-weight: bold;
}
</style>
