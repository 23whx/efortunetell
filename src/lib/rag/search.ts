/**
 * RAG 检索和问答
 */

import { createSupabaseBrowserClient } from '../supabase/browser';
import { chatCompletion, DeepSeekChatMessage } from '../deepseek/client';
import { embedQuery } from './embeddings';

export interface SearchResult {
  id: string;
  article_id: string;
  content: string;
  metadata: {
    title: string;
    category?: string;
    tags?: string[];
    chunk_index: number;
  };
  similarity: number;
}

/**
 * 向量检索相关文章片段
 */
export async function searchSimilarContent(
  query: string,
  options?: {
    matchThreshold?: number;
    matchCount?: number;
  }
): Promise<SearchResult[]> {
  const supabase = createSupabaseBrowserClient();
  
  // 生成查询向量
  const queryEmbedding = await embedQuery(query);
  
  // 调用 Supabase 函数进行向量检索
  const { data, error } = await supabase.rpc('search_articles_by_embedding', {
    query_embedding: queryEmbedding,
    match_threshold: options?.matchThreshold ?? 0.7,
    match_count: options?.matchCount ?? 5,
  });
  
  if (error) {
    console.error('Vector search error:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * RAG 问答：基于检索到的内容生成回答
 */
export async function ragQueryAnswer(
  question: string,
  options?: {
    matchThreshold?: number;
    matchCount?: number;
    temperature?: number;
    language?: string;
  }
): Promise<{
  answer: string;
  sources: SearchResult[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  // 1. 检索相关内容
  const searchResults = await searchSimilarContent(question, {
    matchThreshold: options?.matchThreshold,
    matchCount: options?.matchCount,
  });
  
  if (searchResults.length === 0) {
    return {
      answer: options?.language === 'zh' 
        ? '抱歉，我在知识库中没有找到相关信息。请换个问题试试。'
        : 'Sorry, I couldn\'t find relevant information in the knowledge base. Please try a different question.',
      sources: [],
    };
  }
  
  // 2. 构建上下文
  const context = searchResults
    .map((result, index) => {
      return `[文章${index + 1}]《${result.metadata.title}》\n${result.content}`;
    })
    .join('\n\n---\n\n');
  
  // 3. 构建提示词
  const systemPrompt = options?.language === 'zh'
    ? `你是一位专业的中国玄学专家，精通八字命理、奇门遁甲、大六壬等传统占卜术。
请根据下面提供的知识库内容，准确、专业地回答用户的问题。

知识库内容：
${context}

回答要求：
1. 仅基于提供的知识库内容回答
2. 如果知识库中没有相关信息，请诚实告知
3. 回答要专业、准确、易懂
4. 可以引用知识库中的具体内容
5. 保持礼貌和专业的语气`
    : `You are a professional expert in Chinese metaphysics, specializing in BaZi (Eight Characters), Qimen Dunjia, Da Liu Ren, and other traditional divination methods.
Please answer the user's question accurately and professionally based on the knowledge base content provided below.

Knowledge Base:
${context}

Requirements:
1. Answer based only on the provided knowledge base
2. Be honest if the information is not in the knowledge base
3. Provide professional, accurate, and easy-to-understand answers
4. You may quote specific content from the knowledge base
5. Maintain a polite and professional tone`;
  
  const messages: DeepSeekChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: question,
    },
  ];
  
  // 4. 调用 LLM 生成回答
  const response = await chatCompletion(messages, {
    temperature: options?.temperature ?? 0.7,
    max_tokens: 1500,
  });
  
  return {
    answer: response.choices[0].message.content,
    sources: searchResults,
    usage: response.usage,
  };
}

/**
 * 流式 RAG 问答
 */
export async function* ragQueryAnswerStream(
  question: string,
  options?: {
    matchThreshold?: number;
    matchCount?: number;
    temperature?: number;
    language?: string;
  }
): AsyncGenerator<{ type: 'sources' | 'token' | 'done'; data?: any }, void, unknown> {
  // 1. 检索相关内容
  const searchResults = await searchSimilarContent(question, {
    matchThreshold: options?.matchThreshold,
    matchCount: options?.matchCount,
  });
  
  // 首先返回检索到的来源
  yield {
    type: 'sources',
    data: searchResults,
  };
  
  if (searchResults.length === 0) {
    yield {
      type: 'token',
      data: options?.language === 'zh' 
        ? '抱歉，我在知识库中没有找到相关信息。请换个问题试试。'
        : 'Sorry, I couldn\'t find relevant information in the knowledge base.',
    };
    yield { type: 'done' };
    return;
  }
  
  // 2. 构建上下文（同上）
  const context = searchResults
    .map((result, index) => {
      return `[文章${index + 1}]《${result.metadata.title}》\n${result.content}`;
    })
    .join('\n\n---\n\n');
  
  // 3. 构建提示词（同上）
  const systemPrompt = options?.language === 'zh'
    ? `你是一位专业的中国玄学专家，精通八字命理、奇门遁甲、大六壬等传统占卜术。
请根据下面提供的知识库内容，准确、专业地回答用户的问题。

知识库内容：
${context}

回答要求：
1. 仅基于提供的知识库内容回答
2. 如果知识库中没有相关信息，请诚实告知
3. 回答要专业、准确、易懂
4. 可以引用知识库中的具体内容
5. 保持礼貌和专业的语气`
    : `You are a professional expert in Chinese metaphysics. Answer based on the knowledge base provided.

Knowledge Base:
${context}`;
  
  // 4. 流式生成回答
  const { chatCompletionStream } = await import('../deepseek/client');
  const messages: DeepSeekChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];
  
  for await (const token of chatCompletionStream(messages, {
    temperature: options?.temperature ?? 0.7,
    max_tokens: 1500,
  })) {
    yield {
      type: 'token',
      data: token,
    };
  }
  
  yield { type: 'done' };
}

