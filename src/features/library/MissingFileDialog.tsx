import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import type { Book } from '../../lib/data/models';
import styles from './MissingFileDialog.module.css';

type MissingFileDialogProps = {
  book: Book | null;
  busy: boolean;
  onUpload: () => void;
  onClose: () => void;
};

export function MissingFileDialog({ book, busy, onUpload, onClose }: MissingFileDialogProps) {
  return (
    <Dialog open={book !== null} title="Plik niedostępny na tym urządzeniu" onClose={onClose}>
      {book && (
        <>
          <p className={styles.text}>
            „{book.title}” jest na Twojej półce, ale sam PDF został na innym urządzeniu. Wgraj ten
            sam plik, a czytanie wróci do strony {book.page}.
          </p>
          <Button icon="upload" onClick={onUpload} disabled={busy}>
            {busy ? 'Wczytuję…' : 'Wgraj plik ponownie'}
          </Button>
          <span className={styles.hint}>pliki PDF nie są wysyłane na serwer</span>
        </>
      )}
    </Dialog>
  );
}
