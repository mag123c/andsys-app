import Link from "next/link";
import { PenLine, Cloud, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: PenLine,
    title: "집중 모드 에디터",
    description: "방해 없이 글쓰기에만 집중할 수 있는 깔끔한 에디터",
  },
  {
    icon: Cloud,
    title: "오프라인 우선",
    description: "인터넷 없이도 작업하고, 온라인 시 자동 동기화",
  },
  {
    icon: Smartphone,
    title: "어디서나 접근",
    description: "PC, 태블릿, 모바일 어디서든 이어서 작성",
  },
  {
    icon: Zap,
    title: "자동 저장",
    description: "작성 중 자동 저장으로 데이터 손실 걱정 없음",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">Andsys</span>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">회원가입</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              당신의 이야기를
              <br />
              <span className="text-primary">자유롭게</span> 써내려가세요
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              웹소설 작가를 위한 무료 글쓰기 플랫폼.
              <br />
              오프라인에서도 작업하고, 어디서든 이어서 쓰세요.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/projects">
                <Button size="lg" className="w-full sm:w-auto">
                  지금 시작하기
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  로그인
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              회원가입 없이 바로 시작할 수 있어요
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">
              글쓰기에 집중하세요
            </h2>
            <p className="mt-3 text-center text-muted-foreground">
              복잡한 기능 대신, 정말 필요한 것만 담았습니다
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              지금 바로 시작하세요
            </h2>
            <p className="mt-3 text-muted-foreground">
              무료로 사용할 수 있으며, 게스트로 바로 시작할 수 있습니다
            </p>
            <div className="mt-8">
              <Link href="/projects">
                <Button size="lg">프로젝트 시작하기</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>Andsys - 웹소설 작가를 위한 글쓰기 플랫폼</p>
        </div>
      </footer>
    </div>
  );
}
