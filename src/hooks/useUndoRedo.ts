import { ref } from 'vue'

export interface HistoryState {
  nodes: any[]
  edges: any[]
}

export default function useUndoRedo(initialState: HistoryState) {
  const history = ref<HistoryState[]>([])
  const future = ref<HistoryState[]>([])
  const current = ref<HistoryState>({ ...initialState })

  // 添加新状态到历史记录
  const addState = (state: HistoryState) => {
    history.value.push({ ...current.value })
    current.value = { ...state }
    future.value = [] // 清除重做历史
  }

  // 撤销操作
  const undo = () => {
    if (history.value.length === 0) return null

    future.value.push({ ...current.value })
    current.value = history.value.pop()!
    return { ...current.value }
  }

  // 重做操作
  const redo = () => {
    if (future.value.length === 0) return null

    history.value.push({ ...current.value })
    current.value = future.value.pop()!
    return { ...current.value }
  }

  // 获取当前状态
  const getCurrentState = () => ({ ...current.value })

  return {
    addState,
    undo,
    redo,
    getCurrentState,
    canUndo: () => history.value.length > 0,
    canRedo: () => future.value.length > 0,
  }
}
