import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "4ndSYS - 웹소설 작가를 위한 글쓰기 플랫폼",
    short_name: "4ndSYS",
    description:
      "회차·시놉시스·캐릭터·관계도를 한 곳에서. 자동 저장과 클라우드 동기화로 어디서든 이어 쓰세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0ea5e9",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["productivity", "utilities"],
    lang: "ko",
    dir: "ltr",
  };
}
