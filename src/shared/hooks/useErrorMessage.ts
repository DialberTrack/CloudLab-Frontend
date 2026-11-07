import { useState } from 'react';
import { messageOf } from '@/shared/api/errors';

/** Estado de error de pantalla para operaciones disparadas por el usuario. */
export function useErrorMessage() {
  const [error, setError] = useState('');

  return {
    error,
    report: (reason: unknown) => setError(messageOf(reason)),
    clear: () => setError(''),
  };
}
