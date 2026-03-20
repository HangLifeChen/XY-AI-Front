// 向量数据库集合
export interface VectorCollection {
  id: string
  name: string
  dimension: number
  count: number
  created: string
  description?: string
  metadata?: Record<string, any>
}

// 创建向量数据库集合请求
export interface VectorCollectionCreateRequest {
  name: string
  dimension: number
  description?: string
  metadata?: Record<string, any>
}

// 关系型数据表
export interface RelationalTable {
  id: string
  name: string
  rows: number
  size: string
  engine: string
  created: string
  description?: string
}

// 创建关系型数据表请求
export interface RelationalTableCreateRequest {
  name: string
  columns: Array<{
    name: string
    type: string
    nullable?: boolean
    primaryKey?: boolean
    defaultValue?: any
  }>
  description?: string
}

// 存储文件
export interface StorageFile {
  id: string
  name: string
  path: string
  size: string
  type: string
  modified: string
  url?: string
  metadata?: Record<string, any>
  source: string
}

// 上传文件请求
export interface StorageFileUploadRequest {
  file: File
  path?: string
  metadata?: Record<string, any>
}
