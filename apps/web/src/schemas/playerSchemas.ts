import { z } from 'zod';

/** Characters that could be used in HTML/script injection; rejected for defense-in-depth. */
const DISALLOWED_NAME_CHARS = /[<>]/;

export const addPlayerSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'Nome é obrigatório')
        .max(50, 'O nome deve ter no máximo 50 caracteres')
        .refine((val) => !DISALLOWED_NAME_CHARS.test(val), {
          message: 'O nome não pode conter os caracteres < ou >',
        })
    ),
});

export const teamSettingsSchema = z.object({
  teamCount: z.number().int('O número de times deve ser um número inteiro').min(2, 'Mínimo de 2 times').max(10, 'Máximo de 10 times'),
});

export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type TeamSettingsInput = z.infer<typeof teamSettingsSchema>;
