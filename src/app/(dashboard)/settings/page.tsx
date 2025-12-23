"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
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
  const { auth, updatePassword } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isAuthenticated = auth.status === "authenticated";
  const isGuest = auth.status === "guest";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await updatePassword(newPassword);

      if (!result.success) {
        toast.error(result.error || "비밀번호 변경에 실패했습니다.");
        return;
      }

      toast.success("비밀번호가 변경되었습니다.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsChangingPassword(false);
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
          href="/projects"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          프로젝트 목록
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

        {/* 비밀번호 변경 - 회원만 */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                보안을 위해 정기적으로 비밀번호를 변경하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">새 비밀번호</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isChangingPassword}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isChangingPassword}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

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
      </div>
    </>
  );
}
