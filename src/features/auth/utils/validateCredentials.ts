import type { Credentials } from '@/api';
import { isValidApiUrl } from '@/lib';

export function normalizeCredentials(form: Credentials): Credentials {
  return {
    apiUrl: form.apiUrl.trim().replace(/\/+$/, ''),
    idInstance: form.idInstance.trim(),
    apiTokenInstance: form.apiTokenInstance.trim(),
  };
}

export function validateCredentials({ apiUrl, idInstance, apiTokenInstance }: Credentials): string | null {
  if (!isValidApiUrl(apiUrl)) return 'Укажите apiUrl из личного кабинета, он начинается с https://';
  if (!/^\d+$/.test(idInstance)) return 'idInstance должен состоять из цифр';
  if (!apiTokenInstance) return 'Укажите apiTokenInstance';
  return null;
}
