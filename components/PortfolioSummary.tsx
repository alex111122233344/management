
import React from 'react';
import { Asset, ExchangeRate, Currency } from '../types';
import { TrendingUp, Package, RefreshCcw, Eye, EyeOff, ArrowUpRight } from 'lucide-react';

interface PortfolioSummaryProps {
  assets: Asset[];
  rates: ExchangeRate;
  onRefresh: () => void;
  isRefreshing: boolean;
  isAmountHidden: boolean;
  onToggleHide: () => void;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  assets, 
  rates, 
  onRefresh, 
  isRefreshing,
  isAmountHidden,
  onToggleHide
}) => {
  const totalTwd = assets.reduce((sum, asset) => {
    const value = asset.shares * asset.price;
    if (asset.currency === Currency.USD) return sum + (value * rates.usdToTwd);
    if (asset.currency === Currency.JPY) return sum + (value * rates.jpyToTwd);
    return sum + value;
  }, 0);

  const displayVal = isAmountHidden 
    ? "*******" 
    : `$${totalTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // 模擬資產日增率：根據當前時間與資產數量生成一個變動值
  const mockGrowth = assets.length > 0 ? (Math.sin(Date.now() / 100000) * 1.5 + 0.5).toFixed(2) : "0.00";

  return (
    <div className="washi-card p-6 rounded-3xl mb-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#a8a29e] font-light tracking-widest uppercase">總資產估值 (TWD)</span>
            <button onClick={onToggleHide} className="text-[#a8a29e] hover:text-[#78716c] transition-colors">
              {isAmountHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-[#57534e]">
            {displayVal}
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-xl border border-[#e7e5e4] text-[#78716c] transition-all hover:bg-[#fafaf9] ${isRefreshing ? 'opacity-50' : 'active:scale-90'}`}
          >
            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-[#f5f5f4] p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-[#a8a29e] shadow-sm">
            <Package size={18} />
          </div>
          <div>
            <div className="text-[10px] text-[#a8a29e] leading-none mb-1 font-bold">資產項目</div>
            <div className="text-sm font-bold text-[#57534e]">{assets.length} 項</div>
          </div>
        </div>
        <div className="flex-1 bg-[#f5f5f4] p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-[#A1887F] shadow-sm">
            <ArrowUpRight size={18} />
          </div>
          <div>
            <div className="text-[10px] text-[#a8a29e] leading-none mb-1 font-bold">資產日增率</div>
            <div className="text-sm font-bold text-[#A1887F]">+{mockGrowth}%</div>
          </div>
        </div>
      </div>
      
      {isRefreshing && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#e7e5e4] overflow-hidden">
          <div className="h-full bg-[#57534e] animate-progress w-full"></div>
        </div>
      )}
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default PortfolioSummary;
