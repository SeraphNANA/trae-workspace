// 小红书组图布局模块

/**
 * 计算小红书组图的布局
 * @param {number} imageCount - 图片数量
 * @returns {Object} 布局信息
 */
export function calculateLayout(imageCount) {
  // 小红书支持的布局类型
  const layouts = {
    1: { type: 'single', cols: 1, rows: 1 },
    2: { type: 'double', cols: 2, rows: 1 },
    3: { type: 'triple', cols: 3, rows: 1 },
    4: { type: 'quad', cols: 2, rows: 2 },
    5: { type: 'five', cols: 3, rows: 2 },
    6: { type: 'six', cols: 3, rows: 2 },
    7: { type: 'seven', cols: 3, rows: 3 },
    8: { type: 'eight', cols: 3, rows: 3 },
    9: { type: 'nine', cols: 3, rows: 3 }
  };
  
  // 对于超过9张的图片，返回9宫格布局
  return layouts[Math.min(imageCount, 9)] || layouts[1];
}

/**
 * 生成小红书组图的预览布局
 * @param {Array<Buffer>} images - 图片Buffer数组
 * @returns {Object} 预览布局信息
 */
export function generatePreviewLayout(images) {
  const imageCount = images.length;
  const layout = calculateLayout(imageCount);
  
  // 计算每个图片的位置和大小
  const previewWidth = 300;
  const previewHeight = 400;
  const gap = 2;
  
  const cellWidth = (previewWidth - (layout.cols - 1) * gap) / layout.cols;
  const cellHeight = (previewHeight - (layout.rows - 1) * gap) / layout.rows;
  
  const positions = [];
  
  for (let i = 0; i < imageCount; i++) {
    const row = Math.floor(i / layout.cols);
    const col = i % layout.cols;
    
    positions.push({
      index: i,
      x: col * (cellWidth + gap),
      y: row * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight
    });
  }
  
  return {
    layout,
    previewWidth,
    previewHeight,
    positions
  };
}

/**
 * 验证图片数量是否符合小红书要求
 * @param {number} imageCount - 图片数量
 * @returns {boolean} 是否符合要求
 */
export function validateImageCount(imageCount) {
  return imageCount >= 1 && imageCount <= 9;
}

/**
 * 获取小红书推荐的图片数量
 * @returns {Array<number>} 推荐的图片数量
 */
export function getRecommendedImageCounts() {
  return [1, 3, 4, 6, 9];
}