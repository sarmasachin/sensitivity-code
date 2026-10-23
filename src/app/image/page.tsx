import type { Metadata } from "next";
import { ImageScreen } from "@/components/image-screen";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Image",
};

export default function ImagePage() {
  return (
    <div className={styles.page}>
      <ImageScreen />
    </div>
  );
}
