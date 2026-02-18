import { customAlphabet } from 'nanoid';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoidAlphanumeric = customAlphabet(ALPHABET, 21);

const GAME_ID_REGEX = /^[A-Za-z0-9_-]{21}$/;

export const generateGameId = (): string => nanoidAlphanumeric();

export const isValidGameId = (id: string): boolean => GAME_ID_REGEX.test(id);
