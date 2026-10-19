import type { Metadata } from "next";
import { AccountScreen } from "@/components/account-screen";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Your account",
};

export default function AccountPage() {
  return (
    <div className={styles.page}>
      <AccountScreen />
    </div>
  );
}
