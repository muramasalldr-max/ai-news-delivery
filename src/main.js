import { fetchArticles }  from './fetch-rss.js';
import { summarizeArticles } from './summarize.js';
import { generateHtml }  from './generate-html.js';
import { sendMail }      from './send-mail.js';

(async () => {
  console.log('=== AI News Delivery 開始 ===');

  const articles = await fetchArticles();
  if (articles.length === 0) {
    console.log('過去24時間の記事が見つかりませんでした。終了します。');
    process.exit(0);
  }

  const summarized = await summarizeArticles(articles);
  generateHtml(summarized);
  await sendMail(summarized);

  console.log('=== 完了 ===');
})();
