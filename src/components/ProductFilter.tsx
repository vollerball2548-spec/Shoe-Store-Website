import React from 'react';
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react';
import { FilterState, ShoeBrand, ShoeCategory } from '../types';

interface ProductFilterProps {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
  onReset: () => void;
  totalProductsCount: number;
}

const BRANDS: ShoeBrand[] = ['Nike', 'Adidas', 'Jordan', 'New Balance', 'Asics', 'Puma', 'Yeezy'];
const CATEGORIES: ShoeCategory[] = ['Lifestyle', 'Running', 'Basketball', 'Skateboarding', 'Retro'];
const SIZES = ['US 6.5', 'US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11'];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  filter,
  onChange,
  onReset,
  totalProductsCount
}) => {
  const toggleBrand = (brand: ShoeBrand) => {
    const nextBrands = filter.brands.includes(brand)
      ? filter.brands.filter(b => b !== brand)
      : [...filter.brands, brand];
    onChange({ ...filter, brands: nextBrands });
  };

  const toggleCategory = (category: ShoeCategory) => {
    const nextCategories = filter.categories.includes(category)
      ? filter.categories.filter(c => c !== category)
      : [...filter.categories, category];
    onChange({ ...filter, categories: nextCategories });
  };

  const activeFiltersCount = 
    filter.brands.length + 
    filter.categories.length + 
    (filter.gender !== 'All' ? 1 : 0) + 
    (filter.inStockOnly ? 1 : 0) +
    (filter.selectedSize ? 1 : 0) +
    (filter.minPrice > 0 || filter.maxPrice < 15000 ? 1 : 0);

  return (
    <aside className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 text-zinc-100 flex flex-col gap-6 sticky top-20 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
            ตัวกรองสินค้า
          </h2>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-zinc-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ต</span>
          </button>
        )}
      </div>

      {/* Sort By Selector */}
      <div>
        <label className="text-xs font-bold text-zinc-300 mb-2 block uppercase tracking-wider">
          เรียงตาม (Sort by)
        </label>
        <select
          id="filter-sort-select"
          value={filter.sortBy}
          onChange={(e) => onChange({ ...filter, sortBy: e.target.value as any })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-sky-500"
        >
          <option value="featured">✨ สินค้าแนะนำ (Featured)</option>
          <option value="price-asc">💵 ราคา: ต่ำไปสูง</option>
          <option value="price-desc">💎 ราคา: สูงไปต่ำ</option>
          <option value="newest">🆕 มาใหม่ล่าสุด</option>
          <option value="rating">⭐ คะแนนรีวิวสูงสุด</option>
        </select>
      </div>

      {/* In-Stock Only Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
        <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          เฉพาะที่มีสต็อกพร้อมส่ง
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...filter, inStockOnly: !filter.inStockOnly })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            filter.inStockOnly ? 'bg-blue-600' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              filter.inStockOnly ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Brands Filter */}
      <div>
        <label className="text-xs font-bold text-zinc-300 mb-2.5 block uppercase tracking-wider">
          แบรนด์ (Brand)
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {BRANDS.map((b) => {
            const isSelected = filter.brands.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggleBrand(b)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-blue-600/20 border-sky-500 text-sky-400 font-bold'
                    : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span>{b}</span>
                {isSelected && <Check className="w-3 h-3 text-sky-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="text-xs font-bold text-zinc-300 mb-2.5 block uppercase tracking-wider">
          หมวดหมู่ (Category)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const isSelected = filter.categories.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
          <span>ช่วงราคา (THB)</span>
          <span className="text-sky-400">฿{filter.maxPrice.toLocaleString('th-TH')}</span>
        </div>
        <input
          type="range"
          min="2000"
          max="10000"
          step="200"
          value={filter.maxPrice}
          onChange={(e) => onChange({ ...filter, maxPrice: Number(e.target.value) })}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
          <span>฿2,000</span>
          <span>฿6,000</span>
          <span>฿10,000+</span>
        </div>

        {/* Quick Price Buttons */}
        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
          <button
            onClick={() => onChange({ ...filter, minPrice: 0, maxPrice: 4000 })}
            className="px-2 py-1 rounded text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-sky-400 hover:border-sky-500/40"
          >
            &lt; ฿4,000
          </button>
          <button
            onClick={() => onChange({ ...filter, minPrice: 4000, maxPrice: 6500 })}
            className="px-2 py-1 rounded text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-sky-400 hover:border-sky-500/40"
          >
            ฿4k - ฿6.5k
          </button>
          <button
            onClick={() => onChange({ ...filter, minPrice: 6500, maxPrice: 15000 })}
            className="px-2 py-1 rounded text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-sky-400 hover:border-sky-500/40"
          >
            &gt; ฿6.5k
          </button>
        </div>
      </div>

      {/* Shoe Sizes Filter */}
      <div>
        <label className="text-xs font-bold text-zinc-300 mb-2 block uppercase tracking-wider">
          ขนาดไซส์ (Size)
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {SIZES.map((sz) => {
            const isSelected = filter.selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => onChange({ ...filter, selectedSize: isSelected ? '' : sz })}
                className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {sz.replace('US ', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Count Status */}
      <div className="pt-2 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
        พบสินค้าทั้งหมด <span className="font-bold text-sky-400">{totalProductsCount}</span> รายการ
      </div>
    </aside>
  );
};
