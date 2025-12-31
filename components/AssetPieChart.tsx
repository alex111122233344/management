
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Asset, ExchangeRate, AssetType, Currency } from '../types';

interface AssetPieChartProps {
  assets: Asset[];
  rates: ExchangeRate;
  isAmountHidden: boolean;
}

// 日式淺棕色/大地色系配色
const TYPE_COLORS: Record<string, string> = {
  [AssetType.TW_STOCK]: '#D7CCC8', // 極淡胡桃褐
  [AssetType.US_STOCK]: '#EFEBE9', // 薄霧棕
  [AssetType.CASH]: '#BCAAA4',     // 淡茶褐
  [AssetType.OTHER]: '#A1887F',    // 淺胡桃色
};

const AssetPieChart: React.FC<AssetPieChartProps> = ({ assets, rates, isAmountHidden }) => {
  const data = Object.values(AssetType).map(type => {
    const value = assets
      .filter(a => a.type === type)
      .reduce((sum, a) => {
        const v = a.shares * a.price;
        if (a.currency === Currency.USD) return sum + (v * rates.usdToTwd);
        if (a.currency === Currency.JPY) return sum + (v * rates.jpyToTwd);
        return sum + v;
      }, 0);
    return { 
      type,
      name: type === AssetType.US_STOCK ? '美股' : 
            type === AssetType.TW_STOCK ? '台股' : 
            type === AssetType.CASH ? '現金' : '其他', 
      value 
    };
  }).filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="washi-card p-6 rounded-3xl mb-6 shadow-sm border border-[#e7e5e4]/50">
      <h2 className="text-[11px] font-black text-[#a8a29e] tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
        <div className="w-1.5 h-3 bg-[#d6d3d1] rounded-full"></div>
        資產分佈佔比
      </h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={65}
              outerRadius={85}
              paddingAngle={8}
              dataKey="value"
              stroke="white"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={TYPE_COLORS[entry.type] || '#f5f5f4'} 
                  className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                fontSize: '12px',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
              formatter={(value: number) => {
                const display = isAmountHidden ? "****" : `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})} TWD`;
                return [display, '估值'];
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '24px', fontWeight: 600, color: '#78716c' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetPieChart;
