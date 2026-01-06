/**
 * DeepSeek API Client
 * 用于生成 embeddings 和 LLM 对话
 */

const DEEPSEEK_API_BASE = 'https://api.deepseek.com';

function getDeepSeekApiKey(): string {
  // Prefer server-only env, but allow NEXT_PUBLIC_ fallback for local/dev convenience
  const apiKey =
    process.env.DEEPSEEK_API_KEY ||
    process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
    '';

  if (!apiKey) {
    throw new Error(
      'DEEPSEEK_API_KEY is not set (set DEEPSEEK_API_KEY or NEXT_PUBLIC_DEEPSEEK_API_KEY in your environment).'
    );
  }

  return apiKey;
}

export interface DeepSeekEmbeddingResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 生成文本的向量嵌入
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = getDeepSeekApiKey();

  const response = await fetch(`${DEEPSEEK_API_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat', // DeepSeek 使用同一个模型
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${error}`);
  }

  const data: DeepSeekEmbeddingResponse = await response.json();
  return data.data[0].embedding;
}

/**
 * 批量生成向量嵌入
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = getDeepSeekApiKey();

  const response = await fetch(`${DEEPSEEK_API_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${error}`);
  }

  const data: DeepSeekEmbeddingResponse = await response.json();
  return data.data.map(item => item.embedding);
}

/**
 * DeepSeek 聊天对话
 */
export async function chatCompletion(
  messages: DeepSeekChatMessage[],
  options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }
): Promise<DeepSeekChatResponse> {
  const apiKey = getDeepSeekApiKey();

  const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
      stream: options?.stream ?? false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * 流式聊天对话
 */
export async function* chatCompletionStream(
  messages: DeepSeekChatMessage[],
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): AsyncGenerator<string, void, unknown> {
  const apiKey = getDeepSeekApiKey();

  const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          console.error('Error parsing SSE:', e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

