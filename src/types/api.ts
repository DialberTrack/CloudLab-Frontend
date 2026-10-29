export type Role = 'user' | 'admin';

export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
};

export type WorkspaceStatus = 'creating' | 'running' | 'stopped' | 'error' | 'deleting';

export type Workspace = {
    id: string;
    name: string;
    status: WorkspaceStatus;
    container_id?: string | null;
    image_name: string;
    image: string;
    created_at: string;
    updated_at?: string;
    error_message?: string | null;
    user_id?: string;
};

export type ContainerImage = {
    id: string;
    name: string;
    image: string;
    description?: string | null;
    icon?: string | null;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
};
