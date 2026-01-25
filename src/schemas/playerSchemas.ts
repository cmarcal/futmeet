import { z } from 'zod';

/**
 * Schema for adding a new player
 */
export const addPlayerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
});

/**
 * Schema for team configuration settings
 */
export const teamSettingsSchema = z.object({
  teamCount: z
    .number()
    .int('Team count must be an integer')
    .min(2, 'Team count must be at least 2')
    .max(10, 'Team count must be at most 10'),
});

/**
 * TypeScript type inferred from addPlayerSchema
 */
export type AddPlayerInput = z.infer<typeof addPlayerSchema>;

/**
 * TypeScript type inferred from teamSettingsSchema
 */
export type TeamSettingsInput = z.infer<typeof teamSettingsSchema>;
