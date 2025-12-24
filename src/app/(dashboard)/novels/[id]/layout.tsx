import { NovelDetailLayout } from "@/components/features/workspace";

export default function NovelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NovelDetailLayout>{children}</NovelDetailLayout>;
}
