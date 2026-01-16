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
  FilePenLine,
  Loader2,
  PanelRight,
  Smartphone,
  Users,
  Pen,
  Cloud,
  Zap,
} from "lucide-react";
import { InstallPrompt } from "@/components/features/pwa";

const GUEST_NOTICE_KEY = "4ndsys:guest-notice-shown";

// Pixel/Retro 애니메이션 - 단계적 등장
const pixelAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  pixelReveal: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, ease: "linear" },
  },
};

const features = [
  {
    icon: BookOpen,
    title: "집필에 집중",
    description: "회차별 원고 관리, 0.5초 자동저장, 플롯 메모",
    image: "/images/landing/screenshot-editor-full.png",
    imageAlt: "에디터 화면",
    stats: ["ATK +50", "DEF +30"],
  },
  {
    icon: Users,
    title: "세계관 정리",
    description: "캐릭터 설정, 관계도, 커스텀 필드",
    image: "/images/landing/screenshot-characters.png",
    imageAlt: "등장인물 관리 화면",
    stats: ["INT +40", "WIS +35"],
  },
  {
    icon: PanelRight,
    title: "참조 집필",
    description: "시놉시스, 캐릭터 정보, 다른 회차 참조",
    image: "/images/landing/screenshot-workspace.png",
    imageAlt: "워크스페이스 화면",
    stats: ["SPD +45", "LUK +20"],
  },
  {
    icon: Smartphone,
    title: "어디서나 작업",
    description: "앱 설치, 오프라인 작업, 클라우드 동기화",
    image: "/images/landing/screenshot-project-dashboard.png",
    imageAlt: "프로젝트 대시보드",
    stats: ["HP +100", "MP +80"],
  },
];

const quickFeatures = [
  {
    icon: Pen,
    title: "완전 무료",
    description: "모든 기능 제한 없이",
    rarity: "legendary" as const,
  },
  {
    icon: Zap,
    title: "바로 시작",
    description: "회원가입 불필요",
    rarity: "epic" as const,
  },
  {
    icon: Cloud,
    title: "오프라인",
    description: "어디서든 집필",
    rarity: "rare" as const,
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

// 픽셀 아트 장식 아이콘
function PixelSword({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="14" y="0" width="2" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="6" y="8" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="2" y="10" width="2" height="2" />
      <rect x="0" y="12" width="2" height="2" />
      <rect x="2" y="12" width="2" height="2" />
      <rect x="4" y="12" width="2" height="2" />
      <rect x="0" y="14" width="2" height="2" />
    </svg>
  );
}

function PixelHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 14" fill="currentColor" className={className}>
      <rect x="2" y="0" width="4" height="2" />
      <rect x="10" y="0" width="4" height="2" />
      <rect x="0" y="2" width="2" height="2" />
      <rect x="4" y="2" width="2" height="2" />
      <rect x="6" y="2" width="4" height="2" />
      <rect x="10" y="2" width="2" height="2" />
      <rect x="14" y="2" width="2" height="2" />
      <rect x="0" y="4" width="16" height="2" />
      <rect x="0" y="6" width="16" height="2" />
      <rect x="2" y="8" width="12" height="2" />
      <rect x="4" y="10" width="8" height="2" />
      <rect x="6" y="12" width="4" height="2" />
    </svg>
  );
}

function PixelStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="7" y="0" width="2" height="2" />
      <rect x="7" y="2" width="2" height="2" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="0" y="6" width="16" height="2" />
      <rect x="2" y="8" width="12" height="2" />
      <rect x="4" y="10" width="3" height="2" />
      <rect x="9" y="10" width="3" height="2" />
      <rect x="3" y="12" width="2" height="2" />
      <rect x="11" y="12" width="2" height="2" />
      <rect x="2" y="14" width="2" height="2" />
      <rect x="12" y="14" width="2" height="2" />
    </svg>
  );
}

// 픽셀 스타일 로딩 바
function PixelLoadingBar() {
  return (
    <div className="flex gap-1">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-primary"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// CRT 스캔라인 오버레이
function CRTOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* 스캔라인 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
        }}
      />
      {/* 비네트 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          {/* 픽셀 로고 */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center border-4 border-foreground bg-primary shadow-[4px_4px_0_0_var(--foreground)]">
              <FilePenLine className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <PixelLoadingBar />

          <span className="font-pixel text-xs uppercase tracking-wider text-muted-foreground">
            Loading...
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
    <div className="min-h-screen bg-background relative">
      <CRTOverlay />

      {/* Header - 픽셀 스타일 네비게이션 바 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-foreground bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center border-4 border-foreground bg-primary shadow-[2px_2px_0_0_var(--foreground)] transition-all group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[4px_4px_0_0_var(--foreground)]">
              <FilePenLine className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-pixel text-sm tracking-wider">4ndSYS</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="pixel" size="sm">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section - 게임 타이틀 스크린 스타일 */}
        <section className="relative min-h-[calc(100vh-5rem)] flex items-center py-12 overflow-hidden">
          {/* 배경 픽셀 그리드 */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(var(--foreground) 1px, transparent 1px),
                  linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* 플로팅 픽셀 아이콘들 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-[10%]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <PixelHeart className="w-8 h-8 text-destructive/30" />
            </motion.div>
            <motion.div
              className="absolute top-40 right-[15%]"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            >
              <PixelStar className="w-10 h-10 text-[var(--pixel-gold)]/40" />
            </motion.div>
            <motion.div
              className="absolute bottom-32 left-[20%]"
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            >
              <PixelSword className="w-12 h-12 text-primary/30" />
            </motion.div>
          </div>

          <div className="mx-auto max-w-7xl px-4 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 텍스트 콘텐츠 */}
              <motion.div {...pixelAnimations.slideUp} className="relative z-10">
                {/* 레벨 배지 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="quest" size="lg" className="mb-6">
                    <PixelStar className="w-3 h-3" />
                    NEW QUEST AVAILABLE
                  </Badge>
                </motion.div>

                {/* 메인 타이틀 - 게임 타이틀 스타일 */}
                <h1 className="font-pixel text-3xl md:text-4xl lg:text-5xl leading-tight tracking-wider">
                  <span className="block text-foreground">
                    WRITER&apos;S
                  </span>
                  <span className="block text-primary">
                    QUEST
                  </span>
                </h1>

                <p className="mt-6 font-retro text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  웹소설 작가를 위한 무료 글쓰기 플랫폼
                  <br />
                  당신의 이야기를 시작하세요
                </p>

                {/* 아이템 획득 스타일 기능 배지 */}
                <div className="mt-8 space-y-3">
                  {quickFeatures.map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center border-4 border-foreground bg-card shadow-[2px_2px_0_0_var(--foreground)]">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant={feature.rarity} size="sm">
                          {feature.title}
                        </Badge>
                        <div className="font-retro text-sm text-muted-foreground mt-0.5">
                          {feature.description}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA 버튼들 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-10 flex flex-col gap-3 sm:flex-row"
                >
                  <Button
                    variant="quest"
                    size="xl"
                    onClick={handleStartClick}
                    className="group"
                  >
                    <PixelSword className="w-4 h-4" />
                    START GAME
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      &gt;
                    </motion.span>
                  </Button>
                  <Link href="/login">
                    <Button variant="pixel" size="xl" className="w-full">
                      CONTINUE
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* 히어로 이미지 - 게임 스크린샷 스타일 */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative"
                >
                  {/* 메인 이미지 컨테이너 - 게임 윈도우 스타일 */}
                  <div className="relative border-4 border-foreground bg-card shadow-[8px_8px_0_0_var(--foreground)]">
                    {/* 윈도우 타이틀 바 */}
                    <div className="border-b-4 border-foreground bg-primary px-3 py-2 flex items-center justify-between">
                      <span className="font-pixel text-[10px] text-primary-foreground uppercase">
                        Editor.exe
                      </span>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 border-2 border-primary-foreground/50" />
                        <div className="w-3 h-3 border-2 border-primary-foreground/50 bg-primary-foreground/30" />
                        <div className="w-3 h-3 border-2 border-destructive bg-destructive" />
                      </div>
                    </div>

                    {/* 스크린샷 */}
                    <div className="relative">
                      <Image
                        src="/images/landing/screenshot-editor-full.png"
                        alt="4ndSYS 에디터 화면"
                        width={800}
                        height={500}
                        className="w-full h-auto"
                        priority
                      />
                      {/* CRT 효과 오버레이 */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-[0.05]"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)",
                        }}
                      />
                    </div>
                  </div>

                  {/* 플로팅 스탯 배지들 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -left-4 top-1/4 hidden lg:block"
                  >
                    <Badge variant="hp" size="lg">
                      <PixelHeart className="w-3 h-3" />
                      AUTO SAVE
                    </Badge>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="absolute -right-4 bottom-1/4 hidden lg:block"
                  >
                    <Badge variant="mp" size="lg">
                      <Cloud className="w-3 h-3" />
                      CLOUD SYNC
                    </Badge>
                  </motion.div>
                </motion.div>
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
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="font-pixel text-[8px] uppercase tracking-wider">
                Scroll Down
              </span>
              <div className="flex flex-col gap-1">
                <div className="w-2 h-2 bg-current" />
                <div className="w-2 h-2 bg-current" />
                <div className="w-2 h-2 bg-current" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section - 스킬 트리 / 장비 스타일 */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30" />

          <div className="relative mx-auto max-w-7xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="pixel" className="mb-4">
                EQUIPMENT
              </Badge>
              <h2 className="font-pixel text-2xl md:text-3xl tracking-wider">
                YOUR TOOLS
              </h2>
              <p className="mt-4 font-retro text-lg text-muted-foreground">
                글쓰기에 필요한 모든 장비를 갖추세요
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full group hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_0_rgba(0,0,0,0.4)] transition-all duration-100">
                    {/* 아이템 이미지 */}
                    <div className="relative border-b-4 border-foreground overflow-hidden">
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        width={600}
                        height={300}
                        className="w-full h-auto"
                      />
                      {/* 레어도 표시 */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="quest" size="sm">
                          <PixelStar className="w-2 h-2" />
                          RARE
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center border-4 border-foreground bg-primary shadow-[2px_2px_0_0_var(--foreground)]">
                          <feature.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="font-pixel text-sm">
                            {feature.title}
                          </CardTitle>
                          {/* 스탯 표시 */}
                          <div className="flex gap-2 mt-1">
                            {feature.stats.map((stat) => (
                              <span
                                key={stat}
                                className="font-pixel text-[8px] text-primary"
                              >
                                {stat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="font-retro text-base text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - NPC 대화 스타일 */}
        <section className="relative py-24">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="pixel" className="mb-4">
                NPC GUIDE
              </Badge>
              <h2 className="font-pixel text-2xl md:text-3xl tracking-wider">
                HELP DESK
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
                      <CardTitle className="font-pixel text-[10px] leading-relaxed">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-retro text-sm text-muted-foreground">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - 게임 오버/컨티뉴 스크린 스타일 */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-3xl px-4 text-center"
          >
            {/* 게임 스타일 프레임 */}
            <div className="border-4 border-foreground bg-card p-8 md:p-12 shadow-[8px_8px_0_0_var(--foreground)]">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <PixelStar className="w-16 h-16 mx-auto text-[var(--pixel-gold)]" />
              </motion.div>

              <h2 className="mt-6 font-pixel text-xl md:text-2xl tracking-wider">
                READY TO START?
              </h2>

              <p className="mt-4 font-retro text-lg text-muted-foreground">
                회원가입 없이도 바로 시작할 수 있습니다
                <br />
                당신의 모험이 기다리고 있어요
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button variant="quest" size="xl" onClick={handleStartClick}>
                  <PixelSword className="w-4 h-4" />
                  NEW GAME
                </Button>
                <Link href="/signup">
                  <Button variant="pixel" size="xl">
                    CREATE ACCOUNT
                  </Button>
                </Link>
              </div>

              {/* 코인 삽입 텍스트 */}
              <motion.p
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-8 font-pixel text-[10px] text-muted-foreground uppercase"
              >
                Press Start to Continue
              </motion.p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer - 게임 크레딧 스타일 */}
      <footer className="relative border-t-4 border-foreground bg-card py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary">
                <FilePenLine className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-pixel text-xs">4ndSYS</span>
            </div>

            <div className="flex items-center gap-6 font-pixel text-[8px] text-muted-foreground uppercase">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/credits" className="hover:text-foreground transition-colors">
                Credits
              </Link>
            </div>

            <p className="font-pixel text-[8px] text-muted-foreground">
              &copy; 2025 4ndSYS
            </p>
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Guest Notice Dialog - RPG 대화창 스타일 */}
      <AlertDialog open={showGuestNotice} onOpenChange={setShowGuestNotice}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex h-12 w-12 items-center justify-center border-4 border-foreground bg-[var(--pixel-gold)] shadow-[2px_2px_0_0_var(--foreground)] mb-4">
              <PixelStar className="h-6 w-6 text-[var(--pixel-dark)]" />
            </div>
            <AlertDialogTitle className="font-pixel text-sm uppercase">
              Warning!
            </AlertDialogTitle>
            <AlertDialogDescription className="font-retro text-base leading-relaxed">
              지금 작성하는 내용은 이 기기에만 저장됩니다.
              <br />
              <span className="text-foreground font-semibold">
                다른 기기에서도 이어쓰려면 회원가입
              </span>
              을 해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3">
            <Link href="/signup">
              <Button variant="pixel" className="w-full sm:w-auto">
                Sign Up
              </Button>
            </Link>
            <AlertDialogAction
              onClick={handleGuestConfirm}
              className="w-full sm:w-auto"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
