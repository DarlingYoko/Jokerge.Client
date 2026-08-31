import { z } from 'zod';

export const integrationSchema = z
  .object({
    enabled: z.boolean(),
    clientId: z.string().transform((v) => v.trim()),
    details: z.string().transform((v) => v.trim()),
    largeImageKey: z.string().transform((v) => v.trim()),
    largeImageText: z.string().transform((v) => v.trim()),
    smallImageKey: z.string().transform((v) => v.trim()),
    smallImageText: z.string().transform((v) => v.trim()),
  })
  .superRefine((data, ctx) => {
    if (data.enabled && !data.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientId'],
        message: 'Client ID обязателен для заполнения',
      });
    }
  });

export type DiscordFormSchemaType = z.infer<typeof integrationSchema>;
