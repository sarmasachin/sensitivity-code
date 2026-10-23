import styles from "./hero.module.css";

export function Hero({ game }: { game: string }) {
  return (
    <section className={styles.hero}>
      <h1 className={`${styles.title} text-balance`}>
        {game === "All" ? "All Games" : game} Sensitivity Code
      </h1>
    </section>
  );
}
