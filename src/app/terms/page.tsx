import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <InfoPage title="Terms" />
    </div>
  );
}
