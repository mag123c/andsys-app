import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
          <p className="mt-2 text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline">홈으로</Button>
        </Link>
        <Link href="/projects">
          <Button>소설 목록</Button>
        </Link>
      </div>
    </main>
  );
}
