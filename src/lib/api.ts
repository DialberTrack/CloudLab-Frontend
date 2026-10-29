import type { ContainerImage, User, Workspace } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type ApiErrorPayload = { error?: string; code?: string; issues?: unknown };

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

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        accessToken = null;
        return null;
    }
    const payload = (await response.json()) as { accessToken: string };
    accessToken = payload.accessToken;
    return accessToken;
};

const refresh = () => {
    refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
    });
    return refreshPromise;
};

const request = async <T>(
    path: string,
    options: RequestInit = {},
    retry = true
): Promise<T> => {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });
    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload & T;

    if (response.status === 401 && retry && !path.startsWith('/auth/')) {
        if (await refresh()) {
            return request<T>(path, options, false);
        }
    }
    if (!response.ok) {
        throw new ApiError(
            payload.error ?? 'No se pudo completar la solicitud.',
            response.status,
            payload.code,
            payload.issues
        );
    }
    return payload;
};

const query = (params: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            search.set(key, String(value));
        }
    });
    const result = search.toString();
    return result ? `?${result}` : '';
};

export const authApi = {
    async login(email: string, password: string) {
        const response = await request<{ accessToken: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        accessToken = response.accessToken;
        return request<{ user: User }>('/auth/me').then((profile) => profile.user);
    },
    async restore() {
        if (!(await refresh())) {
            throw new ApiError('Tu sesión ha expirado.', 401);
        }
        return request<{ user: User }>('/auth/me').then((response) => response.user);
    },
    async me() {
        return request<{ user: User }>('/auth/me').then((response) => response.user);
    },
    async logout() {
        await request('/auth/logout', { method: 'POST' }, false);
        accessToken = null;
    },
    async changePassword(current: string, password: string) {
        const response = await request<{ accessToken: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ current, password }),
        });
        accessToken = response.accessToken;
    },
};

export const workspaceApi = {
    list: (params?: { page?: number; limit?: number; q?: string }) =>
        request<{ data: Workspace[]; pagination: Pagination }>(
            `/workspaces${query(params ?? {})}`
        ),
    create: (name: string, containerImageId: string) =>
        request<Workspace>('/workspaces', {
            method: 'POST',
            body: JSON.stringify({ name, container_image_id: containerImageId }),
        }),
    get: (id: string) => request<Workspace>(`/workspaces/${id}`),
    action: (id: string, action: 'start' | 'stop' | 'restart') =>
        request<Workspace>(`/workspaces/${id}/${action}`, { method: 'POST' }),
    metrics: (id: string) =>
        request<{ data: Record<string, unknown> }>(`/workspaces/${id}/metrics`),
    remove: (id: string) => request(`/workspaces/${id}`, { method: 'DELETE' }),
};

export const imageApi = {
    list: () => request<{ data: ContainerImage[] }>('/container-images'),
    get: (id: string) => request<{ data: ContainerImage }>(`/container-images/${id}`),
    create: (
        input: Pick<ContainerImage, 'name' | 'image' | 'description' | 'icon' | 'sort_order'> & {
            is_active: boolean;
        }
    ) =>
        request<{ data: ContainerImage }>('/container-images', {
            method: 'POST',
            body: JSON.stringify(input),
        }),
    update: (
        id: string,
        input: Partial<
            Pick<ContainerImage, 'name' | 'image' | 'description' | 'icon' | 'is_active' | 'sort_order'>
        >
    ) =>
        request<{ data: ContainerImage }>(`/container-images/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(input),
        }),
    remove: (id: string) => request(`/container-images/${id}`, { method: 'DELETE' }),
};

export const adminApi = {
    users: (params?: { page?: number; limit?: number; q?: string }) =>
        request<{ data: User[]; pagination: Pagination }>(`/admin/users${query(params ?? {})}`),
    workspaces: (params?: { page?: number; limit?: number; q?: string }) =>
        request<{ data: Workspace[]; pagination: Pagination }>(
            `/admin/workspaces${query(params ?? {})}`
        ),
    createUser: (input: { name: string; email: string; password: string; role: User['role'] }) =>
        request<{ user: User }>('/admin/users', {
            method: 'POST',
            body: JSON.stringify(input),
        }),
    updateUser: (id: string, input: Partial<Pick<User, 'name' | 'email' | 'role' | 'is_active'>>) =>
        request<{ user: User }>(`/admin/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(input),
        }),
    resetPassword: (id: string) =>
        request<{ message: string; user: { id: string; email: string; newPassword: string } }>(
            `/admin/users/${id}/reset-password`,
            { method: 'POST' }
        ),
    removeUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};
