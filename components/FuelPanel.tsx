
import React from 'react';
import { FuelData } from '../types';
import { Droplet, Waves, Thermometer, FlaskConical, LucideIcon } from 'lucide-react';

interface Props {
  fuel: FuelData;
  onChange: (key: keyof FuelData, val: number) => void;
  fullWidth?: boolean;
  uiMode?: 'desktop' | 'tv' | 'tablet' | 'phone';
}

const FuelPanel: React.FC<Props> = ({ fuel, onChange, fullWidth, uiMode = 'desktop' }) => {
  const isTv = uiMode === 'tv';
  const isTablet = uiMode === 'tablet';
  const isPhone = uiMode === 'phone';

  // Fix: Store the Icon component itself instead of a pre-rendered JSX element to avoid cloneElement issues
  const items: {
    key: keyof FuelData;
    maxKey: keyof FuelData;
    label: string;
    icon: LucideIcon;
    unit: string;
    color: string;
  }[] = [
    { key: 'water' as const, maxKey: 'maxWater' as const, label: 'Água Doce', icon: Waves, unit: 'm³', color: 'bg-blue-500' },
    { key: 'lubOil' as const, maxKey: 'maxLubOil' as const, label: 'Óleo Lub.', icon: Thermometer, unit: 'm³', color: 'bg-yellow-500' },
    { key: 'fuelOil' as const, maxKey: 'maxFuelOil' as const, label: 'Óleo Comb.', icon: Droplet, unit: 'm³', color: 'bg-slate-600' },
    { key: 'jp5' as const, maxKey: 'maxJp5' as const, label: 'JP-5 (AV)', icon: FlaskConical, unit: 'm³', color: 'bg-indigo-500' },
  ];

  const gridCols = (isTv || isPhone) ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={`bg-slate-900 border border-slate-800 shadow-2xl rounded-[2.5rem] ${isTv ? 'p-16' : isTablet ? 'p-10' : 'p-6'} ${fullWidth ? 'w-full' : ''}`}>
      <h3 className={`font-black flex items-center gap-4 text-white uppercase ${isTv ? 'text-5xl mb-12' : 'text-xl mb-6'}`}>
        <Droplet className={`${isTv ? 'w-12 h-12' : 'w-6 h-6'} text-blue-400`} />
        Carga Líquida
      </h3>
      
      <div className={`grid gap-6 ${isTv ? 'gap-12' : isTablet ? 'gap-8' : 'gap-4'} ${gridCols}`}>
        {items.map((item) => {
          const maxValue = fuel[item.maxKey] || 1;
          const percentage = Math.min((fuel[item.key] / maxValue) * 100, 100);
          const Icon = item.icon;
          
          return (
            <div key={item.key} className={`bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 transition-all border-2`}>
              <div className={`flex items-center justify-between ${isPhone ? 'flex-col gap-4 items-start' : 'mb-8'}`}>
                <div className="flex items-center gap-4">
                  <div className={`bg-slate-950 rounded-2xl border border-slate-700 p-3 text-blue-400`}>
                    {/* Fix: Directly render the Icon component with the size prop */}
                    <Icon size={isTv ? 48 : 24} />
                  </div>
                  <div>
                    <h4 className={`font-black text-slate-300 uppercase ${isTv ? 'text-4xl' : 'text-sm'}`}>{item.label}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] lg:text-xs text-slate-500 font-bold">MAX:</span>
                       <input 
                          type="number" 
                          value={fuel[item.maxKey]}
                          onChange={(e) => onChange(item.maxKey, parseFloat(e.target.value) || 0)}
                          className="bg-slate-900/50 border border-slate-700/50 rounded px-2 py-0.5 text-blue-400 font-bold w-16 lg:w-24 focus:outline-none"
                        />
                       <span className="text-[10px] text-slate-500 font-bold">{item.unit}</span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-3 ${isPhone ? 'w-full justify-between' : ''}`}>
                  <input 
                    type="number" 
                    value={fuel[item.key]}
                    onChange={(e) => onChange(item.key, parseFloat(e.target.value) || 0)}
                    className={`bg-transparent font-black text-white text-right focus:outline-none ${isTv ? 'text-6xl w-48' : 'text-2xl w-24'}`}
                  />
                  <span className="text-slate-500 font-black uppercase text-xs">{item.unit}</span>
                </div>
              </div>
              
              <div className={`relative bg-slate-950 rounded-full overflow-hidden shadow-inner ${isTv ? 'h-10 mt-6' : 'h-3 mt-4'}`}>
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-1000 ${item.color} shadow-lg`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3">
                <span className="font-black text-slate-500 uppercase text-[10px] tracking-widest">{percentage.toFixed(0)}%</span>
                <span className="font-black text-slate-500 uppercase text-[10px] tracking-widest">NÍVEL OPERACIONAL</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuelPanel;
