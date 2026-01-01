import { redirect } from "next/navigation";

interface RelationshipsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RelationshipsPage({
  params,
}: RelationshipsPageProps) {
  const { id } = await params;
  redirect(`/novels/${id}/characters`);
}
