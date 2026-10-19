import type { Metadata } from "next";
import { LoginScreen } from "@/components/login-screen";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <LoginScreen />
    </div>
  );
}
