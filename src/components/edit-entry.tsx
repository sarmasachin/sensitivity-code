"use client";

import { useEffect, useState } from "react";
import type { SensitivityCode } from "@/lib/code-record";
import { lastCodeKey } from "@/lib/session";
import { EditScreen } from "./edit-screen";

const emptyCode: SensitivityCode = {
  id: "new",
  game: "BGMI",
  phone: "",
  player: "",
  gyro: "Gyro",
  fingers: "4",
  ram: "",
  rank: null,
  playStyle: "",
  code: "",
  working: 0,
  notWorking: 0,
  publishedAt: "",
  publishedLabel: "",
  detailsPath: null,
  proofSrc: null,
  profileSrc: null,
  gyroMode: "",
  fps: "",
  kills: "",
  wins: "",
  kd: "",
  season: "",
  tip: "",
  myVote: null,
  saved: false,
};

export function EditEntry() {
  const [item, setItem] = useState<SensitivityCode | null>(null);
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem(lastCodeKey);
    fetch("/api/games")
      .then((response) => response.json())
      .then((data: { games?: string[] }) => setGames(Array.isArray(data.games) ? data.games : []))
      .catch(() => setGames([]));
    fetch("/api/account/codes")
      .then((response) => (response.ok ? response.json() : { codes: [] }))
      .then(async (data: { codes?: { id: string }[] }) => {
        const codes = Array.isArray(data.codes) ? data.codes : [];
        const owned = codes.find((code) => code.id === stored) ?? codes[0];
        if (!owned) {
          setItem(emptyCode);
          return;
        }
        const response = await fetch(`/api/codes/${owned.id}`);
        const body = (response.ok ? await response.json() : null) as { code?: SensitivityCode } | null;
        setItem(body?.code ?? emptyCode);
      })
      .catch(() => setItem(emptyCode));
  }, []);

  if (!item) return null;
  return <EditScreen item={item} games={games} />;
}
