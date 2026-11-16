import type { ReactNode } from 'react';
import { Link } from 'react-router';

type BookLinkProps = {
  bookId: string;
  available: boolean;
  label: string;
  className?: string;
  onMissing: (bookId: string) => void;
  children: ReactNode;
};

/** Książka z plikiem otwiera czytnik; bez pliku — prośbę o ponowne wgranie. */
export function BookLink({
  bookId,
  available,
  label,
  className,
  onMissing,
  children,
}: BookLinkProps) {
  if (available) {
    return (
      <Link to={`/czytaj/${bookId}`} className={className} aria-label={label}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      aria-label={`${label} — plik niedostępny na tym urządzeniu`}
      onClick={() => {
        onMissing(bookId);
      }}
    >
      {children}
    </button>
  );
}
