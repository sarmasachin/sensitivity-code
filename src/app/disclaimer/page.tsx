import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <div className={styles.page}>
      <InfoPage title="Disclaimer" />
    </div>
  );
}
