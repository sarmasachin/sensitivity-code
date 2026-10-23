"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";
import { gamePages } from "@/data/games";
import { accountEmailKey, lastCodeKey } from "@/lib/session";

type SiteHeaderProps = {
  onGate: (message: string) => void;
};

const deskItem =
  "inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-[#3c4450] hover:bg-[#f5f6f8] hover:text-[#14171c]";
const deskHere = "text-[#14171c] shadow-[inset_0_-2px_0_#14171c]";
const deskRule = "mx-2 inline-block h-4 w-px bg-[#cfd5df]";
const drawItem =
  "flex h-[52px] w-full items-center rounded-[10px] px-3 text-base font-semibold text-[#3c4450] hover:bg-[#f5f6f8] hover:text-[#14171c]";
const drawHere = "bg-[#f5f6f8] text-[#14171c]";

export function SiteHeader({ onGate }: SiteHeaderProps) {
  const path = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const codeId = path.match(/^\/codes\/([^/]+)/)?.[1];
  const editHref = codeId ? `/codes/${codeId}/edit` : "/edit";
  const onEdit = path === "/edit" || path.endsWith("/edit");
  void onGate;

  useEffect(() => {
    const stored = sessionStorage.getItem(accountEmailKey);
    setEmail(stored);
    if (!stored) {
      fetch("/api/auth/me")
        .then((response) => response.json())
        .then((me: { signedIn?: boolean; maskedEmail?: string }) => {
          if (me.signedIn) setEmail(me.maskedEmail || "Signed in");
        })
        .catch(() => undefined);
    }
    if (codeId) sessionStorage.setItem(lastCodeKey, codeId);
    setOpen(false);
  }, [path, codeId]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function signOut() {
    sessionStorage.removeItem(accountEmailKey);
    fetch("/api/auth/logout", { method: "POST", keepalive: true }).finally(() => {
      window.location.href = "/";
    });
  }

  function siteMenu(kind: "desk" | "draw") {
    const item = kind === "desk" ? deskItem : drawItem;
    const labels = ["Home", ...gamePages.map((game) => game.name)];
    return labels.flatMap((label, index) => [
      kind === "desk" && index > 0 ? (
        <span key={`${kind}-${label}-rule`} className={deskRule} aria-hidden="true" />
      ) : null,
      <span key={`${kind}-${label}`} className={`${item} shrink-0 whitespace-nowrap`}>
        {label}
      </span>,
    ]);
  }

  function items(kind: "desk" | "draw") {
    const item = kind === "desk" ? deskItem : drawItem;
    const here = kind === "desk" ? deskHere : drawHere;
    const rule = kind === "desk" ? <span className={deskRule} aria-hidden="true" /> : null;
    if (!email) {
      return (
        <a
          className={
            kind === "desk"
              ? "inline-flex h-10 items-center rounded-lg bg-[#14171c] px-4 text-sm font-semibold text-white hover:bg-[#2a2f36]"
              : "mx-3 mt-3 flex h-11 items-center justify-center rounded-xl bg-[#14171c] text-base font-semibold text-white hover:bg-[#2a2f36]"
          }
          href="/login"
        >
          Login
        </a>
      );
    }
    return (
      <>
        <a className={`${item} ${path === "/submit" ? here : ""}`} href="/submit" aria-current={path === "/submit" ? "page" : undefined}>
          Submit code
        </a>
        {rule}
        <a className={item} href="/account#saved">
          Saved codes
        </a>
        {rule}
        <a className={item} href="/account#submissions">
          Your codes
        </a>
        {rule}
        <a className={`${item} ${onEdit ? here : ""}`} href={editHref} aria-current={onEdit ? "page" : undefined}>
          Edit code
        </a>
        {rule}
        <a className={`${item} ${path === "/id-card" ? here : ""}`} href="/id-card" aria-current={path === "/id-card" ? "page" : undefined}>
          ID card
        </a>
        {rule}
        <button className={`${item} ${kind === "draw" ? "mt-2 text-[#5c6570]" : ""}`} type="button" onClick={signOut}>
          Sign out
        </button>
        {rule}
        {kind === "desk" ? (
          <a className="inline-flex h-10 items-center rounded-lg bg-[#14171c] px-4 text-sm font-semibold text-white hover:bg-[#2a2f36]" href="/account" aria-current={path === "/account" ? "page" : undefined}>
            Account
          </a>
        ) : (
          <a className={`${item} ${path === "/account" ? here : ""}`} href="/account" aria-current={path === "/account" ? "page" : undefined}>
            Account
          </a>
        )}
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#e4e7ee] bg-white/90 backdrop-blur-[10px]">
        <div className="flex min-h-[72px] w-full items-center gap-3 px-4 max-[980px]:min-h-16 max-[980px]:gap-0 max-[980px]:pl-0.5 max-[980px]:pr-3">
          <button
            className="hidden h-14 w-14 shrink-0 items-center justify-center text-[#14171c] max-[980px]:inline-flex"
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            <svg className="h-9 w-9" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <a className="flex min-w-0 shrink items-center gap-1.5 text-left" href="/">
            <LogoMark className="block h-12 w-12 shrink-0 max-[980px]:h-11 max-[980px]:w-11 max-[380px]:h-10 max-[380px]:w-10" />
            <span className="min-w-0 font-[var(--display)] text-2xl font-medium leading-none tracking-[-0.03em] max-[980px]:text-[clamp(16px,4.6vw,20px)] max-[380px]:leading-tight">
              Sensitivity Codes
            </span>
          </a>
          <div className="ml-auto flex shrink-0 items-center gap-2 max-[980px]:hidden">
            <nav className="flex shrink-0 items-center" aria-label="Site">
              {siteMenu("desk")}
            </nav>
            <nav className="flex shrink-0 items-center" aria-label="Account">
              {items("desk")}
            </nav>
          </div>
        </div>
      </header>
      {open ? (
        <button
          className="fixed inset-0 z-40 border-0 bg-[rgba(20,23,28,0.4)]"
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <nav
        className={`fixed inset-y-0 left-0 z-40 w-[min(300px,82vw)] flex-col border-r border-[#e4e7ee] bg-white shadow-[12px_0_32px_rgba(20,23,28,0.12)] ${open ? "flex translate-x-0" : "hidden"}`}
        id="site-menu"
        aria-hidden={!open}
        inert={!open}
        aria-label="Mobile menu"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-[#e4e7ee] pl-[22px] pr-3">
          <p className="font-[var(--display)] text-[22px] font-medium leading-none tracking-[-0.03em]">Sensitivity Codes</p>
          <button className="inline-flex h-11 w-11 items-center justify-center text-[#14171c]" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-[#eef0f4] p-3" aria-label="Site">
          {siteMenu("draw")}
        </div>
        <div className="flex flex-col gap-0.5 p-3">{items("draw")}</div>
      </nav>
    </>
  );
}
