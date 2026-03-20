/**
 * 提示词语法高亮工具
 * 支持变量、代码块、特殊标记的高亮显示
 */

// 安全HTML转义
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 变量匹配正则
const VARIABLE_REGEX = /\{(.*?)\}/g
const CODE_BLOCK_REGEX = /```([\s\S]*?)```/g
const SPECIAL_MARKERS = ['NOTE:', 'IMPORTANT:', 'TODO:']

export function highlight(text: string): string {
  if (!text) return ''

  // 先转义所有HTML特殊字符
  let highlighted = escapeHtml(text)

  // 高亮变量
  highlighted = highlighted.replace(VARIABLE_REGEX, '<span class="variable">{$1}</span>')

  // 高亮代码块
  highlighted = highlighted.replace(CODE_BLOCK_REGEX, '<span class="code-block">```$1```</span>')

  // 高亮特殊标记
  SPECIAL_MARKERS.forEach((marker) => {
    const escapedMarker = escapeHtml(marker)
    highlighted = highlighted.replace(
      new RegExp(escapedMarker, 'g'),
      `<span class="marker">${escapedMarker}</span>`,
    )
  })

  // 保留换行和空格
  highlighted = highlighted.replace(/\n/g, '<br>')
  highlighted = highlighted.replace(/ /g, '&nbsp;')

  return highlighted
}

// 全局样式定义(应在主CSS中定义)
declare global {
  interface Window {
    promptHighlighterStyles?: boolean
  }
}

if (typeof window !== 'undefined' && !window.promptHighlighterStyles) {
  const style = document.createElement('style')
  style.textContent = `
    .variable {
      color: #e06c75;
      font-weight: bold;
    }
    .code-block {
      color: #56b6c2;
      background-color: #f8f8f8;
      padding: 2px 4px;
      border-radius: 3px;
    }
    .marker {
      color: #d19a66;
      font-weight: bold;
    }
  `
  document.head.appendChild(style)
  window.promptHighlighterStyles = true
}
