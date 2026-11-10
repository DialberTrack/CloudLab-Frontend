/** Interfaz que ofrece un contenedor: escritorio (KasmVNC) o terminal (ttyd). */
export type InterfaceType = 'desktop' | 'terminal';

export type ContainerImage = {
  id: string;
  name: string;
  image: string;
  description: string | null;
  icon: string | null;
  interface_type: InterfaceType;
  has_terminal: boolean;
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
  interface_type?: InterfaceType;
  has_terminal?: boolean;
  sort_order?: number;
  is_active?: boolean;
};

/** `interface_type` y `has_terminal` no se pueden editar: los workspaces existentes dependen de ellos. */
export type UpdateContainerImageInput = Partial<
  Omit<CreateContainerImageInput, 'interface_type' | 'has_terminal'>
>;
