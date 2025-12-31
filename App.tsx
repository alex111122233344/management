
import React, { useState, useEffect } from 'react';
import { Asset, ExchangeRate } from './types';
import PortfolioSummary from './components/PortfolioSummary';
import AssetPieChart from './components/AssetPieChart';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import { fetchExchangeRates, fetchStockPrices } from './services/geminiService';
import { Plus } from 'lucide-react';

const STORAGE_KEY = 'zenwealth_assets';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rates, setRates] = useState<ExchangeRate & { sources?: {uri:string, title:string}[] }>({ 
    usdToTwd: 32.5, 
    jpyToTwd: 0.21, 
    lastUpdate: Date.now(),
    sources: []
  });
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAmountHidden, setIsAmountHidden] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAssets(JSON.parse(saved));
    }
    handleRefresh();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const rateResult = await fetchExchangeRates();
      setRates({ 
        usdToTwd: rateResult.usd, 
        jpyToTwd: rateResult.jpy, 
        lastUpdate: Date.now(),
        sources: rateResult.sources
      });
      
      if (assets.length > 0) {
        const priceMap = await fetchStockPrices(assets);
        setAssets(prev => prev.map(asset => {
          const newPrice = priceMap[asset.symbol];
          if (newPrice) {
            return { ...asset, price: newPrice, updatedAt: Date.now() };
          }
          return asset;
        }));
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveAsset = (assetData: Omit<Asset, 'id' | 'updatedAt'> & { id?: string }) => {
    if (assetData.id) {
      setAssets(prev => prev.map(a => a.id === assetData.id ? { ...a, ...assetData, updatedAt: Date.now() } as Asset : a));
    } else {
      const newAsset: Asset = {
        ...assetData,
        id: Math.random().toString(36).substring(2, 9),
        updatedAt: Date.now(),
      } as Asset;
      setAssets(prev => [...prev, newAsset]);
    }
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen japanese-bg max-w-lg mx-auto px-4 pt-8 pb-40">
      <header className="mb-8 flex justify-between items-end px-2">
        <div>
          <p className="text-[10px] text-[#a8a29e] tracking-[0.3em] uppercase font-black mb-1 opacity-60">ZenWealth Portfolio</p>
          <h1 className="text-3xl font-bold text-[#57534e] tracking-tighter">和風資產</h1>
        </div>
        <div className="text-right pb-1">
            <span className="text-[9px] text-[#a8a29e] block font-black uppercase tracking-widest mb-0.5">Updated At</span>
            <span className="text-xs font-bold text-[#78716c]">
              {new Date(rates.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
      </header>

      <main className="space-y-8">
        {/* 總覽卡片 */}
        <PortfolioSummary 
          assets={assets} 
          rates={rates} 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isAmountHidden={isAmountHidden}
          onToggleHide={() => setIsAmountHidden(!isAmountHidden)}
        />
        
        {/* 圖表分析 */}
        <AssetPieChart assets={assets} rates={rates} isAmountHidden={isAmountHidden} />

        {/* 資產清單 */}
        <AssetList 
          assets={assets} 
          rates={rates} 
          onEdit={handleEditAsset} 
          onDelete={handleDeleteAsset}
          isAmountHidden={isAmountHidden}
        />
      </main>

      {/* 底部置中新增按鈕 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => { setEditingAsset(null); setShowForm(true); }}
          className="w-16 h-16 bg-[#57534e] text-[#fafaf9] rounded-full shadow-[0_10px_30px_-5px_rgba(87,83,78,0.4)] flex items-center justify-center active:scale-90 hover:scale-105 transition-all ring-4 ring-white"
          aria-label="新增資產"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>

      {showForm && (
        <AssetForm 
          initialAsset={editingAsset}
          onSave={handleSaveAsset}
          onCancel={() => { setShowForm(false); setEditingAsset(null); }}
        />
      )}
    </div>
  );
};

export default App;
