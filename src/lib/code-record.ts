export type SensitivityCode = {
  id: string;
  game: string;
  phone: string;
  player: string;
  gyro: "Gyro" | "Non-Gyro";
  fingers: "2" | "3" | "4";
  ram: string;
  rank: string | null;
  playStyle: string;
  code: string;
  working: number;
  notWorking: number;
  publishedAt: string;
  publishedLabel: string;
};
