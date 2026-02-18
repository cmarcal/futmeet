import { nanoid } from 'nanoid';

const NANOID_REGEX = /^[A-Za-z0-9_-]{21}$/;

export const generateGameId = (): string => nanoid();

export const isValidGameId = (id: string): boolean => NANOID_REGEX.test(id);
