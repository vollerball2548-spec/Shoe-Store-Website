import { cx } from '../lib/utils';

interface BrandLogoProps {
  compact?: boolean;
  light?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, light = false, className }: BrandLogoProps) {
  return (
    <div className={cx('select-none leading-none', className)}>
      <div
        className={cx(
          'font-display font-extrabold tracking-[-0.065em]',
          compact ? 'text-[22px]' : 'text-[27px]',
          light ? 'text-cream' : 'text-ink'
        )}
      >
        patsakorn<span className="text-clay">.</span>
      </div>
      <div
        className={cx(
          'mt-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.42em]',
          light ? 'text-cream/55' : 'text-muted'
        )}
      >
        <span className={cx('h-px w-3', light ? 'bg-cream/35' : 'bg-line')} />
        mix shop
      </div>
    </div>
  );
}
