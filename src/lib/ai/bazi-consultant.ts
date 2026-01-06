import { calculateBaZi } from '@/lib/bazi/calendar';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { chatCompletion, generateEmbedding } from '@/lib/deepseek/client';
import fs from 'fs';
import path from 'path';

// 语言映射
const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'zh-CN': '\n\n【重要】请用简体中文回复，使用亲切温暖的中文表达。',
  'zh-TW': '\n\n【重要】請用繁體中文回覆，使用親切溫暖的中文表達。',
  'en': '\n\n【IMPORTANT】Please respond in English. Use warm, friendly, and professional English expressions. Adapt all cultural concepts and examples to be understandable for English-speaking users.',
  'ja': '\n\n【重要】日本語で返信してください。親しみやすく温かい日本語表現を使用してください。',
  'ko': '\n\n【중요】한국어로 답변해 주세요. 친근하고 따뜻한 한국어 표현을 사용해 주세요.',
};

// 加载系统提示词
function loadSystemPrompt(language: string = 'zh-CN'): string {
  try {
    const promptPath = path.join(process.cwd(), 'src/lib/ai/bazi-consultant-prompt.md');
    const basePrompt = fs.readFileSync(promptPath, 'utf-8');
    
    // 添加语言指令
    const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS['zh-CN'];
    return basePrompt + languageInstruction;
  } catch (error) {
    console.error('Failed to load system prompt:', error);
    const fallback = '你是一位专业的命理咨询师，请为用户提供温暖、专业的八字命理咨询服务。';
    const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS['zh-CN'];
    return fallback + languageInstruction;
  }
}

// RAG检索相关八字知识
async function searchBaziKnowledge(query: string, limit = 3): Promise<string> {
  try {
    const supabase = createSupabaseBrowserClient();
    
    // 1. 生成查询向量
    const queryEmbedding = await generateEmbedding(query);
    
    // 2. 向量搜索（只搜索八字相关文章）
    const { data: articles, error } = await supabase.rpc('match_article_sections', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
    });
    
    if (error) {
      console.error('RAG search error:', error);
      return '';
    }
    
    // 3. 过滤只保留八字相关的文章
    const baziArticles = (articles || []).filter((article: any) => {
      const metadata = article.metadata || {};
      return metadata.category === '八字' || 
             (metadata.tags && metadata.tags.includes('八字理论'));
    });
    
    // 4. 组合检索结果
    if (baziArticles.length === 0) {
      return '';
    }
    
    const knowledgeContext = baziArticles
      .map((article: any, index: number) => {
        return `[参考知识${index + 1}]\n${article.content}\n`;
      })
      .join('\n---\n\n');
    
    return knowledgeContext;
  } catch (error) {
    console.error('Error in searchBaziKnowledge:', error);
    return '';
  }
}

// 格式化八字信息为自然语言
function formatBaziInfo(bazi: any): string {
  const { year, month, day, hour, elements } = bazi;
  
  return `
用户的八字信息：
- 年柱：${year.stem}${year.branch}
- 月柱：${month.stem}${month.branch}
- 日柱：${day.stem}${day.branch}
- 时柱：${hour.stem}${hour.branch}

五行分布：
- 金：${elements.金 || 0}个
- 木：${elements.木 || 0}个
- 水：${elements.水 || 0}个
- 火：${elements.火 || 0}个
- 土：${elements.土 || 0}个
`.trim();
}

// 生成AI咨询回复
export async function generateBaziConsultation(params: {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  userQuestion: string;
  chatHistory?: Array<{ role: string; content: string }>;
  language?: string; // 用户选择的语言
}): Promise<{
  reply: string;
  bazi: any;
  suggestUpgrade?: boolean;
}> {
  const { birthDate, birthTime, userQuestion, chatHistory = [], language = 'zh-CN' } = params;
  
  try {
    // 1. 计算八字
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    const datetime = new Date(year, month - 1, day, hour, minute);
    const bazi = calculateBaZi(datetime);
    
    // 2. RAG检索相关知识
    const searchQuery = `八字 ${userQuestion}`;
    const knowledgeContext = await searchBaziKnowledge(searchQuery);
    
    // 3. 构建提示词
    const systemPrompt = loadSystemPrompt(language);
    const baziInfo = formatBaziInfo(bazi);
    
    let contextInfo = `${baziInfo}\n\n`;
    if (knowledgeContext) {
      contextInfo += `【内部知识库参考】
以下是相关的命理知识，请理解吸收后用自己的话表达，不要引用原文，不要泄露理论细节：

${knowledgeContext}
`;
    }
    
    // 4. 构建消息列表
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: contextInfo },
      ...chatHistory.slice(-6), // 只保留最近3轮对话
      { role: 'user', content: userQuestion },
    ];
    
    // 5. 调用DeepSeek API
    const data = await chatCompletion(messages as any, { temperature: 0.7, max_tokens: 1000 });
    const reply = data.choices[0].message.content;
    
    // 6. 检测是否需要建议升级服务
    const suggestUpgrade = detectUpgradeIntent(userQuestion, chatHistory.length);
    
    return {
      reply,
      bazi,
      suggestUpgrade,
    };
  } catch (error) {
    console.error('Error in generateBaziConsultation:', error);
    throw error;
  }
}

// 检测用户是否有深度咨询意向
function detectUpgradeIntent(question: string, messageCount: number): boolean {
  // 如果已经聊了很多轮，建议升级
  if (messageCount >= 8) {
    return true;
  }
  
  // 检测关键词
  const upgradeKeywords = [
    '详细', '深入', '具体', '更多', '怎么办', '如何', '方法',
    '改变', '提升', '改运', '化解', '学习', '教我',
  ];
  
  return upgradeKeywords.some(keyword => question.includes(keyword));
}

// 生成聊天记录摘要（用于预约）
export function generateChatSummary(chatHistory: Array<{ role: string; content: string }>): string {
  const userMessages = chatHistory.filter(msg => msg.role === 'user');
  const aiMessages = chatHistory.filter(msg => msg.role === 'assistant');
  
  let summary = '### 咨询记录摘要\n\n';
  summary += `**咨询轮数**：${Math.floor(chatHistory.length / 2)}轮\n\n`;
  summary += `**主要问题**：\n`;
  userMessages.slice(0, 3).forEach((msg, i) => {
    summary += `${i + 1}. ${msg.content}\n`;
  });
  
  summary += `\n**关键分析**：\n`;
  aiMessages.slice(-2).forEach((msg, i) => {
    const excerpt = msg.content.slice(0, 200);
    summary += `${i + 1}. ${excerpt}${msg.content.length > 200 ? '...' : ''}\n\n`;
  });
  
  summary += `\n**用户状态**：用户对命理咨询有深入兴趣，建议提供进阶服务。\n`;
  
  return summary;
}

