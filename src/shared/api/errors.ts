export const NETWORK_ERROR_CODE = 'NETWORK_ERROR';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly issues?: unknown;

  constructor(message: string, status: number, code?: string, issues?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

export const isApiError = (reason: unknown): reason is ApiError => reason instanceof ApiError;

export const isNetworkError = (reason: unknown): boolean =>
  isApiError(reason) && reason.code === NETWORK_ERROR_CODE;

const firstValidationMessage = (issues: unknown): string | undefined => {
  if (!Array.isArray(issues) || issues.length === 0) return undefined;

  const [first] = issues as Array<string | { message?: unknown } | undefined>;
  if (typeof first === 'string' && first.trim()) return first;
  if (
    first &&
    typeof first === 'object' &&
    typeof first.message === 'string' &&
    first.message.trim()
  ) {
    return first.message;
  }
  return undefined;
};

/** Mensaje legible para mostrar al usuario a partir de cualquier error. */
export const messageOf = (reason: unknown): string => {
  if (!isApiError(reason)) return 'Ocurrió un error inesperado.';
  if (reason.code === 'VALIDATION_ERROR') {
    return firstValidationMessage(reason.issues) ?? reason.message;
  }
  return reason.message;
};
