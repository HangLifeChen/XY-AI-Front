<template>
  <div v-html="finalOutput"></div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  speed: {
    type: Number,
    default: 30,
  },
  // isStreaming 仍然很重要，告诉我们流是否结束
  isStreaming: {
    type: Boolean,
    default: false,
  },
  thinking: {
    type: Boolean,
    default: false,
  },
  // 是否为思考内容
  isThinking: {
    type: Boolean,
    default: false,
  },
  // 是否立即显示全部内容（跳过打字效果）
  immediate: {
    type: Boolean,
    default: false,
  },
  // 渲染为HTML
  renderHtml: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['typing-complete'])

// --- State Management ---
// textToTypeQueue: 仍然是等待被打出的字符队列
const textToTypeQueue = ref('')
// fullTextBuffer: 存储到目前为止收到的所有纯文本
const fullTextBuffer = ref('')
// animationFrameId & lastTime for animation control
let animationFrameId = null
let lastTime = 0

// --- Computed Property for Display ---
const finalOutput = computed(() => {
  // 如果设置了立即显示，则直接显示完整内容
  if (props.immediate) {
    const textToParse = props.text
    if (props.renderHtml) {
      const parsedContent = marked.parse(textToParse, { gfm: true, breaks: true })
      return DOMPurify.sanitize(parsedContent, {})
    } else {
      return textToParse
    }
  }

  const cursor = props.isStreaming && animationFrameId ? ' ▍' : ''
  const textToParse = fullTextBuffer.value + cursor
  
  if (props.renderHtml) {
    const parsedContent = marked.parse(textToParse, { gfm: true, breaks: true })
    return DOMPurify.sanitize(parsedContent, {})
  } else {
    return textToParse
  }
})

// --- Core Typing Logic ---
const type = (currentTime) => {
  if (!lastTime) lastTime = currentTime

  const deltaTime = currentTime - lastTime
  
  // 根据内容类型调整打字速度
  const effectiveSpeed = props.isThinking ? props.speed / 2 : props.speed

  if (deltaTime > effectiveSpeed) {
    lastTime = currentTime

    if (textToTypeQueue.value.length > 0) {
      // 从队列取出一个字符
      const char = textToTypeQueue.value.charAt(0)
      textToTypeQueue.value = textToTypeQueue.value.substring(1)

      // 将字符添加到纯文本缓冲区
      fullTextBuffer.value += char

      //  【核心逻辑】: 如果这个字符是换行符，或者队列已经空了（流暂停），
      //  我们不需要做什么特别的事，因为 computed property `finalOutput`
      //  会自动重新计算并触发渲染。这种响应式的方式更符合 Vue 的设计。
    }
  }

  // 如果队列中还有字符，继续下一帧动画
  if (textToTypeQueue.value.length > 0) {
    animationFrameId = requestAnimationFrame(type)
  } else {
    // 队列为空，动画暂停（但流可能还没结束）
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
    
    // 如果流已经结束，发出打字完成事件
    if (!props.isStreaming) {
      emit('typing-complete')
    }
  }
}

// --- Watcher ---
watch(
  () => props.text,
  (newText, oldText) => {
    // 如果设置了立即显示，则直接设置完整内容并跳过打字效果
    if (props.immediate) {
      fullTextBuffer.value = newText
      // 发出打字完成事件
      emit('typing-complete')
      return
    }
    
    oldText = oldText || ''
    // 我们只关心新增的文本
    const diff = newText.length > oldText.length ? newText.slice(oldText.length) : ''

    if (diff) {
      // 将新增的文本块加入待打字队列
      textToTypeQueue.value += diff
    }

    // 如果动画当前未运行，并且有东西要打，则启动它
    if (!animationFrameId && textToTypeQueue.value.length > 0) {
      lastTime = 0
      animationFrameId = requestAnimationFrame(type)
    }
  },
  {
    immediate: true,
  },
)

// 如果流结束了，确保最后一次渲染是完美的
watch(
  () => props.isStreaming,
  (isStreaming) => {
    if (!isStreaming) {
      // 确保最终文本缓冲区与 props.text 完全一致
      fullTextBuffer.value = props.text
      // 如果动画仍在运行，停止它
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      // 发出打字完成事件
      emit('typing-complete')
    }
  },
)

// --- Lifecycle Hook ---
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
/* 确保 v-html 渲染的内容有基础样式 */
div {
  line-height: 1.6;
  word-wrap: break-word;
}

/* 你可以把 ChatSection.vue 中的 markdown-content 样式移到这里，或者保持原样 */
:deep(p) {
  margin-top: 0;
  margin-bottom: 1em;
}

:deep(pre) {
  background-color: #f6f8fa;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

:deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  background-color: rgba(175, 184, 193, 0.2);
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  border-radius: 3px;
}

:deep(pre code) {
  background-color: transparent;
  padding: 0;
  margin: 0;
  font-size: inherit;
  border-radius: 0;
}
</style>
