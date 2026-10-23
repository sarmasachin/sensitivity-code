import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CodeDetail } from "@/components/code-detail";
import { findPublicCode } from "@/lib/codes";

type PageProps = {
  params: Promise<{ game: string; phone: string; name: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { game, phone, name } = await params;
  const item = await findPublicCode(game, phone, name);
  if (!item) return { title: "Sensitivity code" };
  return { title: `${item.game} Sensitivity Code for ${item.phone}` };
}

export default function DetailsPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <DetailsLoader params={params} />
    </Suspense>
  );
}

async function DetailsLoader({ params }: PageProps) {
  await connection();
  const { game, phone, name } = await params;
  const item = await findPublicCode(game, phone, name);
  if (!item) notFound();
  return <CodeDetail item={item} />;
}
