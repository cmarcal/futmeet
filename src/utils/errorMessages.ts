export const ERROR_MESSAGES = {
  STORAGE_ERROR: 'Unable to save your data. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'Something went wrong. Please refresh the page.',
  GAME_NOT_FOUND: 'This game session could not be found.',
  NETWORK_ERROR: 'A network error occurred. Please check your connection.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('storage') || error.message.toLowerCase().includes('quota')) {
      return ERROR_MESSAGES.STORAGE_ERROR;
    }
    if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};
