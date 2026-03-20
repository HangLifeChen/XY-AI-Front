/**
 * HTML工具函数
 */

/**
 * 从可能被Markdown代码块包裹的HTML内容中提取纯HTML
 * @param content 可能被Markdown代码块包裹的HTML内容
 * @returns 纯HTML内容
 */
export function extractHtmlFromMarkdown(content: string): string {
  if (!content) return ''
  
  // 匹配Markdown代码块的正则表达式，支持```html和```格式
  const codeBlockRegex = /```(?:html)?([\s\S]*?)```/
  const match = content.match(codeBlockRegex)
  
  // 如果找到代码块，返回其中的内容，否则返回原始内容
  return match ? match[1].trim() : content
}

/**
 * 检查内容是否被Markdown代码块包裹
 * @param content 要检查的内容
 * @returns 如果被包裹则返回true，否则返回false
 */
export function isWrappedInMarkdownCodeBlock(content: string): boolean {
  if (!content) return false
  
  // 匹配Markdown代码块的正则表达式
  const codeBlockRegex = /^```(?:html)?\s*[\s\S]*?\s*```$/
  return codeBlockRegex.test(content.trim())
}