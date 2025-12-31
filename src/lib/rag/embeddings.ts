/**
 * RAG Embeddings 工具
 * 用于文章内容分块和向量化
 */

import { generateEmbedding, generateEmbeddings } from '../deepseek/client';

export interface TextChunk {
  content: string;
  metadata: {
    title: string;
    category?: string;
    tags?: string[];
    article_id: string;
    chunk_index: number;
  };
}

/**
 * 将长文本分块
 * @param text 原始文本
 * @param chunkSize 每块的最大字符数
 * @param overlap 块之间的重叠字符数
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    // 尝试在句子边界处分割
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('。');
      const lastExclaim = chunk.lastIndexOf('！');
      const lastQuestion = chunk.lastIndexOf('？');
      const lastNewline = chunk.lastIndexOf('\n');
      
      const breakPoint = Math.max(lastPeriod, lastExclaim, lastQuestion, lastNewline);
      
      if (breakPoint > chunkSize / 2) {
        chunks.push(chunk.slice(0, breakPoint + 1).trim());
        start += breakPoint + 1 - overlap;
        continue;
      }
    }
    
    chunks.push(chunk.trim());
    start += chunkSize - overlap;
  }

  return chunks.filter(chunk => chunk.length > 20); // 过滤掉太短的块
}

/**
 * 为单个文章生成嵌入
 */
export async function embedArticle(article: {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}): Promise<Array<{ content: string; embedding: number[]; metadata: TextChunk['metadata'] }>> {
  // 清理 HTML 标签
  const cleanContent = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 分块
  const chunks = splitTextIntoChunks(cleanContent);
  
  // 为每个块生成嵌入
  const embeddings = await generateEmbeddings(chunks);
  
  return chunks.map((content, index) => ({
    content,
    embedding: embeddings[index],
    metadata: {
      title: article.title,
      category: article.category,
      tags: article.tags,
      article_id: article.id,
      chunk_index: index,
    },
  }));
}

/**
 * 为查询文本生成嵌入
 */
export async function embedQuery(query: string): Promise<number[]> {
  return generateEmbedding(query);
}

/**
 * 清理和规范化文本
 */
export function normalizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ') // 移除 HTML 标签
    .replace(/\s+/g, ' ') // 规范化空白字符
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s,.!?;:，。！？；：]/g, '') // 保留中英文和标点
    .trim();
}

