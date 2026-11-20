import type { PanelNewsEntity, TPanelNewsWriteRequest } from '@/shared/api/contracts/news/schemas';

/** Select value for "not bound to a profile" — Radix Select items cannot use an empty string. */
export const NO_PROFILE = '__none__';

export type NewsFormValues = {
  title: string;
  content: string;
  profileName: string;
  buildVersion: string;
  /** Value of an <input type="datetime-local">, in the viewer's local time. */
  date: string;
};

const pad = (value: number) => String(value).padStart(2, '0');

export const toDateTimeLocal = (value: Date | string): string => {
  const date = typeof value === 'string' ? new Date(value) : value;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

/** Local datetime-local value to a UTC ISO string; null when empty or not a date. */
export const fromDateTimeLocal = (value: string): string | null => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const blankToNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const toNewsRequest = (values: NewsFormValues): TPanelNewsWriteRequest => ({
  title: values.title.trim(),
  content: values.content,
  profileName: values.profileName === NO_PROFILE ? null : blankToNull(values.profileName),
  buildVersion: blankToNull(values.buildVersion),
  date: fromDateTimeLocal(values.date),
});

export const toNewsFormValues = (
  news?: PanelNewsEntity,
  now: Date = new Date(),
): NewsFormValues => ({
  title: news?.title ?? '',
  content: news?.content ?? '',
  profileName: news?.profileName ?? NO_PROFILE,
  buildVersion: news?.buildVersion ?? '',
  date: toDateTimeLocal(news?.date ?? now),
});

/** "Сборка: X · Версия: Y" for posts bound to a profile or build; null for posts for everyone. */
export const newsBindingLabel = (
  news: Pick<PanelNewsEntity, 'profileName' | 'buildVersion'>,
): string | null => {
  const parts = [
    news.profileName ? `Сборка: ${news.profileName}` : null,
    news.buildVersion ? `Версия: ${news.buildVersion}` : null,
  ].filter((part): part is string => part !== null);

  return parts.length ? parts.join(' · ') : null;
};

export const sortNewsNewestFirst = <T extends Pick<PanelNewsEntity, 'id' | 'date'>>(
  news: T[],
): T[] =>
  [...news].sort((a, b) => {
    const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
    return byDate !== 0 ? byDate : b.id - a.id;
  });
