import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Dialog.module.css';

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Natywny <dialog> daje pułapkę fokusu, Esc i tło bez dodatkowego kodu. */
export function Dialog({ open, title, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onClose={onClose}>
      <div className={styles.body}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label="Zamknij" onClick={onClose}>
            <Icon name="close" size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
