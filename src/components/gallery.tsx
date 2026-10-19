"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gamePages } from "@/data/games";
import type { SensitivityCode } from "@/lib/code-record";
import { CodeCard } from "./code-card";
import styles from "./gallery.module.css";

type GalleryProps = {
  game: string;
  notice: string | null;
  onGate: (message: string) => void;
  initialCodes?: SensitivityCode[];
};

const gyros = ["All", "Gyro", "Non-Gyro"] as const;
const fingers = ["All", "2F", "3F", "4F"] as const;

export function Gallery({ game, notice, onGate, initialCodes }: GalleryProps) {
  const [query, setQuery] = useState("");
  const [gyro, setGyro] = useState<(typeof gyros)[number]>("All");
  const [finger, setFinger] = useState<(typeof fingers)[number]>("All");
  const [sort, setSort] = useState<"latest" | "working">("latest");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState<SensitivityCode[]>(initialCodes ?? []);
  const [loaded, setLoaded] = useState((initialCodes ?? []).length > 0);
  const ticket = useRef(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (game !== "All") params.set("game", game);
      if (query.trim()) params.set("q", query.trim());
      if (gyro !== "All") params.set("gyro", gyro);
      if (finger !== "All") params.set("finger", finger);
      params.set("sort", sort);
      const current = ++ticket.current;
      fetch(`/api/codes?${params}`)
        .then((response) => response.json())
        .then((data: { codes?: SensitivityCode[] }) => {
          if (current !== ticket.current) return;
          setVisible(Array.isArray(data.codes) ? data.codes : []);
          setLoaded(true);
        })
        .catch(() => {
          if (current !== ticket.current) return;
          setVisible([]);
          setLoaded(true);
        });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, game, gyro, finger, sort]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const area = document.createElement("textarea");
      area.value = code;
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

  return (
    <section className={styles.gallery} aria-label="Approved codes">
      <input
        className={styles.search}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search phone, code, or player…"
        aria-label="Search phone, code, or player"
      />
      <p className={styles.notice} role="status">
        {notice}
      </p>
      <div className={styles.bar}>
        <div className={styles.group}>
          <span className={styles.label}>Game</span>
          <div className={styles.options}>
            <Link className={styles.chip} href="/all" data-active={game === "All"} aria-current={game === "All" ? "page" : undefined}>
              All
            </Link>
            {gamePages.map((item) => (
              <Link
                key={item.slug}
                className={styles.chip}
                href={item.slug === "bgmi-lite" ? "/" : `/${item.slug}`}
                data-active={game === item.name}
                aria-current={game === item.name ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.group}>
          <span className={styles.label}>Style</span>
          <div className={styles.options}>
            {gyros.slice(1).map((name) => (
              <Chip key={name} label={name} active={gyro === name} onClick={() => setGyro(gyro === name ? "All" : name)} />
            ))}
            {fingers.slice(1).map((name) => (
              <Chip
                key={name}
                label={name}
                active={finger === name}
                onClick={() => setFinger(finger === name ? "All" : name)}
              />
            ))}
          </div>
        </div>
        <div className={styles.sort} role="group" aria-label="Sort">
          <button type="button" data-active={sort === "latest"} onClick={() => setSort("latest")}>
            Latest
          </button>
          <button type="button" data-active={sort === "working"} onClick={() => setSort("working")}>
            Most Working
          </button>
        </div>
      </div>
      <div className={styles.heading}>
        <h2>Approved codes</h2>
        <p>
          {visible.length} {visible.length === 1 ? "code" : "codes"}
        </p>
      </div>
      {!loaded ? (
        <p className={styles.empty}>Loading codes…</p>
      ) : visible.length === 0 ? (
        <p className={styles.empty}>No approved codes match this search.</p>
      ) : (
        <div className={styles.grid}>
          {visible.map((item: SensitivityCode) => (
            <CodeCard key={item.id} item={item} onCopy={copyCode} onGate={onGate} />
          ))}
        </div>
      )}
      {copied ? <p className={styles.toast}>Copied</p> : null}
    </section>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={styles.chip} type="button" data-active={active} onClick={onClick}>
      {label}
    </button>
  );
}
