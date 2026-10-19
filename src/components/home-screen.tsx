"use client";

import { useState } from "react";
import type { SensitivityCode } from "@/lib/code-record";
import { Gallery } from "./gallery";
import { Hero } from "./hero";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./home-screen.module.css";

export function HomeScreen({
  game = "All",
  initialCodes = [],
}: {
  game?: string;
  initialCodes?: SensitivityCode[];
}) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <>
      <SiteHeader onGate={setNotice} />
      <main className={styles.main}>
        <Hero game={game} />
        <Gallery game={game} notice={notice} onGate={setNotice} initialCodes={initialCodes} />
      </main>
      <SiteFooter />
    </>
  );
}
