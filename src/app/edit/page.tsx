import type { Metadata } from "next";
import { EditEntry } from "@/components/edit-entry";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Edit",
};

export default function EditPage() {
  return (
    <div className={styles.page}>
      <EditEntry />
    </div>
  );
}
