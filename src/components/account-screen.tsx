"use client";

import { useEffect, useState } from "react";
import { accountEmailKey, savedCount } from "@/lib/session";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./account-screen.module.css";

export function AccountScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(0);

  useEffect(() => {
    setEmail(sessionStorage.getItem(accountEmailKey));
    setSaved(savedCount());
    setReady(true);
  }, []);

  return (
    <>
      <SiteHeader onGate={() => undefined} />
      <main>
        <div className={styles.main}>
          {ready && email ? (
            <>
              <div className={styles.head}>
                <div>
                  <p className={styles.kicker}>Signed in</p>
                  <h1>Your account</h1>
                </div>
              </div>
              <div className={styles.person}>
                <svg className={styles.avatar} viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="32" fill="#243044" />
                  <circle cx="32" cy="26" r="10" fill="#f7f4ee" />
                  <path d="M14 56c2.2-12 10-16 18-16s15.8 4 18 16" fill="#f7f4ee" />
                </svg>
                <div>
                  <p className={styles.email}>{email}</p>
                  <p className={styles.note}>This address stays on your account. It is never shown on a code.</p>
                </div>
              </div>
              <nav className={styles.menu} aria-label="Account menu">
                <a href="/submit">Submit code</a>
                <a href="/account#saved">Saved codes</a>
                <a href="/account#submissions">Your codes</a>
                <a href="/edit">Edit code</a>
                <a href="/id-card">ID card</a>
              </nav>
              <div className={styles.cards}>
                <section className={styles.card} id="saved">
                  <p className={styles.count}>{saved}</p>
                  <h2>Saved codes</h2>
                  <p>Save a code from the gallery and it stays on this account.</p>
                  <a href="/">Open gallery</a>
                </section>
                <section className={styles.card} id="submissions">
                  <p className={styles.count}>0</p>
                  <h2>Submissions</h2>
                  <p>Nothing is in review. Approved codes show on the public gallery.</p>
                </section>
                <section className={`${styles.card} ${styles.submit}`} id="submit">
                  <h2>Submit a code</h2>
                  <p>Phone, code, fingers, gyro, and a proof screenshot. It stays hidden until approved.</p>
                  <a href="/submit">Open form</a>
                </section>
              </div>
            </>
          ) : null}
          {ready && !email ? (
            <div className={styles.locked}>
              <h1>Your account</h1>
              <p>Sign in with email to open saved codes and submissions.</p>
              <a className={styles.primary} href="/login">
                Sign in
              </a>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
