import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { Toaster } from "@/components/ui/sonner";
import { UpdatePrompt, ManualInstallGuide } from "@/components/features/pwa";
import { PWAInstallProvider } from "@/hooks/usePWAInstall";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "4ndSYS | 웹소설 작가를 위한 글쓰기 플랫폼",
  description:
    "회차·시놉시스·캐릭터·관계도를 한 곳에서. 자동 저장과 클라우드 동기화로 어디서든 이어 쓰세요.",
  keywords: ["웹소설", "글쓰기", "소설 쓰기", "작가", "집필", "4ndSYS"],
  authors: [{ name: "4ndSYS" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "4ndSYS",
  },
  openGraph: {
    title: "4ndSYS | 웹소설 작가를 위한 글쓰기 플랫폼",
    description:
      "회차·시놉시스·캐릭터·관계도를 한 곳에서. 자동 저장과 클라우드 동기화로 어디서든 이어 쓰세요.",
    url: "https://4ndsys.net",
    siteName: "4ndSYS",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://4ndsys.net/og-image.png",
        width: 1200,
        height: 630,
        alt: "4ndSYS - 웹소설 작가를 위한 글쓰기 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "4ndSYS | 웹소설 작가를 위한 글쓰기 플랫폼",
    description:
      "회차·시놉시스·캐릭터·관계도를 한 곳에서. 자동 저장과 클라우드 동기화로 어디서든 이어 쓰세요.",
    images: ["https://4ndsys.net/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SyncProvider>
              <PWAInstallProvider>
                {children}
                <Toaster />
                <UpdatePrompt />
                <ManualInstallGuide />
              </PWAInstallProvider>
            </SyncProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
