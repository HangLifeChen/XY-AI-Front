/**
 * 工作流节点类型常量定义
 */
export const NodeTypes = {
  // 基础节点类型
  TASK: 'task',
  CONDITION: 'condition',
  AGENT: 'agent',
  MESSAGE: 'message',
  DECISION: 'decision',

  // 输入输出节点
  INPUT: 'input',
  OUTPUT: 'output',
  TEXT_DISPLAY: 'textDisplay',
  HTML_DISPLAY: 'htmlDisplay',

  // 开始和结束节点
  START: 'start',
  END: 'end',

  // 文本处理节点
  TEXT_PROCESS: 'text-process',
  TEXT_COMBINE: 'textCombine',
  
  // AI模型节点
  TONGYI: 'tongyi',
  QWEN_VL: 'qwenVL',
  OLLAMA: 'ollama',

  // 媒体生成节点
  AUDIO_GEN: 'audio-gen',
  IMAGE_GEN: 'image-gen',
  VIDEO_GEN: 'video-gen',
  MEDIA_EDIT: 'media-edit',

  // 数据处理节点
  JSON: 'json',
  VECTOR_DB: 'vector-db',
  SQL_DB: 'sql-db',

  // 文件操作节点
  FILE_READ: 'readFile',
  FILE_WRITE: 'writeFile',
  FILE_COPY: 'copyFile',
  FILE: 'file',

  // 网络相关节点
  HTTP_REQUEST: 'httpRequest',
  WEBHOOK: 'webhook',
  WEB_CRAWLER: 'web-crawler',
  API_CRAWLER: 'api-crawler',

  // 控制流节点
  LOOP: 'loop',
  BREAK: 'break',
  SCHEDULE: 'schedule',
  TRIGGER: 'trigger',
  CRAWLER: 'crawler',

  // 代码执行节点
  PYTHON: 'python',
  CODE_EXECUTION: 'codeExecution',

  // 数据库节点
  DATABASE: 'database',
} as const

/**
 * 节点类型分组
 */
export const NodeGroups = {
  BASIC: 'basic',
  IO: 'io',
  CONTROL: 'control',
  TEXT: 'text',
  AI: 'ai',
  MEDIA: 'media',
  DATA: 'data',
  FILE: 'file',
  NETWORK: 'network',
  CODE: 'code',
} as const

/**
 * 节点分组配置
 */
export const NodeGroupConfig = {
  [NodeGroups.BASIC]: {
    label: '基础节点',
    nodes: [
      NodeTypes.TASK,
      NodeTypes.CONDITION,
      NodeTypes.AGENT,
      NodeTypes.MESSAGE,
      NodeTypes.DECISION,
    ],
  },
  [NodeGroups.IO]: {
    label: '输入输出',
    nodes: [
      NodeTypes.INPUT,
      NodeTypes.OUTPUT,
      NodeTypes.TEXT_DISPLAY,
      NodeTypes.HTML_DISPLAY,
      NodeTypes.START,
      NodeTypes.END,
    ],
  },
  [NodeGroups.TEXT]: {
    label: '文本处理',
    nodes: [NodeTypes.TEXT_COMBINE, NodeTypes.TEXT_PROCESS],
  },
  [NodeGroups.AI]: {
    label: 'AI模型',
    nodes: [NodeTypes.TONGYI, NodeTypes.QWEN_VL, NodeTypes.OLLAMA],
  },
  [NodeGroups.MEDIA]: {
    label: '媒体处理',
    nodes: [NodeTypes.AUDIO_GEN, NodeTypes.IMAGE_GEN, NodeTypes.VIDEO_GEN, NodeTypes.MEDIA_EDIT],
  },
  [NodeGroups.DATA]: {
    label: '数据处理',
    nodes: [NodeTypes.JSON, NodeTypes.VECTOR_DB, NodeTypes.SQL_DB],
  },
  [NodeGroups.FILE]: {
    label: '文件操作',
    nodes: [NodeTypes.FILE_READ, NodeTypes.FILE_WRITE, NodeTypes.FILE_COPY],
  },
  [NodeGroups.NETWORK]: {
    label: '网络操作',
    nodes: [NodeTypes.HTTP_REQUEST, NodeTypes.WEBHOOK, NodeTypes.WEB_CRAWLER, NodeTypes.API_CRAWLER],
  },
  [NodeGroups.CONTROL]: {
    label: '控制流',
    nodes: [NodeTypes.LOOP, NodeTypes.BREAK, NodeTypes.SCHEDULE, NodeTypes.TRIGGER],
  },
  [NodeGroups.CODE]: {
    label: '代码执行',
    nodes: [NodeTypes.PYTHON, NodeTypes.CODE_EXECUTION],
  },
}

/**
 * 获取节点类型的显示名称
 */
export const getNodeTypeLabel = (type: keyof typeof NodeTypes): string => {
  const labels: Record<string, string> = {
    [NodeTypes.TASK]: '任务节点',
    [NodeTypes.CONDITION]: '条件节点',
    [NodeTypes.AGENT]: '智能体节点',
    [NodeTypes.MESSAGE]: '消息节点',
    [NodeTypes.DECISION]: '决策节点',
    [NodeTypes.INPUT]: '输入节点',
    [NodeTypes.OUTPUT]: '输出节点',
    [NodeTypes.TEXT_DISPLAY]: '文本显示',
    [NodeTypes.HTML_DISPLAY]: 'HTML显示',
    [NodeTypes.TEXT_COMBINE]: '文本合成',
    [NodeTypes.TEXT_PROCESS]: '文本处理',
    [NodeTypes.TONGYI]: '通义千问',
    [NodeTypes.QWEN_VL]: '通义千问VL',
    [NodeTypes.OLLAMA]: 'Ollama',
    [NodeTypes.AI_MODEL]: 'AI模型',
    [NodeTypes.LLM]: '语言模型',
    [NodeTypes.MULTIMODAL]: '多模态模型',
    [NodeTypes.AUDIO_GEN]: '音频生成',
    [NodeTypes.IMAGE_GEN]: '图像生成',
    [NodeTypes.VIDEO_GEN]: '视频生成',
    [NodeTypes.MEDIA_EDIT]: '媒体编辑',
    [NodeTypes.JSON]: 'JSON处理',
    [NodeTypes.VECTOR_DB]: '向量数据库',
    [NodeTypes.SQL_DB]: 'SQL数据库',
    [NodeTypes.FILE_READ]: '读取文件',
    [NodeTypes.FILE_WRITE]: '写入文件',
    [NodeTypes.FILE_COPY]: '复制文件',
    [NodeTypes.HTTP_REQUEST]: 'HTTP请求',
    [NodeTypes.WEBHOOK]: 'Webhook',
    [NodeTypes.WEB_CRAWLER]: '网页爬虫',
    [NodeTypes.API_CRAWLER]: 'API爬虫',
    [NodeTypes.LOOP]: '循环节点',
    [NodeTypes.BREAK]: '中断节点',
    [NodeTypes.SCHEDULE]: '调度节点',
    [NodeTypes.PYTHON]: 'Python执行',
    [NodeTypes.CODE_EXECUTION]: '代码执行',
    [NodeTypes.DATABASE]: '数据库',
    [NodeTypes.TRIGGER]: '触发器',
    [NodeTypes.CRAWLER]: '网页抓取',
    [NodeTypes.FILE]: '文件处理',
  }

  return labels[type] || type
}

/**
 * 获取节点的默认配置
 */
export const getDefaultNodeConfig = (type: keyof typeof NodeTypes) => {
  const defaults: Record<string, any> = {
    [NodeTypes.INPUT]: {
      variableName: '',
      defaultValue: '',
      description: '',
      required: true,
      inputType: 'text',
    },
    [NodeTypes.OUTPUT]: {
      variableName: '',
      format: 'text',
    },
    [NodeTypes.TEXT_DISPLAY]: {
      content: '',
      format: 'text',
    },
    [NodeTypes.HTML_DISPLAY]: {
      htmlContent: '<p>请输入HTML内容</p>',
      format: 'html',
    },
    // ... 其他节点类型的默认配置
  }

  return defaults[type] || {}
}