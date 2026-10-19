import type { Metadata } from "next";
import { SubmitScreen } from "@/components/submit-screen";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Submit a code",
};

export default function SubmitPage() {
  return (
    <div className={styles.page}>
      <SubmitScreen />
    </div>
  );
}
