import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { Toaster } from "@/components/ui/sonner";
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
        {/* Service Worker 정리 (PWA 제거 후 잔여 SW unregister) */}
        <Script id="sw-cleanup" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (var registration of registrations) {
                  registration.unregister();
                }
              });
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (var name of names) {
                    caches.delete(name);
                  }
                });
              }
            }
          `}
        </Script>
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
              {children}
              <Toaster />
            </SyncProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
