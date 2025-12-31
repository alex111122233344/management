
import React from 'react';
import { Asset, ExchangeRate, AssetType, Currency } from '../types';
import { Trash2, Edit3, TrendingUp, DollarSign, Wallet, Box } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  rates: ExchangeRate;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  isAmountHidden: boolean;
}

const AssetList: React.FC<AssetListProps> = ({ assets, rates, onEdit, onDelete, isAmountHidden }) => {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-[#a8a29e]">
        <div className="mb-4 opacity-20">
           <TrendingUp size={48} className="mx-auto" />
        </div>
        <p className="text-sm font-light tracking-wide">目前尚無資產記錄</p>
        <p className="text-[10px] mt-1 opacity-60">點擊右下角按鈕開始規劃您的財富</p>
      </div>
    );
  }

  const grouped = {
    [AssetType.TW_STOCK]: assets.filter(a => a.type === AssetType.TW_STOCK),
    [AssetType.US_STOCK]: assets.filter(a => a.type === AssetType.US_STOCK),
    [AssetType.CASH]: assets.filter(a => a.type === AssetType.CASH),
    [AssetType.OTHER]: assets.filter(a => a.type === AssetType.OTHER),
  };

  const renderSection = (title: string, items: Asset[], icon: React.ReactNode, type: AssetType) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="text-[#d6d3d1]">{icon}</div>
          <h2 className="text-[11px] font-black text-[#a8a29e] tracking-[0.2em] uppercase">{title}</h2>
          <div className="h-px bg-[#e7e5e4] flex-1 ml-4 opacity-50"></div>
        </div>
        
        <div className="space-y-3">
          {items.map((asset) => {
            const value = asset.shares * asset.price;
            let valueTwd = value;
            if (asset.currency === Currency.USD) valueTwd = value * rates.usdToTwd;
            if (asset.currency === Currency.JPY) valueTwd = value * rates.jpyToTwd;

            const displayPrice = isAmountHidden ? "***" : asset.price.toLocaleString();
            const displayTotal = isAmountHidden ? "******" : `$${valueTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

            return (
              <div key={asset.id} className="washi-card p-4 rounded-2xl flex items-center justify-between group transition-all hover:bg-white/95 hover:shadow-md hover:border-[#d6d3d1]">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    type === AssetType.US_STOCK ? 'bg-[#EFEBE9] text-[#A1887F]' :
                    type === AssetType.TW_STOCK ? 'bg-[#D7CCC8] text-[#8D6E63]' :
                    type === AssetType.OTHER ? 'bg-[#F5F5F4] text-[#78716c]' :
                    'bg-[#F5F5F4] text-[#78716c]'
                  }`}>
                    {type === AssetType.CASH ? <Wallet size={18} /> : (type === AssetType.OTHER ? <Box size={18} /> : <TrendingUp size={18} />)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#57534e] text-sm truncate">
                      {asset.name}
                    </h3>
                    <p className="text-[10px] text-[#a8a29e] font-bold">
                      {type === AssetType.CASH || type === AssetType.OTHER ? (
                         `價值: ${asset.currency} ${displayPrice}`
                      ) : (
                         `${asset.shares} 股 · ${asset.currency} ${displayPrice}`
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-4 flex-shrink-0">
                  <div>
                    <div className="font-bold text-[#57534e] tracking-tight">
                        {displayTotal}
                    </div>
                    <div className="text-[9px] text-[#a8a29e] font-black uppercase tracking-tighter">TWD 估值</div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-1 relative z-50">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(asset);
                      }} 
                      className="p-3 -m-1 text-[#d6d3d1] hover:text-[#57534e] transition-all active:scale-90"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // 移除手機端可能失效的 confirm，改為點擊即執行
                        onDelete(asset.id);
                      }} 
                      className="p-3 -m-1 text-red-200 hover:text-red-500 transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="px-1">
      {renderSection('台股持有', grouped[AssetType.TW_STOCK], <TrendingUp size={14} />, AssetType.TW_STOCK)}
      {renderSection('美股持有', grouped[AssetType.US_STOCK], <TrendingUp size={14} />, AssetType.US_STOCK)}
      {renderSection('現金儲蓄', grouped[AssetType.CASH], <DollarSign size={14} />, AssetType.CASH)}
      {renderSection('其他資產', grouped[AssetType.OTHER], <Box size={14} />, AssetType.OTHER)}
    </div>
  );
};

export default AssetList;
