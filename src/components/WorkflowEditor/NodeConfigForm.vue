<template>
  <div class="node-config-form">
    <el-form :model="node.data" label-position="top" @submit.prevent="onSubmit">
      <el-form-item label="节点名称">
        <el-input v-model="node.data.label" />
      </el-form-item>

      <!-- 动态表单部分 -->
      <template v-if="node.type === 'agent'">
        <el-form-item label="智能体ID">
          <el-select v-model="node.data.agent_id" filterable placeholder="请选择智能体">
            <el-option
              v-for="agent in agentList"
              :key="agent.id"
              :label="agent.name"
              :value="agent.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="输入映射">
          <el-input
            v-model="node.data.input_mapping"
            type="textarea"
            :rows="3"
            placeholder="输入变量映射，如: {'input1': 'var1'}"
          />
        </el-form-item>
        <el-form-item label="输出映射">
          <el-input
            v-model="node.data.output_mapping"
            type="textarea"
            :rows="3"
            placeholder="输出变量映射，如: {'result': 'output1'}"
          />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'llm'">
        <el-form-item label="模型">
          <el-select v-model="node.data.model" placeholder="请选择模型">
            <el-option label="GPT-3.5" value="gpt-3.5-turbo" />
            <el-option label="GPT-4" value="gpt-4" />
            <el-option label="Claude" value="claude-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="温度">
          <el-slider v-model="node.data.temperature" :min="0" :max="2" :step="0.1" show-input />
        </el-form-item>
        <el-form-item label="最大Token数">
          <el-input-number v-model="node.data.maxTokens" :min="100" :max="10000000" />
        </el-form-item>
        <el-form-item label="提示词">
          <el-input v-model="node.data.prompt" type="textarea" :rows="4" placeholder="输入提示词" />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'http'">
        <el-form-item label="请求方法">
          <el-select v-model="node.data.method" placeholder="请选择方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="node.data.url" placeholder="输入请求URL" />
        </el-form-item>
        <el-form-item label="请求头">
          <el-input
            v-model="node.data.headers"
            type="textarea"
            :rows="3"
            placeholder="JSON格式请求头"
          />
        </el-form-item>
        <el-form-item label="请求体">
          <el-input
            v-model="node.data.body"
            type="textarea"
            :rows="4"
            placeholder="输入请求体内容"
          />
        </el-form-item>
      </template>

      <template v-else-if="node.type === 'python'">
        <el-form-item label="Python代码">
          <el-input
            v-model="node.data.code"
            type="textarea"
            :rows="8"
            placeholder="输入Python代码"
          />
        </el-form-item>
        <el-form-item label="导入">
          <el-input v-model="node.data.imports" placeholder="输入需要导入的模块，如: numpy as np" />
        </el-form-item>
        <el-form-item label="输出变量名">
          <el-input v-model="node.data.output_var" placeholder="输入输出变量名" />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  node: any
}>()

const emit = defineEmits(['update:node', 'cancel'])

const agentList = ref([
  { id: 'agent1', name: '数据分析智能体' },
  { id: 'agent2', name: '文本处理智能体' },
  { id: 'agent3', name: 'API集成智能体' },
])

const onSubmit = () => {
  emit('update:node', props.node)
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.node-config-form {
  padding: 20px;
}
</style>
