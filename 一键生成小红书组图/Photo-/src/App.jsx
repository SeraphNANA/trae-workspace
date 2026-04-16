import React, { useState } from 'react';
import { parseArticle } from './utils/articleParser';
import { generateImageSet } from './utils/imageGenerator';
import { generatePreviewLayout, validateImageCount } from './utils/layoutManager';

function App() {
  const [article, setArticle] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!article.trim()) {
      setError('请输入文章内容');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 解析文章
      const articleData = parseArticle(article);
      
      // 验证图片数量
      if (!validateImageCount(articleData.contentBlocks.length)) {
        throw new Error('生成的图片数量必须在1-9张之间');
      }

      // 生成图片
      const generatedImages = await generateImageSet(articleData);
      setImages(generatedImages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    images.forEach((imageBlob, index) => {
      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `小红书组图_${index + 1}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>一键生成小红书组图</h1>
        <p>输入文章内容，自动生成适合小红书的组图</p>
      </header>

      <main className="app-main">
        <div className="input-section">
          <label htmlFor="article">文章内容：</label>
          <textarea
            id="article"
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            placeholder="请输入文章内容，支持Markdown格式的标题（以#开头）"
            rows={10}
          />
          <button 
            className="generate-btn" 
            onClick={handleGenerate} 
            disabled={loading}
          >
            {loading ? '生成中...' : '生成组图'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>

        {images.length > 0 && (
          <div className="output-section">
            <h2>生成的组图</h2>
            <div className="image-grid">
              {images.map((imageBlob, index) => (
                <div key={index} className="image-item">
                  <img 
                    src={URL.createObjectURL(imageBlob)} 
                    alt={`小红书组图 ${index + 1}`}
                  />
                  <p>第 {index + 1} 页</p>
                </div>
              ))}
            </div>
            <button className="download-btn" onClick={handleDownload}>
              下载组图
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 一键生成小红书组图工具</p>
      </footer>
    </div>
  );
}

export default App;