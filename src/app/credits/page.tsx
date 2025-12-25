import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const fonts = [
  {
    name: "Pretendard",
    author: "길형진",
    license: "OFL 1.1",
    url: "https://github.com/orioncactus/pretendard",
  },
  {
    name: "Noto Sans KR (본고딕)",
    author: "Google",
    license: "OFL 1.1",
    url: "https://fonts.google.com/noto/specimen/Noto+Sans+KR",
  },
  {
    name: "Noto Serif KR (본명조)",
    author: "Google",
    license: "OFL 1.1",
    url: "https://fonts.google.com/noto/specimen/Noto+Serif+KR",
  },
  {
    name: "나눔스퀘어 네오",
    author: "네이버",
    license: "OFL 1.1",
    url: "https://hangeul.naver.com/font",
  },
  {
    name: "Gmarket Sans",
    author: "G마켓",
    license: "무료 배포",
    url: "https://corp.gmarket.com/fonts",
  },
  {
    name: "리디바탕",
    author: "리디",
    license: "OFL 1.1",
    url: "https://www.ridicorp.com/ridibatang",
  },
  {
    name: "마루 부리",
    author: "네이버",
    license: "OFL 1.1",
    url: "https://hangeul.naver.com/font",
  },
];

const libraries = [
  {
    name: "Next.js",
    author: "Vercel",
    license: "MIT",
    url: "https://nextjs.org",
  },
  {
    name: "React",
    author: "Meta",
    license: "MIT",
    url: "https://react.dev",
  },
  {
    name: "Tiptap",
    author: "Tiptap GmbH",
    license: "MIT",
    url: "https://tiptap.dev",
  },
  {
    name: "Tailwind CSS",
    author: "Tailwind Labs",
    license: "MIT",
    url: "https://tailwindcss.com",
  },
  {
    name: "shadcn/ui",
    author: "shadcn",
    license: "MIT",
    url: "https://ui.shadcn.com",
  },
  {
    name: "Lucide Icons",
    author: "Lucide Contributors",
    license: "ISC",
    url: "https://lucide.dev",
  },
  {
    name: "Dexie.js",
    author: "David Fahlander",
    license: "Apache 2.0",
    url: "https://dexie.org",
  },
  {
    name: "Supabase",
    author: "Supabase Inc.",
    license: "Apache 2.0",
    url: "https://supabase.com",
  },
];

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">크레딧</h1>
        <p className="mt-2 text-muted-foreground">
          4ndSYS는 다음의 오픈소스 프로젝트와 폰트를 사용합니다.
        </p>

        {/* 폰트 섹션 */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">폰트</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            에디터에서 사용할 수 있는 폰트 목록입니다.
          </p>
          <div className="mt-4 divide-y rounded-lg border">
            {fonts.map((font) => (
              <div
                key={font.name}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium">{font.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {font.author} · {font.license}
                  </p>
                </div>
                <a
                  href={font.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 오픈소스 라이브러리 섹션 */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">오픈소스 라이브러리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            이 서비스를 만드는 데 사용된 주요 라이브러리입니다.
          </p>
          <div className="mt-4 divide-y rounded-lg border">
            {libraries.map((lib) => (
              <div
                key={lib.name}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium">{lib.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lib.author} · {lib.license}
                  </p>
                </div>
                <a
                  href={lib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 라이선스 설명 */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">라이선스 안내</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">OFL 1.1</strong> (SIL Open
              Font License): 자유롭게 사용, 수정, 배포 가능한 오픈 폰트
              라이선스입니다.
            </p>
            <p>
              <strong className="text-foreground">MIT</strong>: 상업적 사용을
              포함하여 자유롭게 사용할 수 있는 오픈소스 라이선스입니다.
            </p>
            <p>
              <strong className="text-foreground">Apache 2.0</strong>: 특허권
              부여를 포함하는 오픈소스 라이선스입니다.
            </p>
            <p>
              <strong className="text-foreground">ISC</strong>: MIT와 유사한
              간결한 오픈소스 라이선스입니다.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 4ndSYS</p>
        </div>
      </footer>
    </div>
  );
}
