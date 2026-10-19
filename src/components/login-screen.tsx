"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { accountEmailKey } from "@/lib/session";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./login-screen.module.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");

  function sendCode(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!emailPattern.test(value)) {
      setError("Enter the email you want on this gallery.");
      return;
    }
    setEmail(value);
    setError("");
    setCode("");
    setStep("code");
  }

  function confirmCode(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError("");
    sessionStorage.setItem(accountEmailKey, email);
    router.push("/account");
  }

  return (
    <>
      <SiteHeader onGate={setNotice} />
      <main>
        <section className={styles.sheet}>
          {step === "email" ? (
            <form noValidate onSubmit={sendCode}>
              <h1>Sign in</h1>
              <p className={styles.line}>We email you a code. There is no password.</p>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
              />
              {error ? <p className={styles.error}>{error}</p> : null}
              {notice ? <p className={styles.notice}>{notice}</p> : null}
              <button type="submit">Continue</button>
              <p className={styles.fine}>Your email stays private. It is never shown on a code.</p>
            </form>
          ) : (
            <form noValidate onSubmit={confirmCode}>
              <h1>Check your email</h1>
              <p className={styles.line}>
                Enter the 6-digit code sent to <span>{email}</span>.
              </p>
              <label htmlFor="code">Code</label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
              />
              {error ? <p className={styles.error}>{error}</p> : null}
              {notice ? <p className={styles.notice}>{notice}</p> : null}
              <button type="submit">Sign in</button>
              <button
                className={styles.back}
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setNotice(null);
                }}
              >
                Use a different email
              </button>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
