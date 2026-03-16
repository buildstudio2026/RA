import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoTabsKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "임상시험규정.zip",
  description: "국내 임상시험 관련 법령, 기준, 가이드라인을 한 곳에서 확인하고 추적하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoTabsKR.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
