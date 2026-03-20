<template>
  <span>{{ displayText }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  text: string
  speed?: number
}>()

const displayText = ref('')
let currentIndex = 0
let timer: number | null = null

const startTyping = () => {
  // 清除之前的timer
  if (timer !== null) {
    clearInterval(timer)
  }

  // 重置状态
  currentIndex = 0
  displayText.value = ''

  // 开始打字效果
  timer = window.setInterval(() => {
    if (currentIndex < props.text.length) {
      displayText.value += props.text[currentIndex]
      currentIndex++
    } else {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
    }
  }, props.speed || 50)
}

// 监听文本变化
watch(
  () => props.text,
  () => {
    startTyping()
  },
)

// 组件挂载时开始打字效果
onMounted(() => {
  startTyping()
})

// 组件卸载时清理timer
onUnmounted(() => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
span {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
