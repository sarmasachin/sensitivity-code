import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <InfoPage title="Contact" />
    </div>
  );
}
