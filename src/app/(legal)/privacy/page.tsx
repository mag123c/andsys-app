import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 - 4ndSYS",
  description: "4ndSYS 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">개인정보처리방침</h1>
        <p className="text-muted-foreground">
          시행일: 2025년 12월 26일
        </p>
      </div>

      {/* 서문 */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            4ndSYS(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요시하며,
            「개인정보보호법」을 준수하고 있습니다. 본 개인정보처리방침을 통해
            이용자의 개인정보가 어떻게 수집, 이용, 보관, 파기되는지 안내드립니다.
          </p>
        </CardContent>
      </Card>

      {/* 1. 수집하는 개인정보 항목 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">1</Badge>
            수집하는 개인정보 항목
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            서비스는 다음과 같은 개인정보를 수집합니다.
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">소셜 로그인 시 수집 항목</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">Google 로그인:</span>
                  이메일 주소, 이름, 프로필 사진
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">Discord 로그인:</span>
                  이메일 주소, 사용자명, 프로필 사진
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">서비스 이용 과정에서 생성되는 정보</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>작성한 소설, 캐릭터, 시놉시스 등 콘텐츠 데이터</li>
                <li>서비스 이용 기록, 접속 로그</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 개인정보의 수집 및 이용 목적 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">2</Badge>
            개인정보의 수집 및 이용 목적
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>회원 식별 및 서비스 제공</li>
            <li>클라우드 동기화를 통한 데이터 백업</li>
            <li>서비스 개선 및 신규 기능 개발</li>
            <li>서비스 관련 공지사항 전달</li>
          </ul>
        </CardContent>
      </Card>

      {/* 3. 개인정보의 보유 및 이용 기간 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">3</Badge>
            개인정보의 보유 및 이용 기간
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            이용자의 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.
            단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
          </p>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">계약 또는 청약철회 등에 관한 기록</span>
              <Badge variant="outline">5년 (전자상거래법)</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">접속에 관한 기록</span>
              <Badge variant="outline">3개월 (통신비밀보호법)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. 개인정보의 제3자 제공 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">4</Badge>
            개인정보의 제3자 제공
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의한 경우</li>
          </ul>
        </CardContent>
      </Card>

      {/* 5. 개인정보 처리의 위탁 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">5</Badge>
            개인정보 처리의 위탁
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.
          </p>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>수탁업체</TableHead>
                  <TableHead>위탁 업무</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Supabase Inc.</TableCell>
                  <TableCell className="text-muted-foreground">클라우드 데이터베이스 운영, 인증 서비스</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Vercel Inc.</TableCell>
                  <TableCell className="text-muted-foreground">웹 호스팅 서비스</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 6. 이용자의 권리와 행사 방법 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">6</Badge>
            이용자의 권리와 행사 방법
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["개인정보 열람 요구", "오류 정정 요구", "삭제 요구", "처리정지 요구"].map((item) => (
              <div key={item} className="rounded-lg border p-3 text-sm text-center">
                {item}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            위 권리 행사는 서비스 내 설정 메뉴 또는 개인정보 보호책임자에게
            서면, 전화, 이메일로 연락하시면 처리해 드립니다.
          </p>
        </CardContent>
      </Card>

      {/* 7. 개인정보의 파기 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">7</Badge>
            개인정보의 파기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
            불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
            <li>종이 문서: 분쇄기로 분쇄 또는 소각</li>
          </ul>
        </CardContent>
      </Card>

      {/* 8. 개인정보 보호책임자 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">8</Badge>
            개인정보 보호책임자
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의
            불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
            지정하고 있습니다.
          </p>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">개인정보 보호책임자:</span>
              <span className="font-medium">장재호</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href="mailto:diehreo@gmail.com" className="text-primary hover:underline">
                diehreo@gmail.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 9. 개인정보처리방침의 변경 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">9</Badge>
            개인정보처리방침의 변경
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            이 개인정보처리방침은 법령, 정책 또는 서비스의 변경에 따라 내용이
            추가, 삭제 및 수정될 수 있습니다. 변경 시 서비스 내 공지사항을 통해
            안내드립니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
