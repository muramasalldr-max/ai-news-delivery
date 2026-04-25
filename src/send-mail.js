import nodemailer from 'nodemailer';

const PAGE_URL = 'https://muramasalldr-max.github.io/ai-news-delivery/';

export async function sendMail(articles) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const now = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const sources = [...new Set(articles.map(a => a.source))].join('・');

  await transporter.sendMail({
    from: `"AI News Digest" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `【AI News Digest】${now}`,
    text: [
      `今日のAIニュース（${articles.length}記事 / ${sources}）をまとめました。`,
      '',
      `👉 ${PAGE_URL}`,
    ].join('\n'),
  });

  console.log(`[send-mail] メール送信完了`);
}
