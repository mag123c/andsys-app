"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocalStorageBoolean } from "@/hooks/useLocalStorage";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  PanelRight,
  Smartphone,
  Users,
  Pen,
  Cloud,
  Zap,
  Feather,
  BookMarked,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Shield,
} from "lucide-react";
import { InstallPrompt } from "@/components/features/pwa";

const GUEST_NOTICE_KEY = "4ndsys:guest-notice-shown";

// Paper & Ink 애니메이션 - 부드럽고 우아한
const paperAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  slideUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  gentleReveal: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const features = [
  {
    icon: BookOpen,
    title: "집필에 집중",
    description: "회차별 원고 관리, 0.5초 자동저장, 플롯 메모로 창작에만 집중하세요.",
    image: "/images/landing/screenshot-editor-full.png",
    imageAlt: "에디터 화면",
  },
  {
    icon: Users,
    title: "세계관 정리",
    description: "캐릭터 설정과 관계도, 커스텀 필드로 복잡한 세계관을 체계적으로.",
    image: "/images/landing/screenshot-characters.png",
    imageAlt: "등장인물 관리 화면",
  },
  {
    icon: PanelRight,
    title: "참조 집필",
    description: "시놉시스, 캐릭터 정보, 다른 회차를 참조하며 일관성 있는 글쓰기.",
    image: "/images/landing/screenshot-workspace.png",
    imageAlt: "워크스페이스 화면",
  },
  {
    icon: Smartphone,
    title: "어디서나 작업",
    description: "앱 설치 후 오프라인에서도 작업, 클라우드 동기화로 이어쓰기.",
    image: "/images/landing/screenshot-project-dashboard.png",
    imageAlt: "프로젝트 대시보드",
  },
];

const quickFeatures = [
  {
    icon: Sparkles,
    title: "완전 무료",
    description: "모든 기능 제한 없이",
  },
  {
    icon: Zap,
    title: "바로 시작",
    description: "회원가입 없이도",
  },
  {
    icon: Cloud,
    title: "오프라인 지원",
    description: "언제 어디서든",
  },
];

const faqs = [
  {
    question: "내 소설은 어디에 저장되나요?",
    answer:
      "게스트는 현재 브라우저에만 저장됩니다. 회원가입하면 서버에 안전하게 백업됩니다.",
  },
  {
    question: "다른 사람이 내 소설을 볼 수 있나요?",
    answer: "아니요, 본인만 접근할 수 있습니다. 모든 데이터는 안전하게 관리됩니다.",
  },
  {
    question: "브라우저 데이터를 삭제하면?",
    answer:
      "게스트는 데이터가 삭제됩니다. 회원이라면 다시 로그인하면 복구됩니다.",
  },
  {
    question: "게스트에서 회원가입하면?",
    answer: "게스트로 작성한 소설은 회원가입 후 자동으로 계정에 연동됩니다.",
  },
  {
    question: "특정 회차만 공유할 수 있나요?",
    answer:
      "네, 회원이라면 만료 시간과 비밀번호 설정이 가능한 공유 링크를 만들 수 있습니다.",
  },
  {
    question: "다른 기기에서도 이어쓸 수 있나요?",
    answer: "회원가입하시면 어떤 기기에서든 로그인만 하면 이어쓸 수 있습니다.",
  },
];

// 우아한 로딩 인디케이터
function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-accent"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-accent"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-accent"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}

// 장식용 인용부호
function QuoteMark({ className }: { className?: string }) {
  return (
    <span className={`font-serif text-accent/20 select-none ${className}`}>
      "
    </span>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [showGuestNotice, setShowGuestNotice] = useState(false);
  const [hasSeenNotice, setHasSeenNotice] = useLocalStorageBoolean(
    GUEST_NOTICE_KEY,
    false
  );

  const isLoading = auth.status === "loading";
  const isAuthenticated = auth.status === "authenticated";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/novels");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          {/* 로고 */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-paper">
            <Feather className="h-7 w-7 text-primary-foreground" />
          </div>

          <LoadingIndicator />

          <span className="font-sans text-sm text-muted-foreground">
            불러오는 중...
          </span>
        </motion.div>
      </div>
    );
  }

  const handleStartClick = () => {
    if (hasSeenNotice) {
      router.push("/novels");
    } else {
      setShowGuestNotice(true);
    }
  };

  const handleGuestConfirm = () => {
    setHasSeenNotice(true);
    setShowGuestNotice(false);
    router.push("/novels");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - 미니멀 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-shadow group-hover:shadow-md">
              <Feather className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium tracking-tight">4ndSYS</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                시작하기
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section - 문학적 감성 */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-16 overflow-hidden">
          {/* 배경 텍스처 */}
          <div className="absolute inset-0 opacity-[0.015]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="mx-auto max-w-6xl px-4 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* 텍스트 콘텐츠 */}
              <motion.div {...paperAnimations.slideUp} className="relative z-10">
                {/* 서브타이틀 */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-sans text-sm text-accent font-medium tracking-wide mb-4"
                >
                  웹소설 작가를 위한 글쓰기 플랫폼
                </motion.p>

                {/* 메인 타이틀 */}
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight">
                  <span className="block text-foreground">
                    당신의 이야기,
                  </span>
                  <span className="block text-foreground">
                    여기서 시작됩니다
                  </span>
                </h1>

                <p className="mt-6 font-sans text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  집필에만 집중할 수 있는 깔끔한 에디터,
                  <br className="hidden sm:block" />
                  체계적인 회차 관리와 캐릭터 설정까지.
                </p>

                {/* 핵심 기능 배지 */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {quickFeatures.map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <feature.icon className="h-4 w-4 text-accent" />
                      <span className="font-sans text-sm font-medium">{feature.title}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA 버튼들 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-10 flex flex-col gap-3 sm:flex-row"
                >
                  <Button
                    size="xl"
                    onClick={handleStartClick}
                    className="group"
                  >
                    지금 바로 시작하기
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Link href="/login">
                    <Button variant="outline" size="xl" className="w-full">
                      로그인
                    </Button>
                  </Link>
                </motion.div>

                {/* 신뢰 배지 */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 font-sans text-sm text-muted-foreground flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  회원가입 없이 무료로 시작, 언제든 데이터 백업
                </motion.p>
              </motion.div>

              {/* 히어로 이미지 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative"
              >
                <div className="relative">
                  {/* 메인 이미지 컨테이너 */}
                  <div className="relative rounded-xl border border-border/50 bg-card overflow-hidden shadow-paper-lg">
                    <Image
                      src="/images/landing/screenshot-editor-full.png"
                      alt="4ndSYS 에디터 화면"
                      width={800}
                      height={500}
                      className="w-full h-auto"
                      priority
                    />
                  </div>

                  {/* 플로팅 배지 - 자동저장 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -left-4 top-1/4 hidden lg:block"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border shadow-paper">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-sans text-sm font-medium">0.5초 자동저장</span>
                    </div>
                  </motion.div>

                  {/* 플로팅 배지 - 클라우드 */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="absolute -right-4 bottom-1/4 hidden lg:block"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border shadow-paper">
                      <Cloud className="w-4 h-4 text-sky-500" />
                      <span className="font-sans text-sm font-medium">클라우드 동기화</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* 스크롤 인디케이터 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="font-sans text-xs">더 알아보기</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section - 기능 소개 */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30" />

          <div className="relative mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="font-sans text-sm text-accent font-medium tracking-wide mb-3">
                주요 기능
              </p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
                글쓰기에 필요한 모든 것
              </h2>
              <p className="mt-4 font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                복잡한 기능은 덜어내고, 정말 필요한 것만 담았습니다.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full group hover:shadow-paper-lg transition-shadow duration-300">
                    {/* 이미지 */}
                    <div className="relative border-b border-border overflow-hidden rounded-t-lg">
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        width={600}
                        height={300}
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <feature.icon className="h-5 w-5 text-accent" />
                        </div>
                        <CardTitle className="font-serif text-lg">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="font-sans text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - 자주 묻는 질문 */}
        <section className="relative py-24">
          <div className="mx-auto max-w-5xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="font-sans text-sm text-accent font-medium tracking-wide mb-3">
                FAQ
              </p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
                자주 묻는 질문
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-sans text-sm font-semibold leading-relaxed">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - 시작하기 */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-2xl px-4 text-center"
          >
            <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-paper">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mx-auto mb-6">
                <Feather className="h-7 w-7 text-primary-foreground" />
              </div>

              <h2 className="font-serif text-2xl md:text-3xl tracking-tight">
                지금 바로 시작하세요
              </h2>

              <p className="mt-4 font-sans text-lg text-muted-foreground">
                회원가입 없이도 모든 기능을 사용할 수 있습니다.
                <br className="hidden sm:block" />
                당신의 이야기가 기다리고 있어요.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="xl" onClick={handleStartClick}>
                  <Pen className="w-4 h-4" />
                  글쓰기 시작
                </Button>
                <Link href="/signup">
                  <Button variant="outline" size="xl">
                    계정 만들기
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer - 미니멀 푸터 */}
      <footer className="relative border-t border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Feather className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-base font-medium">4ndSYS</span>
            </div>

            <div className="flex items-center gap-6 font-sans text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/credits" className="hover:text-foreground transition-colors">
                크레딧
              </Link>
            </div>

            <p className="font-sans text-sm text-muted-foreground">
              © 2025 4ndSYS
            </p>
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Guest Notice Dialog - 깔끔한 알림 */}
      <AlertDialog open={showGuestNotice} onOpenChange={setShowGuestNotice}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 mb-4">
              <BookMarked className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="font-serif text-lg">
              잠깐, 알아두세요
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-base leading-relaxed">
              지금 작성하는 내용은 이 기기에만 저장됩니다.
              <br />
              <span className="text-foreground font-medium">
                다른 기기에서도 이어쓰려면 회원가입
              </span>
              을 권장합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3">
            <Link href="/signup">
              <Button variant="outline" className="w-full sm:w-auto">
                회원가입
              </Button>
            </Link>
            <AlertDialogAction
              onClick={handleGuestConfirm}
              className="w-full sm:w-auto"
            >
              게스트로 계속
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
