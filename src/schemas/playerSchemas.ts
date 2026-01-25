import { z } from 'zod';

export const addPlayerSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters')),
});

export const teamSettingsSchema = z.object({
  teamCount: z.number().int('Team count must be an integer').min(2, 'Minimum 2 teams').max(10, 'Maximum 10 teams'),
});

export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type TeamSettingsInput = z.infer<typeof teamSettingsSchema>;
