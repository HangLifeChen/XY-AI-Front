<template>
  <div class="node-panel">
    <div class="panel-header">节点库</div>
    <div v-for="category in nodeCategories" :key="category.id" class="category">
      <div class="category-header">
        <el-icon :size="16"><component :is="category.icon" /></el-icon>
        <span>{{ category.label }}</span>
      </div>
      <div class="category-content">
        <div
          v-for="node in category.nodes"
          :key="node.type"
          class="node-item"
          :draggable="true"
          @dragstart="onDragStart($event, category.id, node)"
        >
          <el-icon :size="20"><component :is="node.icon" /></el-icon>
          <span>{{ node.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  VideoPlay,
  CircleClose as CircleCloseIcon,
  Connection,
  Share,
  RefreshRight,
  Document,
  Download,
  ChatDotRound,
  CoffeeCup,
  Position,
  Histogram,
  Timer,
  Link,
  Folder,
  Files,
  Monitor,
  MagicStick,
  ChatRound,
  Picture,
  Setting,
  Grid,
} from '@element-plus/icons-vue'
import { markRaw, render } from 'vue'

import { NodeTypes } from '@/constants/nodeTypes'
import { FieldType, responseFormatOptions } from '@/types/node'

import TextCombineNode from './nodes/TextCombineNode.vue'
import TongyiNode from './nodes/TongyiNode.vue'
import OllamaNode from './nodes/OllamaNode.vue'
import TextDisplayNode from './nodes/TextDisplayNode.vue'
import HtmlDisplayNode from './nodes/HtmlDisplayNode.vue'
import StartNode from './nodes/StartNode.vue'
import EndNode from './nodes/EndNode.vue'
import ConditionNode from './nodes/ConditionNode.vue'
import HttpRequestNode from './nodes/HttpRequestNode.vue'
import CodeExecutionNode from './nodes/CodeExecutionNode.vue'
import LoopNode from './nodes/LoopNode.vue'
import FileNode from './nodes/FileNode.vue'
import TriggerNode from './nodes/TriggerNode.vue'
import CrawlerNode from './nodes/CrawlerNode.vue'
import DatabaseNode from './nodes/DatabaseNode.vue'
import QwenVLNode from './nodes/QwenVLNode.vue'

interface NodeType {
  type: (typeof NodeTypes)[keyof typeof NodeTypes]
  label: string
  icon: any
  data: Record<string, any>
  description?: string
}

interface NodeCategory {
  id: string
  label: string
  icon: any
  nodes: NodeType[]
}

const nodeCategories: NodeCategory[] = [
  {
    id: 'startEnd',
    label: '开始结束',
    icon: Connection,
    nodes: [
      {
        type: NodeTypes.START,
        label: '开始',
        icon: VideoPlay,
        description: '工作流开始节点',
        data: {
          output: {
            fieldName: '输出',
            fieldValue: '开始',
            fieldDesc: '开始节点输出',
            fieldType: 'div',
            list: false,
            options: [],
            show: true,
            required: true,
          },
        },
      },
      {
        type: NodeTypes.END,
        label: '结束',
        icon: CircleCloseIcon,
        description: '工作流结束节点',
        data: {
          input: {
            fieldName: '输入',
            fieldValue: '结束',
            fieldDesc: '结束节点输入',
            fieldType: 'div',
            list: false,
            options: [],
            show: true,
            required: true,
          },
        },
      },
    ],
  },
  {
    id: 'display',
    label: '呈现',
    icon: Connection,
    nodes: [
      {
        type: 'textDisplay',
        label: '文本呈现',
        icon: Download,
        description: '输出-文本呈现',
        data: {
          title: {
            fieldName: '文本标题',
            fieldValue: '文本标题',
            fieldDesc: '文本标题',
            fieldType: 'div',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          content: {
            fieldName: '文本内容',
            fieldValue: '文本内容',
            fieldDesc: '文本内容',
            fieldType: 'div',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          renderMarkdown: {
            fieldName: '是否渲染Markdown',
            fieldValue: true,
            fieldDesc: '',
            fieldType: 'val',
            list: false,
            options: [],
            show: false,
          },
        },
      },
      {
        type: 'htmlDisplay',
        label: 'HTML呈现',
        icon: Document,
        description: '输出-HTML呈现',
        data: {
          htmlContent: {
            fieldName: 'HTML内容',
            fieldValue: '<p>请输入HTML内容</p>',
            fieldDesc: 'HTML内容',
            fieldType: FieldType.TEXTAREA,
            list: false,
            options: [],
            show: true,
            required: true,
          },
        },
      },
    ],
  },
  {
    id: 'control',
    label: '控制流',
    icon: Position,
    nodes: [
      {
        type: NodeTypes.CONDITION,
        label: '条件判断',
        icon: Share,
        description: '根据条件表达式决定执行路径',
        data: {
          condition: {
            fieldName: '条件表达式',
            fieldValue: '',
            fieldDesc: '条件判断表达式，如: {{.变量名}} > 10',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          trueBranch: {
            fieldName: '为真时的分支',
            fieldValue: 'true',
            fieldDesc: '条件为真时执行的分支',
            fieldType: 'div',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          falseBranch: {
            fieldName: '为假时的分支',
            fieldValue: 'false',
            fieldDesc: '条件为假时执行的分支',
            fieldType: 'div',
            list: false,
            options: [],
            show: true,
            required: true,
          },
        },
      },
      {
        type: NodeTypes.LOOP,
        label: '循环控制',
        icon: RefreshRight,
        description: '循环执行指定次数',
        data: {
          count: {
            fieldName: '循环次数',
            fieldValue: 3,
            fieldDesc: '循环执行的次数',
            fieldType: 'number',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          variable: {
            fieldName: '循环变量',
            fieldValue: 'item',
            fieldDesc: '循环中使用的变量名',
            fieldType: 'text',
            list: false,
            options: [],
            show: true,
            required: true,
          },
        },
      },
    ],
  },
  {
    id: 'file',
    label: '文件处理',
    icon: Folder,
    nodes: [
      {
        type: NodeTypes.FILE,
        label: '文件操作',
        icon: Files,
        description: '文件读写操作',
        data: {
          filePath: {
            fieldName: '文件路径',
            fieldValue: '',
            fieldDesc: '要操作的文件路径',
            fieldType: 'text',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          operation: {
            fieldName: '操作类型',
            fieldValue: 'read',
            fieldDesc: '文件操作类型',
            fieldType: 'select',
            list: false,
            options: ['read', 'write', 'append', 'delete'],
            show: true,
            required: true,
          },
          content: {
            fieldName: '文件内容',
            fieldValue: '',
            fieldDesc: '写入文件的内容',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: false,
          },
        },
      },
    ],
  },
  {
    id: 'media',
    label: '多媒体',
    icon: Monitor,
    nodes: [],
  },
  {
    id: 'ai',
    label: 'AI模型',
    icon: MagicStick,
    nodes: [
      {
        type: NodeTypes.OLLAMA,
        label: 'Ollama',
        icon: MagicStick,
        description: 'Ollama本地模型',
        data: {
          baseURL: {
            fieldName: 'Base URL',
            fieldValue: 'http://localhost:11434',
            fieldDesc: '',
            fieldType: FieldType.TEXT,
            list: false,
            options: [],
            show: true,
            required: false,
          },
          model: {
            fieldName: '模型',
            fieldValue: 'modelscope.cn/Qwen/Qwen3-32B-GGUF:latest',
            fieldDesc: '',
            fieldType: FieldType.TEXT,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          prompt: {
            fieldName: '提示词',
            fieldValue: '',
            fieldDesc: '',
            fieldType: FieldType.TEXTAREA,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          systemPrompt: {
            fieldName: '系统提示词',
            fieldValue: '',
            fieldDesc: '',
            fieldType: FieldType.TEXTAREA,
            list: false,
            options: [],
            show: true,
            required: false,
          },
          temperature: {
            fieldName: '温度',
            fieldValue: 0.8,
            fieldDesc: '',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          maxTokens: {
            fieldName: '最大token数',
            fieldValue: 2048,
            fieldDesc: '',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          topP: {
            fieldName: '核采样',
            fieldValue: 0.9,
            fieldDesc: '',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          responseFormat: {
            fieldName: '响应格式',
            fieldValue: 'text',
            fieldDesc: '',
            fieldType: FieldType.SELECT,
            list: false,
            options: responseFormatOptions,
            show: true,
            required: true,
          },
        },
      },
      {
        type: NodeTypes.TONGYI,
        label: '通义千问',
        icon: ChatRound,
        description: '通义千问',
        data: {
          model: {
            fieldName: '模型',
            fieldValue: 'qweb3-32b',
            fieldDesc: '',
            fieldType: FieldType.SELECT,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          prompt: {
            fieldName: '提示词',
            fieldValue: '',
            fieldDesc: '',
            fieldType: FieldType.TEXTAREA,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          systemPrompt: {
            fieldName: '系统提示词',
            fieldValue: '',
            fieldDesc: '',
            fieldType: FieldType.TEXTAREA,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          temperature: {
            fieldName: '温度',
            fieldValue: 0.7,
            fieldDesc: '',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          maxTokens: {
            fieldName: '最大token数',
            fieldValue: 10000,
            fieldDesc: '',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          topP: {
            fieldName: '核采样',
            fieldValue: 0.95,
            fieldDesc: '',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          responseFormat: {
            fieldName: '响应格式',
            fieldValue: 'text',
            fieldDesc: '',
            fieldType: FieldType.SELECT,
            list: false,
            options: responseFormatOptions,
            show: true,
            required: true,
          },
        },
      },
      {
        type: NodeTypes.QWEN_VL,
        label: '通义千问VL',
        icon: Picture,
        description: '通义千问VL多模态模型',
        data: {
          model: {
            fieldName: '模型',
            fieldValue: 'modelscope.cn/unsloth/Qwen2.5-VL-7B-Instruct-GGUF:latest',
            fieldDesc: '选择Qwen-VL模型版本',
            fieldType: FieldType.TEXT,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          providers: {
            fieldName: '模型厂商',
            fieldValue: [],
            fieldDesc: '选择模型厂商',
            fieldType: FieldType.SELECT,
            list: true,
            options: [],
            show: true,
            required: true,
          },
          image: {
            fieldName: '图片',
            fieldValue: '',
            fieldDesc: '上传图片文件',
            fieldType: FieldType.UPLOAD,
            list: false,
            options: [],
            show: true,
            required: false,
          },
          imageUrl: {
            fieldName: '图片链接',
            fieldValue: '',
            fieldDesc: '图片的URL链接',
            fieldType: FieldType.TEXT,
            list: false,
            options: [],
            show: true,
            required: false,
          },
          promptType: {
            fieldName: '提示词类型',
            fieldValue: 'image',
            fieldDesc: '提示词类型',
            fieldType: FieldType.SELECT,
            list: false,
            options: [
              { label: 'Image', value: 'image' },
              { label: 'Image URL', value: 'imageUrl' },
            ],
            show: true,
            required: false,
          },
          temperature: {
            fieldName: '温度',
            fieldValue: 0.7,
            fieldDesc: '控制生成文本的随机性',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          maxTokens: {
            fieldName: '最大token数',
            fieldValue: 10000,
            fieldDesc: '限制生成文本的最大长度',
            fieldType: FieldType.INPUT_NUMBER,
            list: false,
            options: [],
            show: true,
            required: true,
          },

          responseFormat: {
            fieldName: '响应格式',
            fieldValue: 'html',
            fieldDesc: '输出格式',
            fieldType: FieldType.SELECT,
            list: false,
            options: [
              {
                label: 'HTML',
                value: 'html',
              },
            ],
            show: true,
            required: true,
          },
        },
      },
    ],
  },
  {
    id: 'a2a',
    label: 'A2A协议',
    icon: Connection,
    nodes: [
      {
        type: 'a2aTask',
        label: 'A2A任务',
        icon: Connection,
        description: '通过A2A协议与其他智能体通信',
        data: {
          endpoint: {
            fieldName: '目标端点',
            fieldValue: '',
            fieldDesc: 'A2A智能体的端点URL',
            fieldType: 'text',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          taskDescription: {
            fieldName: '任务描述',
            fieldValue: '',
            fieldDesc: '发送给A2A智能体的任务描述',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          inputVariables: [],
        },
      },
    ],
  },
  {
    id: 'collaboration',
    label: '协作',
    icon: Connection,
    nodes: [
      {
        type: 'callAgent',
        label: '调用Agent',
        icon: Connection,
        description: '调用其他Agent协助完成任务',
        data: {
          targetAgentId: {
            fieldName: '目标Agent',
            fieldValue: '',
            fieldDesc: '要调用的目标Agent',
            fieldType: 'select',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          taskDescription: {
            fieldName: '任务描述',
            fieldValue: '',
            fieldDesc: '发送给目标Agent的任务描述',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          outputVariable: {
            fieldName: '输出变量名',
            fieldValue: 'agent_result',
            fieldDesc: '存储结果的变量名',
            fieldType: 'text',
            list: false,
            options: [],
            show: true,
            required: true,
          },
        },
      },
    ],
  },
  {
    id: 'text',
    label: '文本处理',
    icon: Document,
    nodes: [
      {
        type: NodeTypes.TEXT_COMBINE,
        label: '文本合成',
        icon: Document,
        description: '使用模板合成文本',
        data: {
          template: {
            fieldName: '模版',
            fieldValue: '这是一个模板，可以包含变量如 {{.变量1}} 和 {{.变量2}}',
            fieldDesc: '在这里写模版，只支持golang模版语法',
            fieldType: FieldType.TEXTAREA,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          variables: [
            {
              fieldName: '变量1',
              fieldValue: '变量1',
              fieldDesc: '',
              fieldType: FieldType.TEXT,
              list: false,
              options: [],
              show: true,
              required: true,
            },
            {
              fieldName: '变量2',
              fieldValue: '变量2',
              fieldDesc: '',
              fieldType: FieldType.TEXT,
              list: false,
              options: [],
              show: true,
              required: true,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'tools',
    label: '工具',
    icon: Setting,
    nodes: [
      {
        type: NodeTypes.HTTP_REQUEST,
        label: 'HTTP请求',
        icon: Connection,
        description: '发送HTTP请求到指定URL',
        data: {
          url: {
            fieldName: '请求URL',
            fieldValue: '',
            fieldDesc: 'HTTP请求的URL地址',
            fieldType: 'text',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          method: {
            fieldName: '请求方法',
            fieldValue: 'GET',
            fieldDesc: 'HTTP请求方法',
            fieldType: 'select',
            list: false,
            options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            show: true,
            required: true,
          },
          headers: {
            fieldName: '请求头',
            fieldValue: '{}',
            fieldDesc: 'HTTP请求头，JSON格式',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: false,
          },
          body: {
            fieldName: '请求体',
            fieldValue: '',
            fieldDesc: 'HTTP请求体',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: false,
          },
        },
      },
      {
        type: NodeTypes.CODE_EXECUTION,
        label: '代码执行',
        icon: CoffeeCup,
        description: '执行自定义代码',
        data: {
          language: {
            fieldName: '编程语言',
            fieldValue: 'javascript',
            fieldDesc: '代码执行的编程语言',
            fieldType: 'select',
            list: false,
            options: ['javascript', 'python', 'bash'],
            show: true,
            required: true,
          },
          code: {
            fieldName: '执行代码',
            fieldValue: '// 在这里编写代码\nreturn "Hello, World!";',
            fieldDesc: '要执行的代码',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          parameters: {
            fieldName: '输入参数',
            fieldValue: [],
            fieldDesc: '代码执行的输入参数',
            fieldType: 'div',
            list: true,
            options: [],
            show: true,
            required: false,
          },
        },
      },
    ],
  },
  {
    id: 'trigger',
    label: '触发器',
    icon: Timer,
    nodes: [
      {
        type: NodeTypes.TRIGGER,
        label: '定时触发',
        icon: Timer,
        description: '按计划定时触发工作流',
        data: {
          type: {
            fieldName: '触发类型',
            fieldValue: 'cron',
            fieldDesc: '触发器类型',
            fieldType: 'select',
            list: false,
            options: ['cron', 'interval'],
            show: true,
            required: true,
          },
          schedule: {
            fieldName: '调度表达式',
            fieldValue: '0 0 * * *',
            fieldDesc: 'Cron表达式或间隔时间',
            fieldType: 'text',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          enabled: {
            fieldName: '是否启用',
            fieldValue: true,
            fieldDesc: '触发器是否启用',
            fieldType: 'val',
            list: false,
            options: [],
            show: true,
            required: true,
          },
        },
      },
    ],
  },
  {
    id: 'crawler',
    label: '网络爬虫',
    icon: Share,
    nodes: [
      {
        type: NodeTypes.CRAWLER,
        label: '网页抓取',
        icon: Share,
        description: '从网页抓取数据',
        data: {
          url: {
            fieldName: '目标网址',
            fieldValue: '',
            fieldDesc: '要抓取的网页URL',
            fieldType: FieldType.TEXT,
            list: false,
            options: [],
            show: true,
            required: true,
          },
          format: {
            fieldName: '输出格式',
            fieldValue: 'text',
            fieldDesc: '输出格式',
            fieldType: FieldType.SELECT,
            list: false,
            options: [
              {
                value: 'text',
                label: '文本',
              },
              {
                value: 'html',
                label: 'HTML',
              },
            ],
            show: true,
            required: true,
          },
        },
      },
    ],
  },
  {
    id: 'database',
    label: '数据库',
    icon: Grid,
    nodes: [
      {
        type: NodeTypes.DATABASE,
        label: '数据库查询',
        icon: Grid,
        description: '执行数据库查询操作',
        data: {
          connectionString: {
            fieldName: '连接字符串',
            fieldValue: '',
            fieldDesc: '数据库连接字符串',
            fieldType: 'text',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          query: {
            fieldName: '查询语句',
            fieldValue: 'SELECT * FROM table',
            fieldDesc: 'SQL查询语句',
            fieldType: 'textarea',
            list: false,
            options: [],
            show: true,
            required: true,
          },
          parameters: {
            fieldName: '查询参数',
            fieldValue: [],
            fieldDesc: 'SQL查询参数',
            fieldType: 'div',
            list: true,
            options: [],
            show: true,
            required: false,
          },
        },
      },
    ],
  },
]

const nodeTypes = [
  {
    type: 'start',
    name: '开始',
    icon: 'VideoPlay',
    color: '#67C23A',
    description: '工作流的起始节点',
    component: markRaw(StartNode),
  },
  {
    type: 'end',
    name: '结束',
    icon: 'CircleClose',
    color: '#F56C6C',
    description: '工作流的结束节点',
    component: markRaw(EndNode),
  },
  {
    type: 'condition',
    name: '条件判断',
    icon: 'Share',
    color: '#E6A23C',
    description: '根据条件决定执行分支',
    component: markRaw(ConditionNode),
  },
  {
    type: 'textCombine',
    name: '文本合成',
    icon: 'Document',
    color: '#67C23A',
    description: '合并多个文本输入生成新文本',
    component: markRaw(TextCombineNode),
  },
  {
    type: 'tongyi',
    name: '通义千问',
    icon: 'ChatRound',
    color: '#409EFF',
    description: '调用通义千问大模型',
    component: markRaw(TongyiNode),
  },
  {
    type: 'qwenVL',
    name: '通义千问VL',
    icon: 'Picture',
    color: '#409EFF',
    description: '调用通义千问VL多模态模型',
    component: markRaw(QwenVLNode),
  },
  {
    type: 'textDisplay',
    name: '文本呈现',
    icon: 'Document',
    color: '#909399',
    description: '显示文本内容',
    component: markRaw(TextDisplayNode),
  },
  {
    type: 'htmlDisplay',
    name: 'HTML呈现',
    icon: 'Document',
    color: '#909399',
    description: '显示HTML内容',
    component: markRaw(HtmlDisplayNode),
  },
  {
    type: 'httpRequest',
    name: 'HTTP请求',
    icon: 'Connection',
    color: '#909399',
    description: '发送HTTP请求到指定URL',
    component: markRaw(HttpRequestNode),
  },
  {
    type: 'codeExecution',
    name: '代码执行',
    icon: 'CoffeeCup',
    color: '#67C23A',
    description: '执行自定义代码',
    component: markRaw(CodeExecutionNode),
  },
  {
    type: 'loop',
    name: '循环控制',
    icon: 'RefreshRight',
    color: '#E6A23C',
    description: '循环执行指定次数',
    component: markRaw(LoopNode),
  },
  {
    type: 'file',
    name: '文件操作',
    icon: 'Files',
    color: '#909399',
    description: '文件读写操作',
    component: markRaw(FileNode),
  },
  {
    type: 'trigger',
    name: '定时触发',
    icon: 'Timer',
    color: '#E6A23C',
    description: '按计划定时触发工作流',
    component: markRaw(TriggerNode),
  },
  {
    type: 'crawler',
    name: '网页抓取',
    icon: 'Share',
    color: '#67C23A',
    description: '从网页抓取数据',
    component: markRaw(CrawlerNode),
  },
  {
    type: 'database',
    name: '数据库查询',
    icon: 'Grid',
    color: '#F56C6C',
    description: '执行数据库查询操作',
    component: markRaw(DatabaseNode),
  },
]

const emit = defineEmits<{
  dragStart: [event: DragEvent, node: NodeType]
}>()

const onDragStart = (event: DragEvent, categoryId: string, node: NodeType) => {
  // 设置节点类型和完整数据
  event.dataTransfer?.setData('application/vueflow', node.type)
  event.dataTransfer?.setData('nodeData', JSON.stringify(node.data))
  event.dataTransfer?.setData('categoryId', categoryId)
  event.dataTransfer?.setData('nodeLabel', node.label)
  event.dataTransfer!.effectAllowed = 'move'

  // 触发拖拽开始事件
  emit('dragStart', event, node)
}
</script>

<style scoped>
.node-panel {
  width: 240px;
  padding: 10px;
  border-right: 1px solid #eee;
  background: #f5f7fa;
  overflow-y: auto;
}

.panel-header {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ddd;
}

.category {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: #e8f2ff;
  border-radius: 4px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1a73e8;
}

.category-header .el-icon {
  margin-right: 8px;
}

.category-content {
  padding-left: 4px;
}

.node-item {
  padding: 8px;
  margin-bottom: 6px;
  background: white;
  border-radius: 4px;
  cursor: move;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.node-item:hover {
  background: #f0f7ff;
  transform: translateX(2px);
}

.node-item .el-icon {
  margin-right: 8px;
  color: #666;
}

.node-item span {
  font-size: 13px;
}
</style>
