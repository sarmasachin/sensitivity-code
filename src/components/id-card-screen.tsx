"use client";

import { useEffect, useState } from "react";
import { accountEmailKey } from "@/lib/session";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./id-card-screen.module.css";

const cardKey = "sensitivity-id-card";

type CardFields = {
  name: string;
  player: string;
  region: string;
  rank: string;
  kd: string;
};

function licenseId(email: string) {
  let hash = 0;
  for (const char of email) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return `${1000 + (hash % 9000)}********`;
}

function playerFromEmail(email: string) {
  const local = email.split("@")[0].replace(/[._+-]+/g, " ").trim();
  const player = local.replace(/\b\w/g, (char) => char.toUpperCase()) || "Player";
  return { name: player.toUpperCase(), player };
}

function readCard() {
  try {
    const value = JSON.parse(sessionStorage.getItem(cardKey) ?? "{}") as unknown;
    if (!value || typeof value !== "object") return {} as Partial<CardFields>;
    return value as Partial<CardFields>;
  } catch {
    return {} as Partial<CardFields>;
  }
}

function shown(value: string) {
  return value.trim() || "—";
}

export function IdCardScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [card, setCard] = useState<CardFields>({
    name: "",
    player: "",
    region: "INDIA",
    rank: "",
    kd: "",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem(accountEmailKey);
    setEmail(stored);
    if (stored) {
      const base = playerFromEmail(stored);
      const saved = readCard();
      setCard({
        name: saved.name ?? base.name,
        player: saved.player ?? base.player,
        region: saved.region ?? "INDIA",
        rank: saved.rank ?? "",
        kd: saved.kd ?? "",
      });
    }
    setReady(true);
  }, []);

  function update(key: keyof CardFields, value: string) {
    setCard((current) => {
      const next = { ...current, [key]: value };
      sessionStorage.setItem(cardKey, JSON.stringify(next));
      return next;
    });
  }

  return (
    <>
      <SiteHeader onGate={() => undefined} />
      <main>
        {ready && email ? (
          <div className={styles.stage}>
            <div className="w-full justify-self-stretch [container-type:inline-size]">
            <article
              className={styles.card}
              aria-label="PUBG license"
              style={{ width: "820px", maxWidth: "none", marginInline: "auto", zoom: "min(1, calc(100cqw / 820px))" }}
            >
              <svg className={styles.warn} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5 22 21H2Z" fill="none" stroke="#12304c" strokeWidth="1.7" />
                <path d="M12 9.5v6" stroke="#12304c" strokeWidth="1.7" />
                <circle cx="12" cy="18.2" r="0.9" fill="#12304c" />
              </svg>
              <span className={styles.corner} data-place="tl" aria-hidden="true" />
              <span className={styles.corner} data-place="tr" aria-hidden="true" />
              <span className={styles.corner} data-place="bl" aria-hidden="true" />
              <span className={styles.corner} data-place="br" aria-hidden="true" />
              <h1>PUBG LICENSE</h1>
              <div className={styles.body}>
                <div className={styles.portrait}>
                  <Portrait />
                </div>
                <dl>
                  <div>
                    <dt>Name:</dt>
                    <dd>{shown(card.name)}</dd>
                  </div>
                  <div>
                    <dt>Region:</dt>
                    <dd>{shown(card.region)}</dd>
                  </div>
                  <div>
                    <dt>Player Name:</dt>
                    <dd className={styles.player}>{shown(card.player)}</dd>
                  </div>
                  <div>
                    <dt>Rank:</dt>
                    <dd>{shown(card.rank)}</dd>
                  </div>
                  <div>
                    <dt>ID:</dt>
                    <dd>{licenseId(email)}</dd>
                  </div>
                  <div>
                    <dt>K/D:</dt>
                    <dd>{shown(card.kd)}</dd>
                  </div>
                </dl>
                <div className={styles.photo} aria-hidden="true">
                  <PhotoMark />
                </div>
              </div>
              <div className={styles.barcode} aria-hidden="true" />
              <p className={styles.fine}>
                Please Do Not Share Any Official Information Of This License. Team BATTLEGROUNDS Mobile India Official
              </p>
            </article>
            </div>
            <form className={`${styles.edit} grid-cols-1 min-[721px]:grid-cols-2`}>
              <label>
                Name
                <input value={card.name} onChange={(event) => update("name", event.target.value)} />
              </label>
              <label>
                Player Name
                <input value={card.player} onChange={(event) => update("player", event.target.value)} />
              </label>
              <label>
                Region
                <input value={card.region} onChange={(event) => update("region", event.target.value)} />
              </label>
              <label>
                Rank
                <input value={card.rank} onChange={(event) => update("rank", event.target.value)} />
              </label>
              <label>
                K/D
                <input value={card.kd} onChange={(event) => update("kd", event.target.value)} />
              </label>
            </form>
          </div>
        ) : null}
        {ready && !email ? (
          <div className={styles.locked}>
            <h1>ID card</h1>
            <p>Sign in to open your license.</p>
            <a href="/login">Sign in</a>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function Portrait() {
  return <img src="/id-card-portrait.jpg" alt="" />;
}

function PhotoMark() {
  return (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <radialGradient id="fire" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#fff1b8" />
          <stop offset="38%" stopColor="#f0a020" />
          <stop offset="100%" stopColor="#1a1208" />
        </radialGradient>
        <clipPath id="round">
          <circle cx="80" cy="80" r="80" />
        </clipPath>
      </defs>
      <g clipPath="url(#round)">
        <rect width="160" height="160" fill="url(#fire)" />
        <path d="M18 150c10-46 32-70 62-70s52 24 62 70" fill="#14110c" />
        <circle cx="80" cy="78" r="26" fill="#e7c2a4" />
        <path d="M48 70c4-34 18-48 32-48s28 14 32 48c-10 8-22 12-32 12s-22-4-32-12z" fill="#f2b423" />
        <path d="M58 74c8-16 36-16 44 0-8 6-16 8-22 8s-14-2-22-8z" fill="#ffe08a" />
        <path d="M62 86h36c-2 16-10 24-18 24s-16-8-18-24z" fill="#1a1a1a" />
        <path d="M70 96h20" stroke="#3a3a3a" strokeWidth="2" />
      </g>
    </svg>
  );
}
