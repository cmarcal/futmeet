import { customAlphabet } from 'nanoid';

// Alphanumeric-only alphabet: avoids _ and - which WhatsApp treats as
// italic/strikethrough formatting markers, breaking URL auto-detection.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoidAlphanumeric = customAlphabet(ALPHABET, 21);

const GAME_ID_REGEX = /^[A-Za-z0-9]{21}$/;

export const generateGameId = (): string => nanoidAlphanumeric();

export const isValidGameId = (id: string): boolean => GAME_ID_REGEX.test(id);
