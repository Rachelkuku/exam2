import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전산회계 2급 개인용 문제은행",
  description:
    "전산회계 2급 A형 문제를 풀고, 자동 채점하고, 문제별 메모와 오답노트를 확인하는 개인용 학습 웹앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
