export type ContainerImage = {
  id: string;
  name: string;
  image: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateContainerImageInput = {
  name: string;
  image: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type UpdateContainerImageInput = Partial<CreateContainerImageInput>;
