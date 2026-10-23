"use client";

import { useEffect, useState } from "react";
import type { SensitivityCode } from "@/lib/code-record";
import { lastCodeKey } from "@/lib/session";
import { ProofFrame } from "./proof-frame";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./code-detail.module.css";

type CodeDetailProps = {
  item: SensitivityCode;
};

export function CodeDetail({ item }: CodeDetailProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(item.saved);

  useEffect(() => {
    setSaved(item.saved);
    sessionStorage.setItem(lastCodeKey, item.id);
  }, [item.id, item.saved]);

  async function save() {
    const response = await fetch(`/api/codes/${item.id}/save`, { method: "POST" });
    if (response.status === 401) {
      setNotice("Sign in to save this code.");
      return;
    }
    if (!response.ok) return;
    setSaved(true);
    setNotice("Saved.");
  }

  async function report() {
    const response = await fetch(`/api/codes/${item.id}/report`, { method: "POST" });
    if (response.status === 401) {
      setNotice("Sign in to report this code.");
      return;
    }
    if (response.ok) setNotice("Report sent. We'll review this code.");
  }
  const seed = item.code.charCodeAt(0) + item.fingers.charCodeAt(0);
  const initials = item.player
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(item.code);
    } catch {
      const area = document.createElement("textarea");
      area.value = item.code;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function share() {
    const text = `${item.game} Sensitivity Code for ${item.phone}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={styles.page}>
      <SiteHeader onGate={setNotice} />
      <main>
        <article className={styles.sheet}>
          <header className={styles.head}>
            <div className={styles.kickerRow}>
              <p className={styles.kicker}>{item.game}</p>
              <p className={styles.date}>{item.publishedLabel}</p>
            </div>
            <h1>{item.phone}</h1>
            <p className={styles.sub}>Sensitivity code</p>
          </header>
          <div className={styles.body}>
            <div className={styles.proof}>
              {item.proofSrc ? <img className="block h-auto w-full" src={item.proofSrc} alt="" /> : <ProofFrame seed={seed} large />}
            </div>
            <div className={styles.info}>
              <div className={styles.person}>
                {item.profileSrc ? (
                  <img className={styles.avatar} src={item.profileSrc} alt="" />
                ) : (
                  <span className={styles.avatar} aria-hidden="true">
                    {initials}
                  </span>
                )}
                <p className={styles.name}>{item.player}</p>
                <div className={styles.play}>
                  <p>Play style</p>
                  <p>{item.playStyle}</p>
                </div>
              </div>
              <dl className={styles.specs}>
                <div>
                  <dt>Gyro</dt>
                  <dd>{item.gyro}</dd>
                </div>
                <div>
                  <dt>Fingers</dt>
                  <dd>{item.fingers}</dd>
                </div>
                <div>
                  <dt>Rank</dt>
                  <dd>{item.rank ?? "—"}</dd>
                </div>
                <div>
                  <dt>RAM</dt>
                  <dd>{item.ram}</dd>
                </div>
              </dl>
              <div className={styles.codeRow}>
                <code>{item.code}</code>
                <button type="button" onClick={copyCode}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className={styles.votes}>
                <div className={styles.good}>
                  <strong>{item.working}</strong>
                  <span>Working</span>
                </div>
                <div className={styles.split} aria-hidden="true" />
                <div className={styles.warn}>
                  <strong>{item.notWorking}</strong>
                  <span>Not working</span>
                </div>
              </div>
              {notice ? (
                <p className={styles.notice} role="status">
                  {notice}
                </p>
              ) : null}
              <div className={styles.actions}>
                <button type="button" onClick={save}>
                  {saved ? "Saved" : "Save"}
                </button>
                <button type="button" onClick={report}>
                  Report
                </button>
                <button type="button" onClick={share}>
                  Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
