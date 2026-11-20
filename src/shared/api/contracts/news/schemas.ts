import { z } from 'zod';

import { ResponseBaseEntity } from '@/shared/api/schemas';

/** A news post written in the panel; `content` is Markdown. */
export type PanelNewsEntity = {
  id: number;
  title: string;
  content: string;
  profileName: string | null;
  buildVersion: string | null;
  /** ISO 8601 with offset. */
  date: string;
};

export type TPanelNewsWriteRequest = {
  title: string;
  content: string;
  profileName: string | null;
  buildVersion: string | null;
  /** UTC ISO instant; null means "now". */
  date: string | null;
};

export type TGetPanelNewsResponse = ResponseBaseEntity & { data: PanelNewsEntity[] };
export type TPanelNewsResponse = ResponseBaseEntity & { data: PanelNewsEntity };
export type TDeletePanelNewsResponse = ResponseBaseEntity;

// Limits mirror PanelNewsWriteDtoValidator on the API.
export const NewsFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Введите заголовок' })
    .max(200, { message: 'Заголовок не длиннее 200 символов' }),
  content: z.string().max(20000, { message: 'Текст не длиннее 20000 символов' }),
  profileName: z.string(),
  buildVersion: z.string().max(100, { message: 'Версия не длиннее 100 символов' }),
  date: z.string().min(1, { message: 'Укажите дату' }),
});

export type NewsFormSchemaType = z.infer<typeof NewsFormSchema>;
