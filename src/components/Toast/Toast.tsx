import { useToastStore } from '../../store/toastStore';
import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className={styles.icon}>
            {toast.type === 'success' ? '\u2713' : '\u2717'}
          </span>
          <span className={styles.message}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
