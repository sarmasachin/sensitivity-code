import type { ReactNode } from "react";
import styles from "./edit-screen.module.css";

export function Field({
  label,
  id,
  wide,
  children,
}: {
  label: string;
  id: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? `${styles.field} ${styles.wide}` : styles.field}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export function Choice({
  label,
  values,
  selected,
  onPick,
  wide,
}: {
  label: string;
  values: string[];
  selected: string;
  onPick: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <fieldset className={wide ? `${styles.field} ${styles.wide}` : styles.field}>
      <legend>{label}</legend>
      <div className={styles.choice}>
        {values.map((value) => (
          <button key={value} type="button" aria-pressed={selected === value} onClick={() => onPick(value)}>
            {value}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
