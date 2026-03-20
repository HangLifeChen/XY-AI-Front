export type KnowledgeBaseStatus = 'active' | 'processing' | 'error' | 'archived'

export interface KnowledgeBase {
  id: string
  kbId: string
  name: string
  description: string
  tags: string[]
  status: KnowledgeBaseStatus
  documentCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
  totalSize: number // 以字节为单位
  // 嵌入模型配置
  embeddingModelProvider?: string
  embeddingModelName?: string
  // 对话模型配置
  chatModelProvider?: string
  chatModelName?: string
}

export interface CreateKnowledgeBaseForm {
  name: string
  description: string
  tags: string[]
  // 嵌入模型配置
  embeddingModelProvider?: string
  embeddingModelName?: string
  // 对话模型配置
  chatModelProvider?: string
  chatModelName?: string
}

export interface UpdateKnowledgeBaseForm {
  name?: string
  description?: string
  tags?: string[]
  status?: KnowledgeBaseStatus
  // 嵌入模型配置
  embeddingModelProvider?: string
  embeddingModelName?: string
  // 对话模型配置
  chatModelProvider?: string
  chatModelName?: string
}

export interface KnowledgeBaseDocument {
  id: string
  knowledgeBaseId: string
  name: string
  fileType: string
  size: number
  status: 'pending' | 'processing' | 'indexed' | 'error'
  createdAt: string
  updatedAt: string
  createdBy: string
  metadata?: Record<string, any>
  pageCount?: number
  vectorCount?: number
}

export interface KnowledgeBaseSearchParams {
  knowledgeBaseId: string
  query: string
  maxResults?: number
  filter?: string
}

export interface KnowledgeBaseDocumentInfo {
  id: number
  docId: string
  name: string
  description: string
  fileType: string
  fileSize: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface KnowledgeBaseSearchResult {
  id: number
  documentId: string
  chunkId: string
  content: string
  score: number
  position: number
  metadata: Record<string, any>
  document: KnowledgeBaseDocumentInfo
}

export interface KnowledgeBaseSearchResponse {
  query: string
  results: KnowledgeBaseSearchResult[]
  total: number
  took: number
  kbId: string
}
