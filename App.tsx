
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
  const [rates, setRates] = useState<ExchangeRate>({ usdToTwd: 32.5, jpyToTwd: 0.21, lastUpdate: Date.now() });
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAmountHidden, setIsAmountHidden] = useState(false);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAssets(JSON.parse(saved));
    }
    
    // Initial rate fetch
    fetchExchangeRates().then(newRates => {
      setRates({ usdToTwd: newRates.usd, jpyToTwd: newRates.jpy, lastUpdate: Date.now() });
    });
  }, []);

  // Save to local storage whenever assets change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const newRates = await fetchExchangeRates();
      setRates({ usdToTwd: newRates.usd, jpyToTwd: newRates.jpy, lastUpdate: Date.now() });
      
      const priceMap = await fetchStockPrices(assets);
      
      setAssets(prev => prev.map(asset => {
        const newPrice = priceMap[asset.symbol];
        if (newPrice) {
          return { ...asset, price: newPrice, updatedAt: Date.now() };
        }
        return asset;
      }));
      
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

  const handleAddClick = () => {
    setEditingAsset(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-8 pb-32">
      <header className="mb-8 flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-bold text-[#57534e] tracking-tight">資產管理 AI</h1>
          <p className="text-[10px] text-[#a8a29e] tracking-[0.2em] uppercase font-light">Japanese Minimalist Finance</p>
        </div>
        <div className="text-right">
            <span className="text-[10px] text-[#a8a29e] block font-medium uppercase">最後更新</span>
            <span className="text-[10px] font-bold text-[#78716c]">
              {new Date(rates.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
      </header>

      <main>
        <PortfolioSummary 
          assets={assets} 
          rates={rates} 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isAmountHidden={isAmountHidden}
          onToggleHide={() => setIsAmountHidden(!isAmountHidden)}
        />
        
        <AssetPieChart assets={assets} rates={rates} isAmountHidden={isAmountHidden} />

        <AssetList 
          assets={assets} 
          rates={rates} 
          onEdit={handleEditAsset} 
          onDelete={handleDeleteAsset}
          isAmountHidden={isAmountHidden}
        />
      </main>

      {/* 底部懸浮新增按鈕 - 移動至下方中央位置 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={handleAddClick}
          className="w-16 h-16 bg-[#57534e] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 hover:scale-105 transition-all ring-4 ring-white/50"
          aria-label="新增資產"
        >
          <Plus size={32} />
        </button>
      </div>

      {showForm && (
        <AssetForm 
          initialAsset={editingAsset}
          onSave={handleSaveAsset}
          onCancel={() => {
            setShowForm(false);
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
