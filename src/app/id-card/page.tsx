import type { Metadata } from "next";
import { IdCardScreen } from "@/components/id-card-screen";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "ID card",
};

export default function IdCardPage() {
  return (
    <div className={styles.page}>
      <IdCardScreen />
    </div>
  );
}
