import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT = (title, content) =>
  `以下のAI関連記事を、日本語で2〜3行（100文字程度）に要約してください。\n専門用語はそのまま使い、客観的に重要なポイントだけを述べてください。\n\nタイトル: ${title}\n本文: ${content}`;

export async function summarizeArticles(articles) {
  const summarized = [];

  for (const article of articles) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: PROMPT(article.title, article.content),
      });
      summarized.push({ ...article, summary: response.text.trim() });
    } catch (err) {
      console.warn(`[summarize] "${article.title}" の要約失敗: ${err.message}`);
      summarized.push({ ...article, summary: article.content.slice(0, 100) });
    }
  }

  console.log(`[summarize] ${summarized.length} 件要約完了`);
  return summarized;
}
