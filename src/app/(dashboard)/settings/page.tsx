"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Download, Loader2, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProjects } from "@/hooks/useProjects";
import { chapterLocalRepository } from "@/storage/local/chapter.local";
import { exportBackup, type BackupData } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const { auth } = useAuth();
  const { projects } = useProjects();
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  const isAuthenticated = auth.status === "authenticated";
  const isGuest = auth.status === "guest";

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

  if (auth.status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <nav className="mb-6">
        <Link
          href="/novels"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          소설 목록
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-1">계정 및 앱 설정을 관리합니다.</p>
      </header>

      <div className="space-y-6">
        {/* 프로필 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
            <CardDescription>계정 정보를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated ? (
              <>
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input value={auth.user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>표시 이름</Label>
                  <Input
                    value={auth.user.displayName || "설정되지 않음"}
                    disabled
                  />
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                게스트로 사용 중입니다.{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  회원가입
                </Link>
                하면 데이터를 클라우드에 저장할 수 있습니다.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 테마 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>테마</CardTitle>
            <CardDescription>앱의 외관을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                <Sun className="mr-2 h-4 w-4" />
                라이트
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                <Moon className="mr-2 h-4 w-4" />
                다크
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex-1"
              >
                <Monitor className="mr-2 h-4 w-4" />
                시스템
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 게스트 안내 */}
        {isGuest && (
          <Card>
            <CardHeader>
              <CardTitle>회원가입 안내</CardTitle>
              <CardDescription>
                현재 게스트로 사용 중입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                게스트 모드에서는 데이터가 이 브라우저에만 저장됩니다. 회원가입을 하면:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>데이터가 클라우드에 안전하게 백업됩니다</li>
                <li>다른 기기에서도 작업을 이어갈 수 있습니다</li>
                <li>기존 게스트 데이터가 자동으로 마이그레이션됩니다</li>
              </ul>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/signup">회원가입</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">로그인</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 데이터 관리 */}
        <Card>
          <CardHeader>
            <CardTitle>데이터 관리</CardTitle>
            <CardDescription>
              소설과 회차 데이터를 백업합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              모든 소설과 회차를 JSON 파일로 내보냅니다.
              {projects.length > 0 && ` (${projects.length}개 소설)`}
            </p>
            <Button
              onClick={handleExportBackup}
              disabled={isExporting || projects.length === 0}
              variant="outline"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  백업 중...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
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
