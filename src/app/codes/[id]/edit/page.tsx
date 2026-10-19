import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { EditScreen } from "@/components/edit-screen";
import { findCode, listGameNames } from "@/lib/codes";
import styles from "../../../page.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const item = await findCode(id);
  if (!item) return { title: "Edit code" };
  return { title: `Edit ${item.phone}` };
}

export default function EditPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <EditLoader params={params} />
    </Suspense>
  );
}

async function EditLoader({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const [item, games] = await Promise.all([findCode(id), listGameNames()]);
  if (!item) notFound();
  return (
    <div className={styles.page}>
      <EditScreen item={item} games={games} />
    </div>
  );
}
