import { customAlphabet } from 'nanoid';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoidAlphanumeric = customAlphabet(ALPHABET, 21);

// Strict alphanumeric-only regex (no _ or -)
const GAME_ID_REGEX = /^[A-Za-z0-9]{21}$/;

export const generateGameId = (): string => nanoidAlphanumeric();

export const isValidGameId = (id: string): boolean => GAME_ID_REGEX.test(id);
