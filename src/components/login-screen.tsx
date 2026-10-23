"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clearEmailLock, clearLoginLock, notePasswordMiss, passwordLoginBlocked } from "@/lib/login-account";
import { accountEmailKey } from "@/lib/session";
import { LogoMark } from "./logo-mark";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./login-screen.module.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpNotice = "Too many sign-in attempts. Enter the 6-digit code from your email.";

export function LoginScreen() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"password" | "email" | "code" | "forgot" | "forgot-code" | "reset">("password");
  const [otpOnly, setOtpOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (passwordLoginBlocked("")) {
      setOtpOnly(true);
      setStep("email");
      setNotice(otpNotice);
    }
  }, []);

  function signIn(value: string) {
    sessionStorage.setItem(accountEmailKey, value);
    router.push("/account");
  }

  function forceOtp(value: string) {
    setEmail(value);
    setOtpOnly(true);
    setError("");
    setCode("");
    setPassword("");
    setNotice(otpNotice);
    setStep("email");
  }

  async function signInWithPassword(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!emailPattern.test(value)) {
      setError("Enter the email you want on this gallery.");
      return;
    }
    if (passwordLoginBlocked(value)) {
      forceOtp(value);
      return;
    }
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: value, password }),
    });
    const result = (await response.json()) as { status?: string; error?: string };
    if (result.status === "short") {
      setError("Use at least 8 characters.");
      return;
    }
    if (result.status === "miss") {
      if (notePasswordMiss(value) === "otp") forceOtp(value);
      else setError("That password does not match this email.");
      return;
    }
    if (!response.ok) {
      setError(result.error || "That password does not match this email.");
      return;
    }
    clearEmailLock(value);
    setError("");
    signIn(value);
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!emailPattern.test(value)) {
      setError("Enter the email you want on this gallery.");
      return;
    }
    if (step === "forgot") {
      const response = await fetch(`/api/auth/account?email=${encodeURIComponent(value)}`);
      const data = (await response.json()) as { exists?: boolean };
      if (!data.exists) {
        setError("No account uses this email.");
        return;
      }
    }
    setEmail(value);
    setError("");
    setCode("");
    setStep(step === "forgot" ? "forgot-code" : "code");
  }

  async function confirmCode(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError("");
    if (step === "forgot-code") {
      setNextPassword("");
      setConfirmPassword("");
      setStep("reset");
      return;
    }
    const response = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code: code.trim() }),
    });
    if (!response.ok) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    clearLoginLock(email);
    setOtpOnly(false);
    setNotice(null);
    signIn(email);
  }

  async function saveNewPassword(event: FormEvent) {
    event.preventDefault();
    if (nextPassword.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const response = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: nextPassword }),
    });
    const result = (await response.json()) as { status?: string };
    if (result.status === "short") {
      setError("Use at least 8 characters.");
      return;
    }
    if (result.status === "missing" || !response.ok) {
      setError("No account uses this email.");
      return;
    }
    clearLoginLock(email);
    setError("");
    setNotice(null);
    signIn(email);
  }

  return (
    <>
      <SiteHeader onGate={setNotice} />
      <main className="relative bg-[radial-gradient(120%_80%_at_50%_-10%,#eef1f6_0%,#ffffff_55%)]">
        <section
          className={`${styles.sheet} mt-10 w-[min(440px,calc(100%-32px))] overflow-hidden rounded-[22px] border border-[#e4e7ee] bg-white px-7 py-8 shadow-[0_20px_48px_rgba(20,23,28,0.08)] max-[720px]:mt-6 max-[720px]:px-5 max-[720px]:py-6`}
        >
          <div className="mb-7 flex justify-center border-b border-[#eef0f4] pb-7">
            <a className="flex items-center gap-1.5 text-left" href="/" aria-label="Sensitivity Codes">
              <LogoMark className="block h-12 w-12 shrink-0" />
              <span className="font-[var(--display)] text-2xl font-medium leading-none tracking-[-0.03em]">
                Sensitivity Codes
              </span>
            </a>
          </div>
          {step === "password" ? (
            <form noValidate onSubmit={signInWithPassword}>
              <h1 className="!text-[clamp(30px,8vw,34px)]">Sign in</h1>
              <p className={styles.line}>Use your email and password.</p>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
              />
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
              />
              <div className="mt-2 flex justify-end">
                <button
                  className="!m-0 !h-auto !w-auto !border-0 !bg-transparent !p-0 text-sm font-semibold !text-[#14171c] !no-underline hover:!bg-transparent"
                  type="button"
                  onClick={() => {
                    setStep("forgot");
                    setError("");
                    setNotice(null);
                  }}
                >
                  Forgot password
                </button>
              </div>
              {error ? <p className={styles.error}>{error}</p> : null}
              {notice ? <p className={styles.notice}>{notice}</p> : null}
              <button type="submit">Sign in</button>
              <button
                className={styles.back}
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
              >
                Login with email
              </button>
            </form>
          ) : null}
          {step === "email" ? (
            <form noValidate onSubmit={sendCode}>
              <h1 className="!text-[clamp(30px,8vw,34px)]">Sign in</h1>
              <p className={styles.line}>
                {otpOnly ? "We email you a code to finish sign-in." : "We email you a code. There is no password."}
              </p>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
              />
              {error ? <p className={styles.error}>{error}</p> : null}
              {notice ? <p className={styles.notice}>{notice}</p> : null}
              <button type="submit">Continue</button>
              {otpOnly ? null : (
                <button
                  className={styles.back}
                  type="button"
                  onClick={() => {
                    setStep("password");
                    setError("");
                    setNotice(null);
                  }}
                >
                  Use password
                </button>
              )}
            </form>
          ) : null}
          {step === "code" || step === "forgot-code" ? (
            <form noValidate onSubmit={confirmCode}>
              <h1 className="!text-[clamp(30px,8vw,34px)]">Check your email</h1>
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
              <button type="submit">{step === "forgot-code" ? "Continue" : "Sign in"}</button>
              <button
                className={styles.back}
                type="button"
                onClick={() => {
                  setStep(step === "forgot-code" ? "forgot" : "email");
                  setError("");
                  if (!otpOnly) setNotice(null);
                }}
              >
                Use a different email
              </button>
            </form>
          ) : null}
          {step === "forgot" ? (
            <form noValidate onSubmit={sendCode}>
              <h1 className="!text-[clamp(30px,8vw,34px)]">Forgot password</h1>
              <p className={styles.line}>We email you a code to set a new password.</p>
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
              />
              {error ? <p className={styles.error}>{error}</p> : null}
              <button type="submit">Continue</button>
              <button
                className={styles.back}
                type="button"
                onClick={() => {
                  setStep("password");
                  setError("");
                }}
              >
                Back to sign in
              </button>
            </form>
          ) : null}
          {step === "reset" ? (
            <form noValidate onSubmit={saveNewPassword}>
              <h1 className="!text-[clamp(30px,8vw,34px)]">New password</h1>
              <p className={styles.line}>Choose a new password for {email}.</p>
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={nextPassword}
                onChange={(event) => setNextPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
              />
              {error ? <p className={styles.error}>{error}</p> : null}
              <button type="submit">Save password</button>
              <button
                className={styles.back}
                type="button"
                onClick={() => {
                  setStep("password");
                  setError("");
                }}
              >
                Back to sign in
              </button>
            </form>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
