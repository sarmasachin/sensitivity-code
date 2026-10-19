import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { HomeScreen } from "@/components/home-screen";
import { listCodes } from "@/lib/codes";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Sensitivity Codes",
};

export default function AllGamesPage() {
  return (
    <Suspense fallback={null}>
      <AllLoader />
    </Suspense>
  );
}

async function AllLoader() {
  await connection();
  const codes = await listCodes({ game: "All", sort: "latest" });
  return (
    <div className={styles.page}>
      <HomeScreen game="All" initialCodes={codes} />
    </div>
  );
}
