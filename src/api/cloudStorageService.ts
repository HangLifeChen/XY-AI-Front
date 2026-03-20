import { api } from '@/api/http'
import type {
  VectorCollection,
  VectorCollectionCreateRequest,
  RelationalTable,
  RelationalTableCreateRequest,
  StorageFile,
  StorageFileUploadRequest,
} from '@/types/cloudStorage'

// 向量数据库相关API
export const VectorDatabaseService = {
  // 获取向量数据库集合列表
  async getCollections(params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<{ collections: VectorCollection[]; total: number }> {
    return await api.get('/v1/vector-db/collections', { params })
  },

  // 创建向量数据库集合
  async createCollection(data: VectorCollectionCreateRequest): Promise<VectorCollection> {
    return await api.post('/v1/vector-db/collections', data)
  },

  // 获取向量数据库集合详情
  async getCollection(id: string): Promise<VectorCollection> {
    return await api.get(`/v1/vector-db/collections/${id}`)
  },

  // 删除向量数据库集合
  async deleteCollection(id: string): Promise<void> {
    await api.delete(`/v1/vector-db/collections/${id}`)
  },

  // 获取集合中的向量数据
  async getCollectionData(
    collectionId: string,
    params?: {
      page?: number
      pageSize?: number
      filter?: Record<string, any>
    },
  ): Promise<{ items: any[]; total: number }> {
    return await api.get(`/v1/vector-db/collections/${collectionId}/data`, { params })
  },

  // 向集合中添加向量数据
  async addCollectionData(collectionId: string, data: any[]): Promise<{ inserted: number }> {
    return await api.post(`/v1/vector-db/collections/${collectionId}/data`, { data })
  },

  // 删除集合中的向量数据
  async deleteCollectionData(collectionId: string, ids: string[]): Promise<{ deleted: number }> {
    return await api.delete(`/v1/vector-db/collections/${collectionId}/data`, {
      data: { ids },
    })
  },
}

// 关系型数据库相关API
export const RelationalDatabaseService = {
  // 获取数据表列表
  async getTables(params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<{ tables: RelationalTable[]; total: number }> {
    return await api.get('/v1/relational-db/tables', { params })
  },

  // 创建数据表
  async createTable(data: RelationalTableCreateRequest): Promise<RelationalTable> {
    return await api.post('/v1/relational-db/tables', data)
  },

  // 获取数据表详情
  async getTable(id: string): Promise<RelationalTable> {
    return await api.get(`/v1/relational-db/tables/${id}`)
  },

  // 删除数据表
  async deleteTable(id: string): Promise<void> {
    await api.delete(`/v1/relational-db/tables/${id}`)
  },

  // 获取表结构
  async getTableSchema(tableId: string): Promise<any> {
    return await api.get(`/v1/relational-db/tables/${tableId}/schema`)
  },

  // 获取表数据
  async getTableData(
    tableId: string,
    params?: {
      page?: number
      pageSize?: number
      filter?: Record<string, any>
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    },
  ): Promise<{ items: any[]; total: number }> {
    return await api.get(`/v1/relational-db/tables/${tableId}/data`, { params })
  },

  // 向表中插入数据
  async insertTableData(tableId: string, data: any[]): Promise<{ inserted: number }> {
    return await api.post(`/v1/relational-db/tables/${tableId}/data`, { data })
  },

  // 更新表中数据
  async updateTableData(tableId: string, id: string, data: any): Promise<any> {
    return await api.put(`/v1/relational-db/tables/${tableId}/data/${id}`, data)
  },

  // 删除表中数据
  async deleteTableData(tableId: string, ids: string[]): Promise<{ deleted: number }> {
    return await api.delete(`/v1/relational-db/tables/${tableId}/data`, {
      data: { ids },
    })
  },
}

// 文件存储相关API
export const FileStorageService = {
  // 获取文件列表
  async getFiles(params?: {
    page?: number
    pageSize?: number
    search?: string
    fileType?: string
  }): Promise<{ files: StorageFile[]; total: number }> {
    return await api.get('/v1/storage/files', { params })
  },

  // 上传文件
  async uploadFile(data: StorageFileUploadRequest): Promise<StorageFile> {
    const formData = new FormData()
    formData.append('file', data.file)

    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata))
    }

    if (data.path) {
      formData.append('path', data.path)
    }

    return await api.post('/v1/storage/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 获取文件详情
  async getFile(id: string): Promise<StorageFile> {
    return await api.get(`/v1/storage/files/${id}`)
  },

  // 下载文件
  async downloadFile(id: string): Promise<Blob> {
    return await api.get(`/v1/storage/files/${id}/download`, {
      responseType: 'blob',
    })
  },

  // 删除文件
  async deleteFile(id: string): Promise<void> {
    await api.delete(`/v1/storage/files/${id}`)
  },

  // 获取文件预览URL
  async getFilePreviewUrl(id: string): Promise<{ url: string }> {
    return await api.get(`/v1/storage/files/${id}/preview`)
  },

  // 批量删除文件
  async batchDeleteFiles(ids: string[]): Promise<{ deleted: number }> {
    return await api.delete('/v1/storage/files/batch', {
      data: { ids },
    })
  },
}
