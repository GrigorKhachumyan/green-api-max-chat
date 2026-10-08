export class GreenApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
  }
}

export const NETWORK_ERROR_STATUS = 0;
export const TIMEOUT_MESSAGE = 'Сервер GREEN-API не отвечает';

const MESSAGES: Record<number, string> = {
  [NETWORK_ERROR_STATUS]: 'Нет соединения с сервером GREEN-API',
  401: 'Неверный idInstance или apiTokenInstance',
  403: 'Неверный idInstance или apiTokenInstance',
  404: 'Метод не найден — проверьте apiUrl',
  429: 'Слишком много запросов, попробуйте позже',
  466: 'Превышен лимит тарифа Developer',
};

export function messageForStatus(status: number): string {
  return MESSAGES[status] ?? (status >= 500 ? 'Сервер GREEN-API временно недоступен' : `Ошибка запроса (${status})`);
}

export function isAuthError(error: unknown): boolean {
  return error instanceof GreenApiError && (error.status === 401 || error.status === 403);
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof GreenApiError ? error.message : fallback;
}
