
import React, { useState, useEffect } from 'react';
import { Asset, AssetType, Currency } from '../types';

interface AssetFormProps {
  initialAsset?: Asset | null;
  onSave: (asset: Omit<Asset, 'id' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ initialAsset, onSave, onCancel }) => {
  const [type, setType] = useState<AssetType>(initialAsset?.type || AssetType.TW_STOCK);
  const [symbol, setSymbol] = useState(initialAsset?.symbol || '');
  const [customName, setCustomName] = useState(initialAsset?.name || '');
  const [shares, setShares] = useState(initialAsset?.shares?.toString() || '1');
  const [price, setPrice] = useState(initialAsset?.price?.toString() || '');
  const [currency, setCurrency] = useState<Currency>(initialAsset?.currency || Currency.TWD);

  useEffect(() => {
    if (!initialAsset) {
      if (type === AssetType.US_STOCK) setCurrency(Currency.USD);
      else if (type === AssetType.TW_STOCK) setCurrency(Currency.TWD);
    }
  }, [type, initialAsset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialAsset?.id,
      type,
      symbol: type === AssetType.CASH ? `CASH-${currency}` : (type === AssetType.OTHER ? 'OTHER' : symbol),
      name: type === AssetType.CASH ? currency : (type === AssetType.OTHER ? customName : symbol),
      shares: (type === AssetType.CASH || type === AssetType.OTHER) ? 1 : (parseFloat(shares) || 0),
      price: parseFloat(price) || 0,
      currency,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#fafaf9] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 text-[#57534e] flex items-center gap-2">
            <div className="w-1.5 h-5 bg-[#A1887F] rounded-full"></div>
            {initialAsset ? '編輯資產' : '新增資產'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-[#a8a29e] mb-2 uppercase tracking-widest">資產類別</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '台股', value: AssetType.TW_STOCK },
                  { label: '美股', value: AssetType.US_STOCK },
                  { label: '現金', value: AssetType.CASH },
                  { label: '其他', value: AssetType.OTHER },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`py-2 text-[12px] font-bold rounded-xl border transition-all ${
                      type === opt.value
                        ? 'bg-[#57534e] border-[#57534e] text-white shadow-sm'
                        : 'bg-white border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(type === AssetType.CASH || type === AssetType.OTHER) && (
              <div>
                <label className="block text-[11px] font-black text-[#a8a29e] mb-2 uppercase tracking-widest">選擇幣別</label>
                <div className="grid grid-cols-3 gap-2">
                  {[Currency.TWD, Currency.USD, Currency.JPY].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`py-2 text-sm font-bold rounded-xl border transition-all ${
                        currency === curr
                          ? 'bg-[#A1887F] border-[#A1887F] text-white'
                          : 'bg-white border-[#e7e5e4] text-[#78716c]'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {type === AssetType.OTHER ? (
              <div>
                <label className="block text-[11px] font-black text-[#a8a29e] mb-2 uppercase tracking-widest">資產名稱</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#e7e5e4] focus:outline-none focus:ring-2 focus:ring-[#d6d3d1]/50 bg-white"
                  placeholder="如：虛擬貨幣、房地產"
                  required
                />
              </div>
            ) : type !== AssetType.CASH ? (
              <div>
                <label className="block text-[11px] font-black text-[#a8a29e] mb-2 uppercase tracking-widest">股票代號</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl border border-[#e7e5e4] focus:outline-none focus:ring-2 focus:ring-[#d6d3d1]/50 bg-white"
                  placeholder="如：2330 或 TSLA"
                  required
                />
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              {type !== AssetType.CASH && type !== AssetType.OTHER && (
                <div>
                  <label className="block text-[11px] font-black text-[#a8a29e] mb-2 uppercase tracking-widest flex items-center gap-1">
                    持有股數
                    {type === AssetType.TW_STOCK && (
                      <span className="text-[9px] text-[#A1887F] font-normal lowercase">(一張：1000股)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#e7e5e4] focus:outline-none focus:ring-2 focus:ring-[#d6d3d1]/50 bg-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              )}
              <div className={(type === AssetType.CASH || type === AssetType.OTHER) ? 'col-span-2' : ''}>
                <label className="block text-[11px] font-black text-[#a8a29e] mb-2 uppercase tracking-widest">
                    {(type === AssetType.CASH || type === AssetType.OTHER) ? '資產價值' : '平均成本'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 pr-16 rounded-xl border border-[#e7e5e4] focus:outline-none focus:ring-2 focus:ring-[#d6d3d1]/50 bg-white font-bold"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#f5f5f4] rounded-lg text-[10px] text-[#78716c] font-black border border-[#e7e5e4]">
                    {currency}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3.5 text-[#a8a29e] font-bold text-sm border border-[#e7e5e4] rounded-2xl hover:bg-white"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#57534e] text-white font-bold text-sm rounded-2xl shadow-lg active:scale-95 transition-transform"
              >
                保存資產
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;
