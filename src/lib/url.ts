export function isValidApiUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const labels = url.hostname.split('.');
    return url.protocol === 'https:' && labels.length >= 2 && labels.every((label) => /^[a-z0-9-]+$/i.test(label));
  } catch {
    return false;
  }
}
