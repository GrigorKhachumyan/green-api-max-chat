const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp);
}

export function formatShortDate(timestamp: number): string {
  const isToday = new Date(timestamp).toDateString() === new Date().toDateString();
  return isToday ? timeFormat.format(timestamp) : dateFormat.format(timestamp);
}
