import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import SiteVisualEditor from "@/components/SiteVisualEditor";
import ContentReplay from "@/components/ContentReplay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "超时空辉夜姬同人收集站",
  description: "超时空辉夜姬非官方同人数字档案馆，以作者授权、tag 检索、作品保存和社区互动为核心。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="ck-stars min-h-full">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
