// 从 Markdown 代码块中提取 HTML 内容
export const extractHtmlFromMarkdown = (markdown: string) => {
  // 检查是否以代码块标记开头和结尾
  const trimmedMarkdown = markdown.trim()
  if (trimmedMarkdown.startsWith('```') && trimmedMarkdown.endsWith('```')) {
    // 提取中间的内容
    const startIndex = trimmedMarkdown.indexOf('\n') + 1
    const endIndex = trimmedMarkdown.lastIndexOf('```')
    if (startIndex > 0 && endIndex > startIndex) {
      return trimmedMarkdown.substring(startIndex, endIndex).trim()
    }
    // 如果没有找到合适的换行符或内容，则返回空字符串
    return ''
  }
  // 如果不是以代码块标记包裹，返回原始内容
  return markdown
}
