"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Download,
  Loader2,
  Sun,
  Moon,
  Monitor,
  User,
  LogOut,
  BookOpen,
  FileText,
  LetterText,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProjects } from "@/hooks/useProjects";
import { chapterLocalRepository } from "@/storage/local/chapter.local";
import { exportBackup, type BackupData } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/storage/remote/client";

export default function SettingsPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const { projects } = useProjects();
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = auth.status === "authenticated";

  // 통계 계산
  const [stats, setStats] = useState({ totalProjects: 0, totalChapters: 0, totalWords: 0 });

  useEffect(() => {
    async function calculateStats() {
      let totalChapters = 0;
      let totalWords = 0;

      for (const project of projects) {
        const chapters = await chapterLocalRepository.getByProjectId(project.id);
        totalChapters += chapters.length;
        totalWords += chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
      }

      setStats({
        totalProjects: projects.length,
        totalChapters,
        totalWords,
      });
    }

    if (projects.length > 0) {
      calculateStats();
    } else {
      setStats({ totalProjects: 0, totalChapters: 0, totalWords: 0 });
    }
  }, [projects]);

  const handleExportBackup = async () => {
    setIsExporting(true);

    try {
      const backupProjects = await Promise.all(
        projects.map(async (project) => {
          const chapters = await chapterLocalRepository.getByProjectId(project.id);
          return {
            id: project.id,
            title: project.title,
            description: project.description,
            genre: project.genre,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            chapters: chapters.map((chapter) => ({
              id: chapter.id,
              title: chapter.title,
              content: chapter.content,
              wordCount: chapter.wordCount,
              order: chapter.order,
              createdAt: chapter.createdAt.toISOString(),
              updatedAt: chapter.updatedAt.toISOString(),
            })),
          };
        })
      );

      const backup: BackupData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        projects: backupProjects,
      };

      exportBackup(backup);
      toast.success("백업 파일이 다운로드되었습니다.");
    } catch {
      toast.error("백업 생성에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      toast.success("로그아웃되었습니다.");
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (auth.status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <nav className="mb-4">
        <Link
          href="/novels"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          소설 목록
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-xl font-bold">설정</h1>
      </header>

      <div className="max-w-2xl space-y-4">
        {/* 프로필 + 통계 */}
        <Card>
          <CardContent className="pt-6">
            {isAuthenticated ? (
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  {auth.user.avatarUrl && (
                    <AvatarImage src={auth.user.avatarUrl} alt={auth.user.displayName || "프로필"} />
                  )}
                  <AvatarFallback>
                    {auth.user.displayName?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{auth.user.displayName || "이름 없음"}</p>
                  <p className="text-sm text-muted-foreground truncate">{auth.user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="shrink-0"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-1" />
                      로그아웃
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">게스트</p>
                  <p className="text-sm text-muted-foreground">로그인하면 클라우드 백업을 사용할 수 있습니다</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href="/signup">회원가입</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">로그인</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* 통계 */}
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="text-xs">소설</span>
                </div>
                <p className="text-lg font-semibold">{stats.totalProjects}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="text-xs">회차</span>
                </div>
                <p className="text-lg font-semibold">{stats.totalChapters}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <LetterText className="h-3.5 w-3.5" />
                  <span className="text-xs">글자</span>
                </div>
                <p className="text-lg font-semibold">
                  {stats.totalWords >= 10000
                    ? `${(stats.totalWords / 10000).toFixed(1)}만`
                    : stats.totalWords.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 테마 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">테마</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                <Sun className="mr-1.5 h-4 w-4" />
                라이트
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                <Moon className="mr-1.5 h-4 w-4" />
                다크
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex-1"
              >
                <Monitor className="mr-1.5 h-4 w-4" />
                시스템
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">데이터 백업</CardTitle>
            <CardDescription>
              모든 소설과 회차를 JSON 파일로 내보냅니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportBackup}
              disabled={isExporting || projects.length === 0}
              variant="outline"
              size="sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  백업 중...
                </>
              ) : (
                <>
                  <Download className="mr-1.5 h-4 w-4" />
                  전체 백업 다운로드
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
