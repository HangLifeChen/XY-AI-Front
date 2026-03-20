<template>
  <div class="milkdown-editor-wrapper">
    <div ref="containerRef" class="milkdown-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { nord } from '@milkdown/theme-nord'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { replaceAll, getMarkdown } from '@milkdown/utils'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
let editor = null
let isExternalUpdate = false
let lastEmittedValue = ''

// 初始化编辑器
const initEditor = async () => {
  if (!containerRef.value) return

  editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, containerRef.value)
      ctx.set(defaultValueCtx, props.modelValue || '')
      
      // 添加内容变化监听器
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
        // 防止循环更新
        if (!isExternalUpdate && markdown !== lastEmittedValue) {
          lastEmittedValue = markdown
          emit('update:modelValue', markdown)
        }
      })
    })
    .use(nord)
    .use(commonmark)
    .use(gfm)
    .use(listener)

  await editor.create()
  // 记录初始值
  if (editor) {
    lastEmittedValue = editor.action(getMarkdown())
  }
}

onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.destroy()
  }
})

// 监听外部值变化并更新编辑器
watch(
  () => props.modelValue,
  (newVal) => {
    if (editor && newVal !== lastEmittedValue) {
      isExternalUpdate = true
      editor.action(replaceAll(newVal || ''))
      // 使用setTimeout确保在下一个事件循环重置标志
      setTimeout(() => {
        isExternalUpdate = false
      }, 0)
    }
  }
)
</script>

<style scoped>
.milkdown-editor-wrapper {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  width: 100%;
  height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.milkdown-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  flex: 1;
}
.milkdown-container :deep(.milkdown) {
  width: 100%;
  height: 100%;
}

.milkdown-container :deep(.ProseMirror) {
  width: 100%;
  min-height: 100%;
  height: auto;
  padding: 16px;
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
}

.milkdown-container :deep(.ProseMirror:focus) {
  outline: none;
}

/* ProseMirror推荐样式 */
.milkdown-container :deep(.ProseMirror-hideselection) {
  caret-color: transparent;
}

.milkdown-container :deep(.ProseMirror-hideselection selection) {
  background: transparent;
}

.milkdown-container :deep(.ProseMirror-hideselection *::selection) {
  background: transparent;
}

.milkdown-container :deep(.ProseMirror-selectednode) {
  outline: 2px solid #8cf;
}

.milkdown-container :deep(.ProseMirror-textblock) {
  margin: 0;
}

/* 确保编辑器内容区域填充整个容器 */

/* 添加一个空节点的样式，确保即使在没有内容时也能点击编辑 */
.milkdown-container :deep(.ProseMirror > *:first-child:last-child:empty)::before {
  content: attr(data-placeholder);
  color: #adb5bd;
  pointer-events: none;
}
</style>
