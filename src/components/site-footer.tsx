import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>Sensitivity Codes</p>
        <p>Reviewed community settings. Email addresses stay private.</p>
      </div>
    </footer>
  );
}
