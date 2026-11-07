import { useQuery } from '@tanstack/react-query';
import { containerImagesApi } from './api';
import { containerImageKeys } from './keys';

export const useContainerImages = () =>
  useQuery({
    queryKey: containerImageKeys.list(),
    queryFn: containerImagesApi.list,
  });
