import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { HomeScreen } from "@/components/home-screen";
import { listCodes } from "@/lib/codes";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "BGMI Lite Sensitivity Code",
};

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeLoader />
    </Suspense>
  );
}

async function HomeLoader() {
  await connection();
  const codes = await listCodes({ game: "BGMI Lite", sort: "latest" });
  return (
    <div className={styles.page}>
      <HomeScreen game="BGMI Lite" initialCodes={codes} />
    </div>
  );
}
