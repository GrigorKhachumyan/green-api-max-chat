import type { Quote } from '@/state';

interface Props {
  quote: Quote;
  contactName: string;
}

export function ReplyQuote({ quote, contactName }: Props) {
  const author = quote.direction && (quote.direction === 'outgoing' ? 'Вы' : contactName);

  return (
    <div className="mb-1 min-w-0 rounded-md border-l-2 border-accent bg-accent/5 px-2 py-1 text-[13px] leading-snug">
      {author && <p className="truncate font-medium text-accent">{author}</p>}
      <p className="truncate text-muted">{quote.text}</p>
    </div>
  );
}
