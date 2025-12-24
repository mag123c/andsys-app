"use client";

import { use } from "react";
import { SynopsisEditor } from "@/components/features/synopsis";

interface SynopsisPageProps {
  params: Promise<{ id: string }>;
}

export default function SynopsisPage({ params }: SynopsisPageProps) {
  const { id } = use(params);

  return (
    <div className="h-full">
      <SynopsisEditor projectId={id} className="h-full" />
    </div>
  );
}
