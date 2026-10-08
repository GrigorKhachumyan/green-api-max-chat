export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '');
}

export function isValidPhone(digits: string): boolean {
  return /^\d{10,15}$/.test(digits);
}

export function isTelegramUsername(value: string): boolean {
  return /^@\w{4,32}$/.test(value);
}

export function formatPhone(digits: string): string {
  return `+${digits}`;
}
