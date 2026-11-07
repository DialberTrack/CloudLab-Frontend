import { QueryClient } from '@tanstack/react-query';
import { isApiError, isNetworkError } from '@/shared/api/errors';

const MAX_NETWORK_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Los errores de la API son definitivos; solo se reintentan los fallos de red.
      retry: (failureCount, error) =>
        !isApiError(error) || (isNetworkError(error) && failureCount < MAX_NETWORK_RETRIES),
    },
  },
});
