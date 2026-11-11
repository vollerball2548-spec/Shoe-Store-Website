import { useState } from 'react';
import { ChevronDown, ListFilter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterState, ProductCategory, PRODUCT_CATEGORIES } from '../types';
import { CATEGORY_META, cx, formatPrice } from '../lib/utils';

interface ProductFilterProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  brands: string[];
  counts: Record<string, number>;
  total: number;
  resultCount: number;
}

const SORTS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'featured', label: 'คัดสรรแนะนำ' },
  { value: 'newest', label: 'มาใหม่ล่าสุด' },
  { value: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคาสูง → ต่ำ' },
  { value: 'rating', label: 'คะแนนสูงสุด' }
];

export function ProductFilter({
  filters,
  onChange,
  onReset,
  brands,
  counts,
  total,
  resultCount
}: ProductFilterProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleCategory = (category: ProductCategory) => {
    onChange({
      categories: filters.categories.includes(category)
        ? filters.categories.filter(item => item !== category)
        : [...filters.categories, category]
    });
  };

  const toggleBrand = (brand: string) => {
    onChange({
      brands: filters.brands.includes(brand)
        ? filters.brands.filter(item => item !== brand)
        : [...filters.brands, brand]
    });
  };

  const activeCount =
    filters.categories.length +
    filters.brands.length +
    (filters.search ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.maxPrice < 8000 ? 1 : 0);

  return (
    <div className="rounded-[26px] border border-line/85 bg-cream-soft/70 p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted" />
          <input
            value={filters.search}
            onChange={event => onChange({ search: event.target.value })}
            placeholder="ค้นหาชื่อสินค้า แบรนด์ หรือ SKU..."
            className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted/75"
            aria-label="ค้นหาสินค้าในแคตตาล็อก"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: '' })}
              className="text-muted hover:text-ink"
              aria-label="ล้างคำค้นหา"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(value => !value)}
          className={cx(
            'flex h-[42px] items-center gap-2 rounded-full border px-4 text-[11px] font-semibold transition-colors',
            expanded
              ? 'border-ink bg-ink text-cream'
              : 'border-line bg-white/70 text-ink hover:border-ink/40'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          ตัวกรอง
          {activeCount > 0 && (
            <span
              className={cx(
                'grid h-4 min-w-4 place-items-center rounded-full px-1 text-[8px] font-bold',
                expanded ? 'bg-cream text-ink' : 'bg-clay text-white'
              )}
            >
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cx('h-3 w-3 transition-transform', expanded && 'rotate-180')}
          />
        </button>

        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={event => onChange({ sortBy: event.target.value as FilterState['sortBy'] })}
            className="h-[42px] appearance-none rounded-full border border-line bg-white/70 pl-4 pr-9 text-[11px] font-semibold text-ink outline-none focus:border-ink/40"
            aria-label="เรียงลำดับสินค้า"
          >
            {SORTS.map(sort => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted" />
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => onChange({ categories: [] })}
          className={cx(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold transition-colors',
            filters.categories.length === 0
              ? 'border-ink bg-ink text-cream'
              : 'border-line bg-white/60 text-ink/70 hover:border-ink/35'
          )}
        >
          ทั้งหมด <span className="ml-1 opacity-55">{total}</span>
        </button>
        {PRODUCT_CATEGORIES.map(category => {
          const active = filters.categories.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={cx(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold transition-colors',
                active
                  ? 'border-ink bg-ink text-cream'
                  : 'border-line bg-white/60 text-ink/70 hover:border-ink/35'
              )}
            >
              {CATEGORY_META[category].label}
              <span className="ml-1 opacity-55">{counts[category] || 0}</span>
            </button>
          );
        })}
      </div>

      {expanded && (
        <div className="animate-fade-up mt-4 grid gap-6 border-t border-line/80 pt-4 md:grid-cols-[1fr_1.1fr_auto]">
          <div>
            <p className="label-xs">แบรนด์</p>
            <div className="flex flex-wrap gap-1.5">
              {brands.map(brand => {
                const active = filters.brands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={cx(
                      'rounded-full border px-2.5 py-1 text-[9px] font-semibold transition-colors',
                      active
                        ? 'border-clay bg-clay text-white'
                        : 'border-line bg-white/60 text-ink/65 hover:border-clay/45'
                    )}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="label-xs mb-0">ราคาสูงสุด</p>
              <span className="text-[10px] font-bold">{formatPrice(filters.maxPrice)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={8000}
              step={100}
              value={filters.maxPrice}
              onChange={event => onChange({ maxPrice: Number(event.target.value) })}
              className="mt-3 h-1.5 w-full appearance-none rounded-full bg-sand-deep accent-clay"
              aria-label="ราคาสูงสุด"
            />
            <div className="mt-1.5 flex justify-between text-[8px] text-muted">
              <span>฿500</span>
              <span>฿8,000</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 md:flex-col md:items-end md:justify-end">
            <label className="flex cursor-pointer items-center gap-2.5 text-[10px] font-semibold">
              <span className="relative inline-flex h-5 w-9 items-center">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={event => onChange({ inStockOnly: event.target.checked })}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-sand-deep transition-colors peer-checked:bg-ink" />
                <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
              มีสินค้าพร้อมส่ง
            </label>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-clay hover:underline"
            >
              <RotateCcw className="h-3 w-3" /> ล้างตัวกรอง
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[9px] font-medium text-muted md:hidden">
        <ListFilter className="h-3 w-3" /> แสดง {resultCount} จาก {total} รายการ
      </div>
    </div>
  );
}
