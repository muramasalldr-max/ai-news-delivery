import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'ai-news-delivery/1.0' },
});

const FEEDS = [
  { url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml', name: 'ITmedia AI+' },
  { url: 'https://zenn.dev/topics/ai/feed',               name: 'Zenn' },
  { url: 'https://www.anthropic.com/rss.xml',             name: 'Anthropic Blog' },
  { url: 'https://blog.google/technology/ai/rss/',        name: 'Google AI Blog' },
];

const HOURS_24 = 24 * 60 * 60 * 1000;

export async function fetchArticles() {
  const since = new Date(Date.now() - HOURS_24);

  const results = await Promise.allSettled(
    FEEDS.map(({ url, name }) =>
      parser.parseURL(url).then(feed =>
        feed.items
          .filter(item => item.isoDate && new Date(item.isoDate) >= since)
          .map(item => ({
            title:   item.title?.trim() ?? '(タイトルなし)',
            link:    item.link ?? '',
            content: item.contentSnippet?.slice(0, 500) ?? item.title ?? '',
            source:  name,
            isoDate: item.isoDate,
          }))
      ).catch(err => {
        console.warn(`[fetch-rss] ${name} の取得失敗: ${err.message}`);
        return [];
      })
    )
  );

  const articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate))
    .slice(0, 10);

  console.log(`[fetch-rss] ${articles.length} 件取得`);
  return articles;
}
