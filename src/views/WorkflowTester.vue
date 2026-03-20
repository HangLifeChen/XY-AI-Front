<template>
  <div class="workflow-tester">
    <el-card class="tester-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button icon="el-icon-back" @click="goBack" plain>返回</el-button>
            <span class="title">工作流测试器</span>
          </div>
          <el-button type="primary" @click="executeWorkflow">执行</el-button>
        </div>
      </template>

      <div class="tester-content">
        <!-- TextCombineNode 输入区域 -->
        <div class="input-section">
          <h3>文本合成节点输入</h3>
          <el-form :model="textCombineInput" label-position="top">
            <el-form-item label="文本模板">
              <el-input
                v-model="textCombineInput.template"
                type="textarea"
                :rows="3"
                placeholder="输入模板，使用 {{变量名}} 语法"
              />
            </el-form-item>

            <div v-if="variables.length > 0">
              <h4>变量值</h4>
              <el-form-item v-for="variable in variables" :key="variable" :label="variable">
                <el-input v-model="textCombineInput.variables[variable]" placeholder="输入变量值" />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- TextDisplayNode 显示区域 -->
        <div class="output-section">
          <h3>文本显示节点输出</h3>
          <div class="display-area">
            <div v-if="displayOutput.title" class="display-title">
              {{ displayOutput.title }}
            </div>
            <div
              class="display-content"
              :class="{ 'markdown-content': displayOutput.enableMarkdown }"
              v-html="formattedContent"
            ></div>
          </div>

          <div class="display-settings">
            <el-form :model="displayOutput" label-position="top">
              <el-form-item label="标题">
                <el-input v-model="displayOutput.title" placeholder="输入显示标题" />
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="displayOutput.enableMarkdown">
                  启用 Markdown 渲染
                </el-checkbox>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// TextCombineNode 输入数据
const textCombineInput = ref({
  template: '你好，{{name}}！现在是{{time}}。',
  variables: {} as Record<string, string>,
})

// 从模板中提取变量
const variables = computed(() => {
  const matches = textCombineInput.value.template.match(/\{\{([^}]+)\}\}/g) || []
  return matches.map((match) => match.slice(2, -2).trim())
})

// 监听变量变化，确保variables对象中包含所有变量
watch(
  variables,
  (newVars) => {
    const newVariables: Record<string, string> = {}
    newVars.forEach((variable) => {
      newVariables[variable] = textCombineInput.value.variables[variable] || ''
    })
    textCombineInput.value.variables = newVariables
  },
  { immediate: true },
)

// TextDisplayNode 输出数据
const displayOutput = ref({
  title: '',
  content: '',
  enableMarkdown: false,
})

// 格式化显示内容
const formattedContent = computed(() => {
  if (!displayOutput.value.content) return ''

  if (displayOutput.value.enableMarkdown) {
    const rawHtml = marked(displayOutput.value.content)
    return DOMPurify.sanitize(rawHtml)
  }

  return displayOutput.value.content
})

// 执行工作流
const executeWorkflow = () => {
  // 处理 TextCombineNode
  let combinedText = textCombineInput.value.template
  Object.entries(textCombineInput.value.variables).forEach(([key, value]) => {
    combinedText = combinedText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  })

  // 更新 TextDisplayNode 显示
  displayOutput.value.content = combinedText
}
</script>

<style scoped>
.workflow-tester {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tester-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tester-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.input-section,
.output-section {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.display-area {
  min-height: 200px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 15px;
}

.display-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.display-content {
  white-space: pre-wrap;
}

.markdown-content {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
}

.markdown-content :deep(code) {
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
}

.markdown-content :deep(pre) {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.display-settings {
  margin-top: 10px;
}
</style>
