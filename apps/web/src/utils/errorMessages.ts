export const ERROR_MESSAGES = {
  STORAGE_ERROR: 'Não foi possível salvar seus dados. Tente novamente.',
  VALIDATION_ERROR: 'Verifique suas informações e tente novamente.',
  UNKNOWN_ERROR: 'Algo deu errado. Atualize a página.',
  GAME_NOT_FOUND: 'Esta sessão de jogo não foi encontrada.',
  NETWORK_ERROR: 'Ocorreu um erro de conexão. Verifique sua conexão.',
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
