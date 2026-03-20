import type { Node, XYPosition } from '@vue-flow/core'
import type { WorkflowNode } from './workflow'

export interface ContextMenuState {
  isVisible: boolean
  position: XYPosition
  node?: Node
}

export interface NodeTemplate {
  type: string
  label: string
  width?: number
  height?: number
  data: {
    label: string
    [key: string]: any
  }
}

export interface EditorState {
  selectedNode: WorkflowNode | null
  contextMenu: ContextMenuState
  isDragging: boolean
  isConnecting: boolean
  isPanelOpen: boolean
}

export enum NodeType {
  TASK = 'taskNode',
  CONDITION = 'conditionNode',
  AGENT = 'agentNode',
  MESSAGE = 'messageNode',
  DECISION = 'decisionNode',
  START = 'startNode',
  END = 'endNode',
  TEXT_DISPLAY = 'textDisplayNode',
  TEXT_COMBINE = 'textCombineNode',
}
