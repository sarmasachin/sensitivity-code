"use client";

import { useState } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function ImageScreen() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <>
      <SiteHeader onGate={setNotice} />
      <main className="mx-auto w-[min(1120px,calc(100%-48px))] max-[980px]:w-full max-[980px]:px-3 py-8">
        {notice ? <p className="mb-4 text-sm text-[#5c6570]">{notice}</p> : null}
        <h1 className="font-[var(--display)] text-[34px] font-medium tracking-[-0.03em] max-[720px]:text-[28px]">
          Image
        </h1>
        <p className="mt-2 text-[#5c6570]">Community images will show here.</p>
      </main>
      <SiteFooter />
    </>
  );
}
