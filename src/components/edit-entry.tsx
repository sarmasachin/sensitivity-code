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
};

export function EditEntry() {
  const [item, setItem] = useState<SensitivityCode | null>(null);
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    const id = sessionStorage.getItem(lastCodeKey);
    fetch("/api/games")
      .then((response) => response.json())
      .then((data: { games?: string[] }) => setGames(Array.isArray(data.games) ? data.games : []))
      .catch(() => setGames([]));
    if (!id) {
      setItem(emptyCode);
      return;
    }
    fetch(`/api/codes/${id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { code?: SensitivityCode } | null) => setItem(data?.code ?? emptyCode))
      .catch(() => setItem(emptyCode));
  }, []);

  if (!item) return null;
  return <EditScreen item={item} games={games} />;
}
