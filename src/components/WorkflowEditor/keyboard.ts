// 处理快捷键事件
export function setupKeyboardShortcuts(
  onUndo: () => void,
  onRedo: () => void,
  canUndo: () => boolean,
  canRedo: () => boolean,
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    // 检查是否在输入框中
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }

    // Ctrl+Z: 撤销
    if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
      if (canUndo()) {
        event.preventDefault()
        onUndo()
      }
    }

    // Ctrl+Y 或 Ctrl+Shift+Z: 重做
    if (
      (event.ctrlKey && event.key.toLowerCase() === 'y') ||
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z')
    ) {
      if (canRedo()) {
        event.preventDefault()
        onRedo()
      }
    }
  }

  // 添加事件监听器
  window.addEventListener('keydown', handleKeyDown)

  // 返回清理函数
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
}
