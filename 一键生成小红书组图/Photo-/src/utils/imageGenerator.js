// 图片生成模块

// 小红书图片尺寸（3:4比例）
const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1440;

// 创建Canvas
function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 生成单个小红书风格图片
 * @param {Object} block - 内容块
 * @param {number} index - 图片索引
 * @param {string} title - 文章标题
 * @returns {Promise<Blob>} 生成的图片Blob
 */
export async function generateImage(block, index, title) {
  // 创建Canvas
  const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // 绘制背景
  drawBackground(ctx);
  
  // 绘制文章标题
  drawArticleTitle(ctx, title);
  
  // 绘制内容块标题
  drawBlockTitle(ctx, block.title, index);
  
  // 绘制内容
  drawContent(ctx, block.content);
  
  // 转换为Blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * 绘制背景
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 */
function drawBackground(ctx) {
  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  gradient.addColorStop(0, '#f8f8f8');
  gradient.addColorStop(1, '#e8e8e8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  
  // 添加装饰元素
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * IMAGE_WIDTH;
    const y = Math.random() * IMAGE_HEIGHT;
    const size = Math.random() * 50 + 20;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 绘制文章标题
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} title - 文章标题
 */
function drawArticleTitle(ctx, title) {
  ctx.fillStyle = '#333';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // 处理长标题，换行显示
  const maxWidth = IMAGE_WIDTH - 100;
  const lines = [];
  let currentLine = '';
  
  title.split(' ').forEach(word => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine.trim());
  
  // 绘制标题
  let y = 100;
  lines.forEach(line => {
    ctx.fillText(line, IMAGE_WIDTH / 2, y);
    y += 50;
  });
}

/**
 * 绘制内容块标题
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} blockTitle - 内容块标题
 * @param {number} index - 图片索引
 */
function drawBlockTitle(ctx, blockTitle, index) {
  ctx.fillStyle = '#ff4757';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  
  // 绘制序号
  ctx.fillStyle = '#ff4757';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`第 ${index + 1} 页`, 50, 80);
  
  // 绘制内容块标题
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(blockTitle, IMAGE_WIDTH / 2, 250);
  
  // 绘制分割线
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 300);
  ctx.lineTo(IMAGE_WIDTH - 50, 300);
  ctx.stroke();
}

/**
 * 绘制内容
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {Array<string>} content - 内容段落数组
 */
function drawContent(ctx, content) {
  ctx.fillStyle = '#555';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  let y = 350;
  const maxWidth = IMAGE_WIDTH - 100;
  
  content.forEach(paragraph => {
    // 处理段落，换行显示
    const lines = [];
    let currentLine = '';
    
    paragraph.split(' ').forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine.trim());
    
    // 绘制段落
    lines.forEach(line => {
      if (y > IMAGE_HEIGHT - 100) return; // 防止内容超出图片
      ctx.fillText(line, 50, y);
      y += 35;
    });
    
    y += 20; // 段落间距
  });
}

/**
 * 生成小红书组图
 * @param {Object} articleData - 解析后的文章数据
 * @returns {Promise<Array<Buffer>>} 生成的图片Buffer数组
 */
export async function generateImageSet(articleData) {
  const images = [];
  
  for (let i = 0; i < articleData.contentBlocks.length; i++) {
    const block = articleData.contentBlocks[i];
    const imageBuffer = await generateImage(block, i, articleData.title);
    images.push(imageBuffer);
  }
  
  return images;
}