"use client";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function InfoPage({ title }: { title: string }) {
  return (
    <>
      <SiteHeader onGate={() => undefined} />
      <main className="mx-auto w-[min(720px,calc(100%-32px))] flex-1 py-16 max-[720px]:py-10">
        <h1 className="font-[var(--display)] text-[clamp(32px,8vw,40px)] font-medium leading-none tracking-[-0.03em]">{title}</h1>
      </main>
      <SiteFooter />
    </>
  );
}
