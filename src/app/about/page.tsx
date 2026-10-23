import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <InfoPage title="About Us" />
    </div>
  );
}
