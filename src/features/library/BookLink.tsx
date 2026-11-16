import type { ReactNode } from 'react';
import { Link } from 'react-router';

type BookLinkProps = {
  bookId: string;
  available: boolean;
  className?: string;
  onMissing: (bookId: string) => void;
  children: ReactNode;
};

/** Książka z plikiem otwiera czytnik; bez pliku — prośbę o ponowne wgranie. */
export function BookLink({ bookId, available, className, onMissing, children }: BookLinkProps) {
  if (available) {
    return (
      <Link to={`/czytaj/${bookId}`} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onMissing(bookId);
      }}
    >
      {children}
      <span className="visually-hidden"> — plik niedostępny na tym urządzeniu</span>
    </button>
  );
}
