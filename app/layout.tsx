import type { Metadata } from 'next';
import './globals.css';
import { requireChatGPTUser } from './chatgpt-auth';

export const metadata: Metadata = {
  title: '睿思請示單｜申請與 PDF 套版',
  description: '線上填寫請示單、留存至 Google Sheets 並下載正式 PDF。',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireChatGPTUser('/');
  return (
    <html lang="zh-Hant">
      <body data-user-email={user.email} data-user-name={user.fullName ?? ''}>{children}</body>
    </html>
  );
}
