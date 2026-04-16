// 文章解析模块

/**
 * 解析文章内容，提取关键信息
 * @param {string} article - 文章内容
 * @returns {Object} 解析结果，包含标题、段落等信息
 */
export function parseArticle(article) {
  // 分割文章为段落
  const paragraphs = article.split('\n').filter(p => p.trim().length > 0);
  
  // 提取标题（假设第一段为标题）
  const title = paragraphs[0] || '无标题';
  const contentParagraphs = paragraphs.slice(1);
  
  // 分割内容为适合小红书组图的块
  const contentBlocks = splitContentIntoBlocks(contentParagraphs);
  
  return {
    title,
    contentBlocks
  };
}

/**
 * 将内容分割为适合小红书组图的块
 * @param {Array<string>} paragraphs - 段落数组
 * @returns {Array<Object>} 内容块数组
 */
function splitContentIntoBlocks(paragraphs) {
  const blocks = [];
  let currentBlock = { title: '', content: [] };
  
  paragraphs.forEach(paragraph => {
    // 如果段落以标题格式开头（例如以#开头或全大写），则创建新的内容块
    if (paragraph.startsWith('#') || paragraph === paragraph.toUpperCase()) {
      if (currentBlock.content.length > 0) {
        blocks.push(currentBlock);
        currentBlock = { title: paragraph.replace(/^#+/, '').trim(), content: [] };
      } else {
        currentBlock.title = paragraph.replace(/^#+/, '').trim();
      }
    } else {
      currentBlock.content.push(paragraph);
    }
  });
  
  // 添加最后一个内容块
  if (currentBlock.content.length > 0 || currentBlock.title) {
    blocks.push(currentBlock);
  }
  
  // 如果没有标题，为每个块生成默认标题
  if (blocks.length === 0) {
    // 至少创建一个内容块
    blocks.push({ title: '内容', content: paragraphs });
  } else if (blocks[0].title === '') {
    blocks[0].title = '介绍';
  }
  
  return blocks;
}

/**
 * 生成每个内容块的摘要
 * @param {Object} block - 内容块
 * @returns {string} 摘要
 */
export function generateBlockSummary(block) {
  const contentText = block.content.join(' ');
  return contentText.substring(0, 100) + (contentText.length > 100 ? '...' : '');
}