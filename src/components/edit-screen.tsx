"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SensitivityCode } from "@/lib/code-record";
import { accountEmailKey } from "@/lib/session";
import { Choice, Field } from "./edit-fields";
import { ProofFrame } from "./proof-frame";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./edit-screen.module.css";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type EditScreenProps = {
  item: SensitivityCode;
  games: string[];
};

export function EditScreen({ item, games }: EditScreenProps) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [game, setGame] = useState(item.game);
  const [phone, setPhone] = useState(item.phone);
  const [code, setCode] = useState(item.code);
  const [fingers, setFingers] = useState<string>(item.fingers);
  const [gyro, setGyro] = useState<string>(item.gyro);
  const [gyroMode, setGyroMode] = useState<string>(item.gyroMode);
  const [player, setPlayer] = useState(item.player);
  const [playStyle, setPlayStyle] = useState(item.playStyle);
  const [ram, setRam] = useState(item.ram);
  const [fps, setFps] = useState(item.fps);
  const [rank, setRank] = useState(item.rank ?? "");
  const [kills, setKills] = useState(item.kills);
  const [wins, setWins] = useState(item.wins);
  const [kd, setKd] = useState(item.kd);
  const [season, setSeason] = useState(item.season);
  const [tip, setTip] = useState(item.tip);
  const [proofPreview, setProofPreview] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedHref, setSavedHref] = useState(item.detailsPath ?? `/codes/${item.id}`);
  const [section, setSection] = useState<"code" | "profile" | "device" | "record" | "proof">("code");
  const seed = item.code.charCodeAt(0) + item.fingers.charCodeAt(0);

  useEffect(() => {
    const stored = sessionStorage.getItem(accountEmailKey);
    if (stored) {
      setEmail(stored);
      setReady(true);
      return;
    }
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((me: { signedIn?: boolean; maskedEmail?: string }) => {
        setEmail(me.signedIn ? me.maskedEmail || "Signed in" : null);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function onImage(file: File | undefined, kind: "proof" | "photo") {
    if (!file) return;
    if (!imageTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
      setError("Use a JPEG, PNG, or WebP under 8 MB.");
      return;
    }
    setError("");
    const url = URL.createObjectURL(file);
    if (kind === "proof") {
      setProofPreview(url);
      setProofFile(file);
    } else {
      setPhotoPreview(url);
      setPhotoFile(file);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (item.id === "new") {
      setError("Submit a code first, then edit it.");
      return;
    }
    if (!game || !phone.trim() || code.trim().length < 6 || !fingers || !gyro) {
      setSection("code");
      setError("Game, phone, code, fingers, and gyro stay required.");
      return;
    }
    if (kills && !/^\d+$/.test(kills)) {
      setSection("record");
      setError("Kills should be a number.");
      return;
    }
    if (wins && !/^\d+$/.test(wins)) {
      setSection("record");
      setError("Wins should be a number.");
      return;
    }
    if (kd && !/^\d+(\.\d+)?$/.test(kd)) {
      setSection("record");
      setError("KD should be a number.");
      return;
    }
    const body = new FormData();
    body.set("game", game);
    body.set("phone", phone.trim());
    body.set("code", code.trim());
    body.set("fingers", fingers);
    body.set("gyro", gyro);
    body.set("gyroMode", gyroMode);
    body.set("player", player.trim());
    body.set("playStyle", playStyle.trim());
    body.set("ram", ram.trim());
    body.set("fps", fps.trim());
    body.set("rank", rank.trim());
    body.set("kills", kills.trim());
    body.set("wins", wins.trim());
    body.set("kd", kd.trim());
    body.set("season", season.trim());
    body.set("tip", tip.trim());
    if (proofFile) body.set("proof", proofFile);
    if (photoFile) body.set("photo", photoFile);
    const response = await fetch(`/api/codes/${item.id}`, { method: "POST", body });
    const data = (await response.json().catch(() => ({}))) as { error?: string; detailsPath?: string };
    if (!response.ok) {
      setError(data.error || "Could not save these details.");
      return;
    }
    if (data.detailsPath) setSavedHref(data.detailsPath);
    setError("");
    setSaved(true);
  }

  return (
    <>
      <SiteHeader onGate={() => undefined} />
      <main>
        <div className={styles.main}>
          {ready && !email ? (
            <div className={styles.gate}>
              <h1>Edit this code</h1>
              <p>Sign in with the email that owns this code.</p>
              <a className={styles.primary} href="/login">
                Sign in
              </a>
            </div>
          ) : null}
          {ready && email && saved ? (
            <div className={styles.gate}>
              <p className={styles.kicker}>Saved</p>
              <h1>Details updated</h1>
              <p>
                {game} for {phone.trim()} keeps these details. Your email stays private.
              </p>
              <a className={styles.primary} href={savedHref}>
                Back to this code
              </a>
            </div>
          ) : null}
          {ready && email && !saved ? (
            <form noValidate onSubmit={save}>
              <div className={styles.profile}>
                <label className={styles.avatar}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => onImage(event.target.files?.[0], "photo")}
                  />
                  {photoPreview || item.profileSrc ? (
                    <img src={photoPreview || item.profileSrc || ""} alt="" />
                  ) : (
                    <span>
                      {player
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase() || "P"}
                    </span>
                  )}
                </label>
                <div>
                  <p className={styles.kicker}>{game}</p>
                  <h1>{player.trim() || "Your profile"}</h1>
                  <p className={styles.role}>{[rank, playStyle].filter(Boolean).join(" · ")}</p>
                  <p className={styles.meta}>
                    {[phone.trim(), gyro, fingers ? `${fingers} fingers` : ""].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <dl className={styles.stats}>
                <div>
                  <dt>Rank</dt>
                  <dd>{rank || "—"}</dd>
                </div>
                <div>
                  <dt>Kills</dt>
                  <dd>{kills || "—"}</dd>
                </div>
                <div>
                  <dt>Wins</dt>
                  <dd>{wins || "—"}</dd>
                </div>
                <div>
                  <dt>KD</dt>
                  <dd>{kd || "—"}</dd>
                </div>
              </dl>
              <div className={styles.sheet}>
              <div className={styles.tabs} role="tablist" aria-label="Edit">
                {(
                  [
                    ["code", "Code"],
                    ["profile", "Profile"],
                    ["device", "Device"],
                    ["record", "Record"],
                    ["proof", "Proof"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={section === id}
                    onClick={() => setSection(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {section === "code" ? (
                <section className={styles.panel}>
                  <div className={styles.grid}>
                    <Field label="Game" id="game">
                      <select id="game" value={game} onChange={(event) => setGame(event.target.value)}>
                        {games.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Phone" id="phone">
                      <input
                        id="phone"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="iQOO Z10"
                      />
                    </Field>
                    <Field label="Sensitivity code" id="sensitivity" wide>
                      <input
                        id="sensitivity"
                        className={styles.mono}
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        placeholder="7436-2841-1934-5520-8812-4408"
                        spellCheck={false}
                      />
                    </Field>
                    <Choice label="Fingers" values={["2", "3", "4"]} selected={fingers} onPick={setFingers} />
                    <Choice
                      label="Gyro"
                      values={["Gyro", "Non-Gyro"]}
                      selected={gyro}
                      onPick={(value) => {
                        setGyro(value);
                        if (value !== "Gyro") setGyroMode("");
                      }}
                    />
                    {gyro === "Gyro" ? (
                      <Choice
                        label="Gyro mode"
                        values={["Scope On", "Always On"]}
                        selected={gyroMode}
                        onPick={setGyroMode}
                        wide
                      />
                    ) : null}
                  </div>
                </section>
              ) : null}
              {section === "profile" ? (
                <section className={styles.panel}>
                  <div className={styles.grid}>
                    <Field label="Name" id="player">
                      <input id="player" value={player} onChange={(event) => setPlayer(event.target.value)} />
                    </Field>
                    <Field label="Play style" id="style">
                      <input id="style" value={playStyle} onChange={(event) => setPlayStyle(event.target.value)} />
                    </Field>
                  </div>
                </section>
              ) : null}
              {section === "device" ? (
                <section className={styles.panel}>
                  <div className={styles.grid}>
                    <Field label="RAM" id="ram">
                      <input id="ram" value={ram} onChange={(event) => setRam(event.target.value)} />
                    </Field>
                    <Field label="FPS" id="fps">
                      <input id="fps" value={fps} onChange={(event) => setFps(event.target.value)} placeholder="90" />
                    </Field>
                  </div>
                </section>
              ) : null}
              {section === "record" ? (
                <section className={styles.panel}>
                  <div className={styles.grid}>
                    <Field label="Rank" id="rank">
                      <input id="rank" value={rank} onChange={(event) => setRank(event.target.value)} />
                    </Field>
                    <Field label="Kills" id="kills">
                      <input id="kills" inputMode="numeric" value={kills} onChange={(event) => setKills(event.target.value)} />
                    </Field>
                    <Field label="Wins" id="wins">
                      <input id="wins" inputMode="numeric" value={wins} onChange={(event) => setWins(event.target.value)} />
                    </Field>
                    <Field label="KD" id="kd">
                      <input id="kd" inputMode="decimal" value={kd} onChange={(event) => setKd(event.target.value)} />
                    </Field>
                    <Field label="Season note" id="season" wide>
                      <textarea id="season" maxLength={160} value={season} onChange={(event) => setSeason(event.target.value)} />
                    </Field>
                    <Field label="Short tip" id="tip" wide>
                      <textarea id="tip" maxLength={160} value={tip} onChange={(event) => setTip(event.target.value)} />
                    </Field>
                  </div>
                </section>
              ) : null}
              {section === "proof" ? (
                <section className={styles.panel}>
                  <label className={styles.proof}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => onImage(event.target.files?.[0], "proof")}
                    />
                    {proofPreview || item.proofSrc ? <img src={proofPreview || item.proofSrc || ""} alt="" /> : <ProofFrame seed={seed} />}
                  </label>
                </section>
              ) : null}
              {error ? <p className={styles.error}>{error}</p> : null}
              <div className={styles.foot}>
                <button className={styles.save} type="submit">
                  Save details
                </button>
              </div>
              </div>
            </form>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

