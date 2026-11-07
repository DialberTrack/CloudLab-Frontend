import { http } from '@/shared/api/http';
import type { ContainerImage, CreateContainerImageInput, UpdateContainerImageInput } from './types';

export const containerImagesApi = {
  /** Los usuarios reciben solo imágenes activas; los administradores, todas. */
  list: () => http.get<ContainerImage[]>('/container-images'),

  get: (id: string) => http.get<ContainerImage>(`/container-images/${id}`),

  create: (input: CreateContainerImageInput) =>
    http.post<ContainerImage>('/container-images', input),

  update: (id: string, input: UpdateContainerImageInput) =>
    http.patch<ContainerImage>(`/container-images/${id}`, input),

  remove: (id: string) => http.remove(`/container-images/${id}`),
};
