"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SensitivityCode } from "@/lib/code-record";
import { hasAccount, isSaved, saveCode, setVote, voteFor } from "@/lib/session";
import styles from "./code-card.module.css";

const tones = ["#243044", "#3d4a3a", "#4a3b32", "#2c3a44", "#3a3344", "#3e4632", "#2f3d38", "#3d342c"];

function ProfileAvatar({ name }: { name: string }) {
  const tone = tones[name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length];
  return (
    <svg className={styles.avatar} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={tone} />
      <circle cx="32" cy="26" r="10" fill="#f7f4ee" />
      <path d="M14 56c2.2-12 10-16 18-16s15.8 4 18 16" fill="#f7f4ee" />
    </svg>
  );
}

type CodeCardProps = {
  item: SensitivityCode;
  onCopy: (code: string) => void;
  onGate: (message: string) => void;
};

export function CodeCard({ item, onCopy, onGate }: CodeCardProps) {
  const [today, setToday] = useState("");
  const [vote, setLocalVote] = useState<"working" | "broken" | null>(null);
  const [saved, setSaved] = useState(false);
  const role = [item.rank, item.playStyle].filter(Boolean).join(" · ");
  const date =
    today && item.publishedAt === today
      ? "Updated today"
      : `Updated ${item.publishedLabel.replace(/ \d{4}$/, "")}`;
  const working = item.working + (vote === "working" ? 1 : 0);
  const notWorking = item.notWorking + (vote === "broken" ? 1 : 0);

  useEffect(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setToday(`${now.getFullYear()}-${month}-${day}`);
    if (!hasAccount()) {
      setLocalVote(null);
      setSaved(false);
      return;
    }
    setLocalVote(voteFor(item.id));
    setSaved(isSaved(item.id));
  }, [item.id]);

  function mark(next: "working" | "broken") {
    if (!hasAccount()) {
      onGate(next === "working" ? "Sign in to mark a code as working." : "Sign in to mark a code as not working.");
      return;
    }
    setVote(item.id, next);
    setLocalVote(next);
    onGate(next === "working" ? "Marked as working." : "Marked as not working.");
  }

  function save() {
    if (!hasAccount()) {
      onGate("Sign in to save this code.");
      return;
    }
    saveCode(item.id);
    setSaved(true);
    onGate("Saved.");
  }

  function share() {
    const link = `${window.location.origin}/codes/${item.id}`;
    const text = `${item.player}\n${item.phone}\n${item.code}\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <article className={styles.card}>
      <div className={styles.profile}>
        <ProfileAvatar name={item.player} />
        <div className={styles.who}>
          <p className={styles.player}>{item.player}</p>
          <p className={styles.role}>{role}</p>
        </div>
        <button className={styles.share} type="button" onClick={share}>
          Share
        </button>
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>
          {item.game} Sensitivity Code for {item.phone}
        </h2>
        <div className={styles.codeRow}>
          <code className={styles.code}>{item.code}</code>
          <button className={styles.copy} type="button" onClick={() => onCopy(item.code)}>
            Copy
          </button>
        </div>
        <div className={styles.stats}>
          <p className={styles.counts}>
            <span className={styles.good}>
              <strong>{working}</strong>
              <span>Working</span>
            </span>
            <span className={styles.warn}>
              <strong>{notWorking}</strong>
              <span>Not working</span>
            </span>
          </p>
          <p className={styles.date}>{date}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.working} type="button" onClick={() => mark("working")}>
            Working
          </button>
          <button className={styles.broken} type="button" onClick={() => mark("broken")}>
            Not working
          </button>
          <button className={styles.save} type="button" onClick={save}>
            {saved ? "Saved" : "Save"}
          </button>
          <button className={styles.report} type="button" onClick={() => onGate("Report sent. We'll review this code.")}>
            Report
          </button>
          <Link className={styles.details} href={`/codes/${item.id}`}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
