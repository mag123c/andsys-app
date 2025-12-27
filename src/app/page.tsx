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
import { BookOpen, FilePenLine, Loader2, Network, PanelRight, Users } from "lucide-react";

const GUEST_NOTICE_KEY = "4ndsys:guest-notice-shown";

// 애니메이션 설정
const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.2 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

const features = [
  {
    icon: BookOpen,
    title: "회차 관리",
    description: "웹소설 연재 구조에 맞춘 회차별 원고 관리. 각 회차의 글자수를 실시간으로 확인하세요.",
    image: "/images/landing/screenshot-project-dashboard.png",
    imageAlt: "회차 관리 화면",
  },
  {
    icon: PanelRight,
    title: "집필 워크스페이스",
    description: "시놉시스와 등장인물을 참조하며 집필. 오른쪽 패널에서 필요한 정보를 바로 확인하세요.",
    image: "/images/landing/screenshot-workspace.png",
    imageAlt: "워크스페이스 화면",
  },
  {
    icon: Users,
    title: "등장인물 관리",
    description: "캐릭터 설정과 커스텀 필드로 인물 정보를 체계적으로 정리하세요.",
    image: "/images/landing/screenshot-characters.png",
    imageAlt: "등장인물 관리 화면",
  },
  {
    icon: Network,
    title: "관계도 시각화",
    description: "복잡한 인물 관계를 한눈에 파악할 수 있는 인터랙티브 그래프.",
    image: "/images/landing/screenshot-relationships.png",
    imageAlt: "관계도 화면",
  },
];

const faqs = [
  {
    question: "내 소설은 어디에 저장되나요?",
    answer:
      "게스트로 사용하시면 현재 브라우저에만 저장됩니다. 회원가입을 하시면 클라우드에 안전하게 백업되어 다른 기기에서도 이어서 작업할 수 있습니다.",
  },
  {
    question: "다른 사람이 내 소설을 볼 수 있나요?",
    answer:
      "아니요, 본인만 접근할 수 있습니다. 다른 사용자의 소설에 접근하는 기능은 제공하지 않으며, 모든 데이터는 개인별로 안전하게 관리됩니다.",
  },
  {
    question: "무료인가요?",
    answer:
      "네, 모든 기능을 무료로 사용할 수 있습니다. 4ndSYS는 무료 서비스로 계속 운영될 예정입니다.",
  },
  {
    question: "브라우저 데이터를 삭제하면 어떻게 되나요?",
    answer:
      "게스트 사용자는 브라우저 데이터(쿠키, 캐시 등)를 삭제하면 저장된 소설도 함께 삭제됩니다. 회원가입을 하시면 클라우드에 백업되어 다시 로그인하면 복구됩니다.",
  },
  {
    question: "게스트로 쓰다가 회원가입하면 기존 데이터는 어떻게 되나요?",
    answer:
      "걱정 마세요! 게스트로 작성한 소설은 회원가입 후 자동으로 계정에 연동됩니다. 기존 데이터가 사라지지 않고 그대로 유지됩니다.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [showGuestNotice, setShowGuestNotice] = useState(false);
  const [hasSeenNotice, setHasSeenNotice] = useState(true);

  const isLoading = auth.status === "loading";
  const isAuthenticated = auth.status === "authenticated";

  useEffect(() => {
    const seen = localStorage.getItem(GUEST_NOTICE_KEY);
    setHasSeenNotice(!!seen);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/novels");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    localStorage.setItem(GUEST_NOTICE_KEY, "true");
    setShowGuestNotice(false);
    router.push("/novels");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FilePenLine className="h-6 w-6" />
            <span className="text-xl font-bold">4ndSYS</span>
          </Link>
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
        {/* Hero Section */}
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <motion.div {...animations.fadeInLeft}>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  당신의 이야기를
                  <br />
                  <span className="text-primary">자유롭게</span> 써내려가세요
                </h1>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                  웹소설 작가를 위한 무료 글쓰기 플랫폼.
                  <br />
                  회차, 등장인물, 관계도까지 한 곳에서 관리하세요.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" className="w-full sm:w-auto" onClick={handleStartClick}>
                    지금 시작하기
                  </Button>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      로그인
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Hero Image */}
              <motion.div {...animations.fadeInRight} className="relative">
                <div className="relative rounded-xl border bg-muted/30 shadow-2xl overflow-hidden">
                  <Image
                    src="/images/landing/screenshot-editor.png"
                    alt="4ndSYS 에디터 화면"
                    width={800}
                    height={500}
                    className="w-full h-auto"
                    priority
                  />
                </div>
                {/* Decorative gradient */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-2xl font-bold md:text-3xl">
                글쓰기에 집중하세요
              </h2>
              <p className="mt-3 text-muted-foreground">
                복잡한 기능 대신, 정말 필요한 것만 담았습니다
              </p>
            </motion.div>

            <div className="space-y-24">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`grid lg:grid-cols-2 gap-8 items-center ${
                    index % 2 === 1 ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  {/* Text */}
                  <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Image */}
                  <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                    <div className="relative rounded-xl border bg-background shadow-lg overflow-hidden">
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        width={600}
                        height={400}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t py-20">
          <div className="mx-auto max-w-5xl px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center text-2xl font-bold md:text-3xl"
            >
              자주 묻는 질문
            </motion.h2>
            <motion.div
              variants={animations.staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={animations.fadeInUp}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-muted/30 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl px-4 text-center"
          >
            <h2 className="text-2xl font-bold md:text-3xl">
              지금 바로 시작하세요
            </h2>
            <p className="mt-4 text-muted-foreground">
              회원가입 없이도 바로 사용할 수 있습니다.
              <br />
              당신의 이야기가 기다리고 있어요.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={handleStartClick}>
                무료로 시작하기
              </Button>
              <Link href="/signup">
                <Button variant="outline" size="lg">
                  회원가입
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 4ndSYS</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/terms" className="hover:text-foreground">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              개인정보처리방침
            </Link>
            <Link href="/credits" className="hover:text-foreground">
              크레딧
            </Link>
          </div>
        </div>
      </footer>

      {/* Guest Notice Dialog */}
      <AlertDialog open={showGuestNotice} onOpenChange={setShowGuestNotice}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>잠깐, 알아두세요!</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              지금 작성하는 내용은 이 기기에만 저장돼요.
              <br />
              <span className="text-foreground font-medium">
                다른 기기에서도 이어쓰려면 회원가입
              </span>
              을 해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Link href="/signup">
              <Button variant="outline">회원가입하기</Button>
            </Link>
            <AlertDialogAction onClick={handleGuestConfirm}>
              이대로 시작하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
