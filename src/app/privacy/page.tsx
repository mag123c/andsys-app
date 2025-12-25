import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "개인정보처리방침 - 4ndSYS",
  description: "4ndSYS 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로
          </Button>
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>개인정보처리방침</h1>
          <p className="text-muted-foreground">시행일: 2025년 1월 1일</p>

          <p>
            4ndSYS(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요시하며,
            「개인정보보호법」을 준수하고 있습니다. 본 개인정보처리방침을 통해
            이용자의 개인정보가 어떻게 수집, 이용, 보관, 파기되는지 안내드립니다.
          </p>

          <h2>1. 수집하는 개인정보 항목</h2>
          <p>서비스는 다음과 같은 개인정보를 수집합니다.</p>
          <h3>소셜 로그인 시 수집 항목</h3>
          <ul>
            <li>
              <strong>Google 로그인:</strong> 이메일 주소, 이름, 프로필 사진
            </li>
            <li>
              <strong>Discord 로그인:</strong> 이메일 주소, 사용자명, 프로필 사진
            </li>
          </ul>
          <h3>서비스 이용 과정에서 생성되는 정보</h3>
          <ul>
            <li>작성한 소설, 캐릭터, 시놉시스 등 콘텐츠 데이터</li>
            <li>서비스 이용 기록, 접속 로그</li>
          </ul>

          <h2>2. 개인정보의 수집 및 이용 목적</h2>
          <ul>
            <li>회원 식별 및 서비스 제공</li>
            <li>클라우드 동기화를 통한 데이터 백업</li>
            <li>서비스 개선 및 신규 기능 개발</li>
            <li>서비스 관련 공지사항 전달</li>
          </ul>

          <h2>3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            이용자의 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.
            단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
          </p>
          <ul>
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li>접속에 관한 기록: 3개월 (통신비밀보호법)</li>
          </ul>

          <h2>4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의한 경우</li>
          </ul>

          <h2>5. 개인정보 처리의 위탁</h2>
          <p>서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
          <table>
            <thead>
              <tr>
                <th>수탁업체</th>
                <th>위탁 업무</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase Inc.</td>
                <td>클라우드 데이터베이스 운영, 인증 서비스</td>
              </tr>
              <tr>
                <td>Vercel Inc.</td>
                <td>웹 호스팅 서비스</td>
              </tr>
            </tbody>
          </table>

          <h2>6. 이용자의 권리와 행사 방법</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ul>
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>
          <p>
            위 권리 행사는 서비스 내 설정 메뉴 또는 개인정보 보호책임자에게
            서면, 전화, 이메일로 연락하시면 처리해 드립니다.
          </p>

          <h2>7. 개인정보의 파기</h2>
          <p>
            서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
            불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
          </p>
          <ul>
            <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
            <li>종이 문서: 분쇄기로 분쇄 또는 소각</li>
          </ul>

          <h2>8. 개인정보 보호책임자</h2>
          <p>
            서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의
            불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
            지정하고 있습니다.
          </p>
          <ul>
            <li>
              <strong>개인정보 보호책임자:</strong> 장재호
            </li>
            <li>
              <strong>연락처:</strong> diehreo@gmail.com
            </li>
          </ul>

          <h2>9. 개인정보처리방침의 변경</h2>
          <p>
            이 개인정보처리방침은 법령, 정책 또는 서비스의 변경에 따라 내용이
            추가, 삭제 및 수정될 수 있습니다. 변경 시 서비스 내 공지사항을 통해
            안내드립니다.
          </p>
        </article>
      </div>
    </div>
  );
}
