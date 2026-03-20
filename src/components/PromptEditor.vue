<template>
  <div class="prompt-editor">
    <div class="editor-header">
      <h3>提示词编辑器</h3>
      <div class="variables">
        <el-button
          v-for="varName in availableVariables"
          :key="varName"
          size="small"
          @click="insertVariable(varName)"
        >
          {{ varName }}
        </el-button>
      </div>
    </div>

    <div class="editor-container">
      <textarea
        ref="editor"
        :value="modelValue"
        class="editor-textarea"
        placeholder="输入智能体提示词..."
        @input="handleInput"
      ></textarea>
      <pre class="editor-highlight" v-html="highlightedText"></pre>
    </div>

    <div class="editor-footer">
      <span class="char-count">{{ modelValue.length }} 字符</span>
      <el-button type="primary" size="small" @click="handleSave"> 保存 </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { highlight } from '@/utils/promptHighlighter'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const editor = ref<HTMLTextAreaElement | null>(null)
const availableVariables = ref(['{user}', '{date}', '{time}'])

const highlightedText = computed(() => {
  return highlight(props.modelValue)
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const insertVariable = (varName: string) => {
  const textarea = editor.value
  if (!textarea) return

  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const currentValue = props.modelValue

  const newValue = currentValue.substring(0, startPos) + varName + currentValue.substring(endPos)

  emit('update:modelValue', newValue)

  // 移动光标到插入的变量后
  nextTick(() => {
    textarea.selectionStart = startPos + varName.length
    textarea.selectionEnd = startPos + varName.length
    textarea.focus()
  })
}

const handleSave = () => {
  emit('save', props.modelValue)
}

// 同步滚动
onMounted(() => {
  const textarea = editor.value
  const highlightPre = document.querySelector('.editor-highlight')

  if (textarea && highlightPre) {
    textarea.addEventListener('scroll', () => {
      highlightPre.scrollTop = textarea.scrollTop
      highlightPre.scrollLeft = textarea.scrollLeft
    })
  }
})
</script>

<style scoped>
.prompt-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.editor-container {
  position: relative;
  height: 300px;
}

.editor-textarea,
.editor-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  tab-size: 2;
  white-space: pre-wrap;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: transparent;
}

.editor-textarea {
  z-index: 1;
  color: transparent;
  caret-color: #333;
  resize: none;
}

.editor-highlight {
  z-index: 0;
  pointer-events: none;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.char-count {
  font-size: 12px;
  color: #909399;
}

.variables {
  display: flex;
  gap: 5px;
}
</style>
