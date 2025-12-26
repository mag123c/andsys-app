"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Database,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createChunhyangMockup } from "@/lib/mockup/create-mockup";

export default function AdminPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [isCreatingMockup, setIsCreatingMockup] = useState(false);
  const [mockupCreated, setMockupCreated] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const userEmail =
    auth.status === "authenticated" ? auth.user.email : "Unknown";
  const userId = auth.status === "authenticated" ? auth.user.id : null;

  const handleCreateMockupData = async () => {
    setIsCreatingMockup(true);
    try {
      const result = await createChunhyangMockup(userId, null);

      if (result.success && result.projectId) {
        setMockupCreated(true);
        setCreatedProjectId(result.projectId);
        toast.success("춘향전 목업 데이터가 생성되었습니다.");
      } else {
        toast.error(result.error || "목업 데이터 생성에 실패했습니다.");
      }
    } catch {
      toast.error("목업 데이터 생성에 실패했습니다.");
    } finally {
      setIsCreatingMockup(false);
    }
  };

  const handleGoToProject = () => {
    if (createdProjectId) {
      router.push(`/novels/${createdProjectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/novels"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                돌아가기
              </Link>
              <h1 className="text-xl font-bold">어드민</h1>
            </div>
            <span className="text-sm text-muted-foreground">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                목업 데이터
              </CardTitle>
              <CardDescription>
                메인페이지 스크린샷용 데모 소설 데이터를 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>생성될 데이터:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>춘향전 소설 프로젝트</li>
                  <li>시놉시스</li>
                  <li>등장인물 (춘향, 이도령, 월매, 변학도)</li>
                  <li>인물 관계도</li>
                  <li>회차 3~5개</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateMockupData}
                  disabled={isCreatingMockup || mockupCreated}
                >
                  {isCreatingMockup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : mockupCreated ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      생성 완료
                    </>
                  ) : (
                    "목업 데이터 생성"
                  )}
                </Button>
                {mockupCreated && createdProjectId && (
                  <Button variant="outline" onClick={handleGoToProject}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    프로젝트 보기
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
