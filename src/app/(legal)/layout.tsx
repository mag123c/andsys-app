import Link from "next/link";
import { FilePenLine } from "lucide-react";

export default function LegalLayout({
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

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-3xl">{children}</div>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <Link href="/terms" className="hover:underline">
            이용약관
          </Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:underline">
            개인정보처리방침
          </Link>
        </div>
      </footer>
    </div>
  );
}
