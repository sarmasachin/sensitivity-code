"use client";

import { useEffect, useState, type FormEvent } from "react";
import { accountEmailKey, lastCodeKey } from "@/lib/session";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./submit-screen.module.css";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function SubmitScreen() {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [game, setGame] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fingers, setFingers] = useState("");
  const [gyro, setGyro] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    const current = sessionStorage.getItem(accountEmailKey);
    if (current) {
      setEmail(current);
      setReady(true);
    } else {
      fetch("/api/auth/me")
        .then((response) => response.json())
        .then((me: { signedIn?: boolean; maskedEmail?: string }) => {
          setEmail(me.signedIn ? me.maskedEmail || "Signed in" : null);
          setReady(true);
        })
        .catch(() => {
          setEmail(null);
          setReady(true);
        });
    }
    fetch("/api/games")
      .then((response) => response.json())
      .then((data: { games?: string[] }) => setGames(Array.isArray(data.games) ? data.games : []))
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!imageTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
      setError("Add a JPEG, PNG, or WebP screenshot under 8 MB.");
      setFileName("");
      setPreview("");
      return;
    }
    setError("");
    setFile(file);
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email) return;
    if (!game) {
      setError("Choose a game.");
      return;
    }
    if (!phone.trim()) {
      setError("Enter the phone model.");
      return;
    }
    if (code.trim().length < 6) {
      setError("Enter the sensitivity code.");
      return;
    }
    if (!fingers) {
      setError("Choose 2, 3, or 4 fingers.");
      return;
    }
    if (!gyro) {
      setError("Choose Gyro or Non-Gyro.");
      return;
    }
    if (!file) {
      setError("Add a proof screenshot.");
      return;
    }
    setError("");
    setSending(true);
    const body = new FormData();
    body.set("email", email);
    body.set("game", game);
    body.set("phone", phone.trim());
    body.set("code", code.trim());
    body.set("fingers", fingers);
    body.set("gyro", gyro);
    body.set("proof", file);
    try {
      const response = await fetch("/api/codes", { method: "POST", body });
      const data = (await response.json()) as { detailsPath?: string; id?: string; error?: string };
      if (!response.ok || !data.detailsPath) {
        setError(data.error || "Could not submit this code.");
        setSending(false);
        return;
      }
      if (data.id) sessionStorage.setItem(lastCodeKey, data.id);
      window.location.href = data.detailsPath;
    } catch {
      setError("Could not submit this code.");
      setSending(false);
    }
  }

  return (
    <>
      <SiteHeader onGate={() => undefined} />
      <main>
        <div className={styles.main}>
          {ready && !email ? (
            <div className={styles.locked}>
              <h1>Submit a code</h1>
              <p>Sign in with email before you submit a code.</p>
              <a className={styles.primary} href="/login">
                Sign in
              </a>
            </div>
          ) : null}
          {ready && email ? (
            <form noValidate onSubmit={submit}>
              <p className={styles.kicker}>New code</p>
              <h1>Submit a code</h1>
              <p className={styles.line}>It goes on the gallery right away. Your email is never shown.</p>
              <div className={styles.layout}>
                <div className={styles.field}>
                  <label htmlFor="game">Game</label>
                  <select id="game" value={game} onChange={(event) => setGame(event.target.value)}>
                    <option value="">Choose a game</option>
                    {games.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="iQOO Z10"
                    autoComplete="off"
                  />
                </div>
                <div className={`${styles.field} ${styles.code}`}>
                  <label htmlFor="sensitivity">Sensitivity code</label>
                  <input
                    id="sensitivity"
                    className={styles.mono}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="7436-2841-1934-5520-8812-4408"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <fieldset className={styles.field}>
                  <legend>Fingers</legend>
                  <div className={styles.choice}>
                    {["2", "3", "4"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={fingers === value}
                        onClick={() => setFingers(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className={styles.field}>
                  <legend>Gyro</legend>
                  <div className={`${styles.choice} ${styles.gyro}`}>
                    {["Gyro", "Non-Gyro"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={gyro === value}
                        onClick={() => setGyro(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className={styles.proof}>
                  <p className={styles.proofLabel}>Proof screenshot</p>
                  <label className={styles.drop}>
                    <input
                      id="proof"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => onFile(event.target.files?.[0])}
                    />
                    {preview ? (
                      <img src={preview} alt="" />
                    ) : (
                      <span>
                        Add the in-game settings
                        <small>JPEG, PNG, or WebP</small>
                      </span>
                    )}
                  </label>
                  {fileName ? <p className={styles.fileName}>{fileName}</p> : null}
                </div>
              </div>
              {error ? <p className={styles.error}>{error}</p> : null}
              <button className={styles.submit} type="submit" disabled={sending}>
                {sending ? "Submitting" : "Submit"}
              </button>
            </form>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
