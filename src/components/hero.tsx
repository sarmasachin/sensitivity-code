import styles from "./hero.module.css";

export function Hero({ game }: { game: string }) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        <span className={styles.name}>{game === "All" ? "All Games" : game}</span>
        <br />
        Sensitivity Code
      </h1>
      <p className={styles.line}>
        Approved settings from players of BGMI, BGMI Lite, PUBG Mobile, and PUBG Mobile Lite.
      </p>
    </section>
  );
}
