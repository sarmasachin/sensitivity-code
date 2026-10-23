import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <InfoPage title="Privacy" />
    </div>
  );
}
