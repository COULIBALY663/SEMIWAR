import { isAxiosError } from 'axios';

export function messageErreur(e: unknown): string {
  if (isAxiosError(e) && typeof e.response?.data?.message === 'string') {
    return e.response.data.message;
  }
  return 'Une erreur est survenue, veuillez réessayer';
}
