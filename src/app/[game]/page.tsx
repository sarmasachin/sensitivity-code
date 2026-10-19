import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { HomeScreen } from "@/components/home-screen";
import { gamePages } from "@/data/games";
import { listCodes } from "@/lib/codes";
import styles from "../page.module.css";

type PageProps = {
  params: Promise<{ game: string }>;
};

export function generateStaticParams() {
  return gamePages.map((item) => ({ game: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { game } = await params;
  const item = gamePages.find((page) => page.slug === game);
  if (!item) return { title: "Sensitivity Code" };
  return { title: `${item.name} Sensitivity Code` };
}

export default function GamePage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <GameScreen params={params} />
    </Suspense>
  );
}

async function GameScreen({ params }: PageProps) {
  await connection();
  const { game } = await params;
  const item = gamePages.find((page) => page.slug === game);
  if (!item) notFound();
  const codes = await listCodes({ game: item.name, sort: "latest" });
  return (
    <div className={styles.page}>
      <HomeScreen game={item.name} initialCodes={codes} />
    </div>
  );
}
