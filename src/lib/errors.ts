import { ApiError } from './api';

type ValidationIssue = {
    message?: unknown;
};

const firstValidationMessage = (issues: unknown): string | undefined => {
    if (!Array.isArray(issues) || issues.length === 0) {
        return undefined;
    }

    const firstIssue = issues[0] as ValidationIssue | string | undefined;
    if (typeof firstIssue === 'string' && firstIssue.trim()) {
        return firstIssue;
    }

    if (
        firstIssue &&
        typeof firstIssue === 'object' &&
        typeof firstIssue.message === 'string' &&
        firstIssue.message.trim()
    ) {
        return firstIssue.message;
    }

    return undefined;
};

export const messageOf = (reason: unknown) => {
    if (!(reason instanceof ApiError)) {
        return 'Ocurrió un error inesperado.';
    }

    if (reason.code === 'VALIDATION_ERROR') {
        return firstValidationMessage(reason.issues) ?? reason.message;
    }

    return reason.message;
};

export const isApiError = (reason: unknown): reason is ApiError => reason instanceof ApiError;
