import Link from "next/link";
import { FilePenLine } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <FilePenLine className="h-6 w-6" />
            <span className="text-xl font-bold">4ndSYS</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <Link href="/novels" className="hover:underline">
            게스트로 시작하기
          </Link>
        </div>
      </footer>
    </div>
  );
}
