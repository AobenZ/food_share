import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🍜 美食日记 | food_share",
  description: "记录和分享我平时吃到的美食",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();

  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark">🍜</span>
            美食日记
          </Link>
          <nav>
            <Link href="/">首页</Link>
            <Link className="nav-cta" href="/new">
              + 发布美食
            </Link>
            {user ? (
              <span className="nav-auth">
                👤 {user.username}
                <LogoutButton />
              </span>
            ) : (
              <>
                <Link href="/login">登录</Link>
                <Link href="/register">注册</Link>
              </>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">记录每一顿值得记住的好吃的 🍚</footer>
      </body>
    </html>
  );
}
