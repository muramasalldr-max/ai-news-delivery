import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCE_CLASS = {
  'ITmedia AI+':  'source-itmedia',
  'Zenn':         'source-zenn',
  'Anthropic Blog': 'source-anthropic',
  'Google AI Blog': 'source-google',
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeUrl(url) {
  return /^https?:\/\//.test(url) ? esc(url) : '#';
}

function relativeTime(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return '1時間以内';
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

function articleCard(article, index) {
  const cls = SOURCE_CLASS[article.source] ?? 'source-zenn';
  const isTop = index === 0;
  const cardBorder = isTop ? 'border-brand-200" style="border-left: 4px solid #22c55e;' : 'border-slate-100';
  const footerBg = isTop ? 'bg-brand-50 border-brand-100' : 'bg-slate-50 border-slate-100';

  return `
      <!-- ── NEWS ITEM ${index + 1}${isTop ? ' (TOP)' : ''} ── -->
      <div class="card-hover bg-white rounded-xl border ${cardBorder} shadow-sm overflow-hidden">
        ${isTop ? `<div class="px-5 pt-3 pb-1"><span class="inline-block text-[10px] font-bold tracking-[0.15em] text-brand-700 bg-brand-50 border border-brand-200 rounded px-2 py-0.5 mb-2">TODAY'S TOP</span></div>` : ''}
        <div class="px-5 ${isTop ? 'pb-4' : 'py-4'}">
          <div class="flex items-start justify-between gap-3 mb-2">
            <span class="${cls} text-[10px] font-medium px-2 py-0.5 rounded-full border tracking-wide flex-shrink-0 mt-0.5">${esc(article.source)}</span>
            <span class="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">${relativeTime(article.isoDate)}</span>
          </div>
          <h2 class="text-slate-800 font-bold text-[15px] leading-snug mb-2">${esc(article.title)}</h2>
          <p class="text-slate-500 text-[13px] leading-relaxed">${esc(article.summary)}</p>
        </div>
        <div class="px-5 py-2.5 ${footerBg} border-t flex items-center justify-between">
          <span class="text-[11px] text-slate-400">${esc(article.source)}</span>
          <a href="${safeUrl(article.link)}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-1.5 text-brand-700 text-[12px] font-semibold bg-brand-100 hover:bg-brand-200 px-3 py-1.5 rounded-lg transition-colors">
            記事を読む
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>`;
}

export function generateHtml(articles) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });

  const templatePath = join(__dirname, '..', 'mockup.html');
  let template = readFileSync(templatePath, 'utf-8');

  // 日付・統計を置換
  template = template.replace('2026年4月24日（金）', dateStr);
  template = template.replace(/>4 メディア</, `>${new Set(articles.map(a => a.source)).size} メディア<`);
  template = template.replace(/>5 記事</, `>${articles.length} 記事<`);

  // ニュースカードブロックを動的生成に置換
  const cardsHtml = articles.map((a, i) => articleCard(a, i)).join('\n');
  template = template.replace(
    /<!-- ── NEWS LIST ── -->([\s\S]*?)<!-- ── FOOTER ── -->/,
    `<!-- ── NEWS LIST ── -->\n    <div class="bg-[#f8f9ff] px-6 py-6 space-y-3">\n${cardsHtml}\n    </div>\n\n    <!-- ── FOOTER ── -->`
  );

  mkdirSync(join(__dirname, '..', 'dist'), { recursive: true });
  const outPath = join(__dirname, '..', 'dist', 'index.html');
  writeFileSync(outPath, template, 'utf-8');
  console.log(`[generate-html] dist/index.html を生成`);
}
