"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
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
  Type,
  Link2,
  ChevronRight,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { useDesignTheme } from "@/components/providers/DesignThemeProvider";
import { useProjects } from "@/hooks/useProjects";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUserStats } from "@/hooks/useUserStats";
import { EDITOR_FONTS } from "@/components/features/editor/extensions";
import { chapterLocalRepository } from "@/storage/local/chapter.local";
import { exportBackup, type BackupData } from "@/lib/export";
import { DeleteAccountDialog } from "@/components/features/settings/DeleteAccountDialog";
import { ShareLinksModal } from "@/components/features/settings/ShareLinksModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/storage/remote/client";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const router = useRouter();
  const { auth } = useAuth();
  const { projects } = useProjects();
  const { settings, updateSettings } = useUserSettings();
  const { theme, setTheme } = useTheme();
  const { designTheme, setDesignTheme } = useDesignTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [shareLinksOpen, setShareLinksOpen] = useState(false);

  const isAuthenticated = auth.status === "authenticated";
  const stats = useUserStats();

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
      onOpenChange(false);
      router.push("/");
      toast.success("로그아웃되었습니다.");
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleFontChange = async (fontValue: string) => {
    try {
      await updateSettings({ defaultFont: fontValue });
      toast.success("기본 글꼴이 변경되었습니다.");
    } catch {
      toast.error("글꼴 변경에 실패했습니다.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>설정</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(85vh-80px)]">
            <div className="px-6 pb-6 space-y-4">
              {auth.status === "loading" ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* 프로필 */}
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {auth.user.avatarUrl && (
                              <AvatarImage src={auth.user.avatarUrl} alt={auth.user.displayName || "프로필"} />
                            )}
                            <AvatarFallback className="text-sm">
                              {auth.user.displayName?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{auth.user.displayName || "이름 없음"}</p>
                            <p className="text-xs text-muted-foreground truncate">{auth.user.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="shrink-0 h-8 text-xs"
                          >
                            {isLoggingOut ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                로그아웃
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">게스트</p>
                            <p className="text-xs text-muted-foreground">로그인하면 클라우드 백업 가능</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" className="h-8 text-xs" asChild onClick={() => onOpenChange(false)}>
                              <Link href="/signup">회원가입</Link>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs" asChild onClick={() => onOpenChange(false)}>
                              <Link href="/login">로그인</Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card>
                      <CardContent className="pt-3 pb-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                          <BookOpen className="h-3 w-3" />
                          <span className="text-[10px]">소설</span>
                        </div>
                        <p className="text-base font-semibold">{stats.totalProjects}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-3 pb-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                          <FileText className="h-3 w-3" />
                          <span className="text-[10px]">회차</span>
                        </div>
                        <p className="text-base font-semibold">{stats.totalChapters}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-3 pb-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                          <LetterText className="h-3 w-3" />
                          <span className="text-[10px]">글자</span>
                        </div>
                        <p className="text-base font-semibold">
                          {stats.totalWords >= 10000
                            ? `${(stats.totalWords / 10000).toFixed(1)}만`
                            : stats.totalWords.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

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

                  {/* 디자인 스타일 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">디자인 스타일</CardTitle>
                      </div>
                      <CardDescription>
                        앱의 전체적인 디자인 스타일을 선택합니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant={designTheme === "default" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDesignTheme("default")}
                          className="flex-1"
                        >
                          기본
                        </Button>
                        <Button
                          variant={designTheme === "digital" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDesignTheme("digital")}
                          className="flex-1"
                        >
                          디지털
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 기본 글꼴 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">기본 글꼴</CardTitle>
                      </div>
                      <CardDescription>
                        에디터에서 사용할 기본 글꼴을 선택합니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {EDITOR_FONTS.map((font) => (
                          <Button
                            key={font.value}
                            variant={settings.defaultFont === font.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFontChange(font.value)}
                            className="justify-start"
                            style={{ fontFamily: font.value }}
                          >
                            {font.name}
                          </Button>
                        ))}
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

                  {/* 공유 링크 관리 (로그인 사용자만) */}
                  {isAuthenticated && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base">공유 링크</CardTitle>
                        </div>
                        <CardDescription>
                          생성한 공유 링크를 관리합니다.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => setShareLinksOpen(true)}
                        >
                          공유 링크 관리
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* 계정 관리 (로그인 사용자만) */}
                  {isAuthenticated && (
                    <Card className="border-destructive/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-destructive">계정 관리</CardTitle>
                        <CardDescription>
                          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DeleteAccountDialog />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 공유 링크 관리 모달 */}
      <ShareLinksModal open={shareLinksOpen} onOpenChange={setShareLinksOpen} />
    </>
  );
}
