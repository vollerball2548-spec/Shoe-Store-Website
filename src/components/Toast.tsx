import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cx } from '../lib/utils';

export interface ToastMessage {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

const TONE = {
  success: {
    icon: CheckCircle2,
    className: 'border-sage/45 bg-[#f1f4ec] text-[#49543f]',
    iconClass: 'text-sage'
  },
  error: {
    icon: AlertCircle,
    className: 'border-clay/30 bg-[#fbeee7] text-[#7e432b]',
    iconClass: 'text-clay'
  },
  info: {
    icon: Info,
    className: 'border-line bg-cream-soft text-ink',
    iconClass: 'text-ink/55'
  }
};

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;
  const tone = TONE[toast.tone];
  const Icon = tone.icon;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[110] flex justify-center px-4">
      <div
        className={cx(
          'animate-fade-up pointer-events-auto flex max-w-md items-center gap-3 rounded-full border px-4 py-3 shadow-[0_18px_50px_-18px_rgba(23,21,18,0.45)] backdrop-blur',
          tone.className
        )}
        role="status"
      >
        <Icon className={cx('h-4 w-4 shrink-0', tone.iconClass)} />
        <p className="text-[11px] font-semibold leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 shrink-0 opacity-50 transition-opacity hover:opacity-100"
          aria-label="ปิดการแจ้งเตือน"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
