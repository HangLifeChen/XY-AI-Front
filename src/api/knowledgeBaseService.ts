import { api } from '@/api/http'
import type {
  KnowledgeBase,
  CreateKnowledgeBaseForm,
  UpdateKnowledgeBaseForm,
  KnowledgeBaseDocument,
  KnowledgeBaseSearchParams,
  KnowledgeBaseSearchResponse,
} from '@/types/knowledgeBase'

export class KnowledgeBaseService {
  static async getKnowledgeBases(
    params?: any,
  ): Promise<{ knowledgeBases: KnowledgeBase[]; total: number }> {
    return await api.post('/v1/knowledge/list', { params })
  }

  static async getKnowledgeBase(id: string): Promise<KnowledgeBase> {
    return await api.get(`/v1/knowledge/${id}`)
  }

  static async createKnowledgeBase(data: CreateKnowledgeBaseForm): Promise<KnowledgeBase> {
    return await api.post('/v1/knowledge', data)
  }

  static async updateKnowledgeBase(
    id: string,
    data: Partial<UpdateKnowledgeBaseForm>,
  ): Promise<KnowledgeBase> {
    return await api.put(`/v1/knowledge/${id}`, data)
  }

  static async deleteKnowledgeBase(id: string): Promise<void> {
    await api.delete(`/v1/knowledge/${id}`)
  }

  static async getDocuments(params: {
    knowledgeBaseId: string
    page?: number
    pageSize?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ items: KnowledgeBaseDocument[]; total: number }> {
    return await api.get(`/v1/knowledge/${params.knowledgeBaseId}/documents`, {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        status: params.status,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
    })
  }

  static async uploadDocument(
    knowledgeBaseId: string,
    file: File,
    metadata?: Record<string, any>,
  ): Promise<KnowledgeBaseDocument> {
    const formData = new FormData()
    formData.append('file', file)

    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    return await api.post(`/v1/knowledge/${knowledgeBaseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  static async deleteDocument(knowledgeBaseId: string, documentId: string): Promise<void> {
    await api.delete(`/v1/knowledge/${knowledgeBaseId}/documents/${documentId}`)
  }

  static async searchKnowledgeBase(
    params: KnowledgeBaseSearchParams,
  ): Promise<KnowledgeBaseSearchResponse> {
    return await api.post(`/v1/knowledge/${params.knowledgeBaseId}/search`, {
      query: params.query,
      maxResults: params.maxResults,
      filter: params.filter,
    })
  }

  static async getDocumentContent(knowledgeBaseId: string, documentId: string): Promise<string> {
    return await api.get(`/v1/knowledge/${knowledgeBaseId}/documents/${documentId}/content`)
  }

  static async reindexDocument(
    knowledgeBaseId: string,
    documentId: string,
  ): Promise<KnowledgeBaseDocument> {
    return await api.post(`/v1/knowledge/${knowledgeBaseId}/documents/${documentId}/reindex`)
  }
}
