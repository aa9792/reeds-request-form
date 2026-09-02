import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '睿思請示單｜申請與 PDF 套版',
  description: '線上填寫請示單、留存至 Google Sheets 並下載正式 PDF。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
