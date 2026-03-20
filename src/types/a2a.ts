/**
 * A2A (Agent-to-Agent) Protocol Types
 *
 * These types define the core concepts of the A2A protocol for agent-to-agent communication.
 */

// A2A Core Types

export interface AgentMarket {
  id: string
  name: string
  // Human-readable description of the Agent's function
  description: string
  // URL address where the Agent is hosted
  url: string
}
export interface AgentCard {
  // Human-readable name for the Agent (e.g., "Recipe Agent")
  name: string
  // Human-readable description of the Agent's function
  description: string
  // URL address where the Agent is hosted
  url: string
  // Service provider information for the Agent
  provider?: {
    organization: string
    url: string
  }
  // Version of the Agent (format defined by provider, e.g., "1.0.0")
  version: string
  // URL for the Agent's documentation
  documentationUrl?: string
  // Optional capabilities supported by the Agent
  capabilities: {
    streaming?: boolean // If the Agent supports SSE
    pushNotifications?: boolean // If the Agent can push update notifications to the client
    stateTransitionHistory?: boolean // If the Agent exposes task state change history
  }
  // Authentication requirements for the Agent (intended to match OpenAPI auth structure)
  authentication: {
    schemes: string[] // e.g., Basic, Bearer
    credentials?: string // Credentials for the client to use for private Cards
  }
  // Default interaction modes supported by the Agent across all skills
  defaultInputModes: string[] // Supported input MIME types
  defaultOutputModes: string[] // Supported output MIME types
  // Collection of capability units the Agent can perform
  skills: {
    id: string // Unique identifier for the skill
    name: string // Human-readable name for the skill
    description: string // Skill description
    tags: string[] // Tags describing the skill's capability category (e.g., "cooking", "customer support")
    examples?: string[] // Example scenarios or prompts the skill can execute (e.g., "I need a recipe for bread")
    inputModes?: string[] // Input MIME types supported by the skill (if different from default)
    outputModes?: string[] // Output MIME types supported by the skill (if different from default)
  }[]
}

export type TransportType = 'json-rpc' | 'grpc' | 'rest'

export interface AuthenticationMethod {
  type: 'oauth2' | 'apiKey' | 'jwt' | 'none'
  details?: any
}

export interface AgentCapability {
  name: string
  description: string
  inputSchema?: any
  outputSchema?: any
}

export interface AgentSkill {
  name: string
  description: string
  parameters?: any
}

export interface Task {
  id: string
  contextId?: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  completedAt?: string
  input?: Message
  output?: Artifact
  error?: A2AError
}

export type TaskStatus = 'submitted' | 'working' | 'completed' | 'failed' | 'cancelled'

export interface Message {
  role: 'user' | 'agent'
  parts: Part[]
  timestamp: string
}

export type Part = TextPart | FilePart | DataPart

export interface TextPart {
  type: 'text'
  text: string
  mimeType?: string
}

export interface FilePart {
  type: 'file'
  url: string
  mimeType: string
  filename?: string
}

export interface DataPart {
  type: 'data'
  data: any
  schema?: any
}

export interface Artifact {
  id: string
  taskId: string
  parts: Part[]
  createdAt: string
}

export interface A2AError {
  code: string
  message: string
  details?: any
}

// A2A API Request/Response Types

export interface SendTaskRequest {
  task: {
    input?: Message
    contextId?: string
  }
  webhookUrl?: string
}

export interface SendTaskResponse {
  taskId: string
  status: TaskStatus
}

export interface TaskStatusRequest {
  taskId: string
}

export interface TaskStatusResponse {
  task: Task
}

export interface TaskResultRequest {
  taskId: string
}

export interface TaskResultResponse {
  artifact: Artifact
}

export interface SubscribeTaskRequest {
  taskId: string
  webhookUrl: string
}

export interface SubscribeTaskResponse {
  success: boolean
}

// A2A Service Interface
export interface A2AService {
  sendTask(request: SendTaskRequest): Promise<SendTaskResponse>
  getTaskStatus(request: TaskStatusRequest): Promise<TaskStatusResponse>
  getTaskResult(request: TaskResultRequest): Promise<TaskResultResponse>
  subscribeToTask(request: SubscribeTaskRequest): Promise<SubscribeTaskResponse>
}
