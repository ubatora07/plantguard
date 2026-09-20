/** Russian date formatting helpers (MVP is Russian-only). */

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/** "12 июня 2025 · 14:32" */
export function formatRecordDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getDate();
  const month = MONTHS_GENITIVE[date.getMonth()];
  const year = date.getFullYear();
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${day} ${month} ${year} · ${time}`;
}

/** "0.88" (0..1) → "88%". */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
