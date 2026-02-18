import { customAlphabet } from 'nanoid';

// Alphanumeric-only alphabet: avoids _ and - which WhatsApp treats as
// italic/strikethrough formatting markers, breaking URL auto-detection.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoidAlphanumeric = customAlphabet(ALPHABET, 21);

// Accepts both the new alphanumeric-only IDs and legacy IDs that may
// contain _ or - (generated before the alphabet was restricted).
const GAME_ID_REGEX = /^[A-Za-z0-9_-]{21}$/;

export const generateGameId = (): string => nanoidAlphanumeric();

export const isValidGameId = (id: string): boolean => GAME_ID_REGEX.test(id);
