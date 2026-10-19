import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CodeDetail } from "@/components/code-detail";
import { findCode } from "@/lib/codes";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const item = await findCode(id);
  if (!item) return { title: "Sensitivity code" };
  return { title: `${item.game} Sensitivity Code for ${item.phone}` };
}

export default function CodePage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <CodeLoader params={params} />
    </Suspense>
  );
}

async function CodeLoader({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const item = await findCode(id);
  if (!item) notFound();
  return <CodeDetail item={item} />;
}
