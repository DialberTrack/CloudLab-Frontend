import { useMutation, useQueryClient } from '@tanstack/react-query';
import { containerImagesApi } from './api';
import { containerImageKeys } from './keys';
import type { CreateContainerImageInput, UpdateContainerImageInput } from './types';

function useInvalidateImages() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: containerImageKeys.all });
}

export function useCreateContainerImage() {
  const invalidate = useInvalidateImages();
  return useMutation({
    mutationFn: (input: CreateContainerImageInput) => containerImagesApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateContainerImage() {
  const invalidate = useInvalidateImages();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContainerImageInput }) =>
      containerImagesApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteContainerImage() {
  const invalidate = useInvalidateImages();
  return useMutation({
    mutationFn: (id: string) => containerImagesApi.remove(id),
    onSuccess: invalidate,
  });
}
