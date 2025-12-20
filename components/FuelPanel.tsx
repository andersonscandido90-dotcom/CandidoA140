
import React from 'react';
import { FuelData } from '../types';
import { Droplet, Waves, Thermometer, FlaskConical } from 'lucide-react';

interface Props {
  fuel: FuelData;
  onChange: (key: keyof FuelData, val: number) => void;
  fullWidth?: boolean;
  isTvMode?: boolean;
}

const FuelPanel: React.FC<Props> = ({ fuel, onChange, fullWidth, isTvMode }) => {
  const items = [
    { key: 'water' as const, label: 'Água Doce', icon: <Waves className={`${isTvMode ? 'w-12 h-12' : 'w-5 h-5'} text-blue-400`} />, unit: 'm³', color: 'bg-blue-500', max: 800 },
    { key: 'lubOil' as const, label: 'Óleo Lub.', icon: <Thermometer className={`${isTvMode ? 'w-12 h-12' : 'w-5 h-5'} text-yellow-400`} />, unit: 'm³', color: 'bg-yellow-500', max: 200 },
    { key: 'fuelOil' as const, label: 'Óleo Comb.', icon: <Droplet className={`${isTvMode ? 'w-12 h-12' : 'w-5 h-5'} text-slate-300`} />, unit: 'm³', color: 'bg-slate-600', max: 500 },
    { key: 'jp5' as const, label: 'JP-5 (AV)', icon: <FlaskConical className={`${isTvMode ? 'w-12 h-12' : 'w-5 h-5'} text-indigo-400`} />, unit: 'm³', color: 'bg-indigo-500', max: 300 },
  ];

  return (
    <div className={`bg-slate-900 border border-slate-800 shadow-2xl ${isTvMode ? 'rounded-[3rem] p-12 w-full' : 'rounded-3xl p-6'} ${fullWidth ? 'w-full' : ''}`}>
      <h3 className={`font-bold flex items-center gap-3 ${isTvMode ? 'text-5xl mb-12' : 'text-xl mb-6'}`}>
        <Droplet className={`${isTvMode ? 'w-12 h-12' : 'w-5 h-5'} text-blue-400`} />
        Carga Líquida
      </h3>
      
      <div className={`grid ${isTvMode ? 'grid-cols-1 gap-12' : 'grid-cols-1 sm:grid-cols-2 gap-6'}`}>
        {items.map((item) => {
          const percentage = Math.min((fuel[item.key] / item.max) * 100, 100);
          
          return (
            <div key={item.key} className={`bg-slate-800/40 border border-slate-700/50 rounded-2xl group transition-all ${isTvMode ? 'p-10 border-4' : 'p-5'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className={`bg-slate-950 rounded-2xl border border-slate-700 ${isTvMode ? 'p-6' : 'p-2'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className={`font-black text-slate-300 uppercase ${isTvMode ? 'text-4xl' : 'text-sm'}`}>{item.label}</h4>
                    <p className={`text-slate-500 font-bold uppercase tracking-widest ${isTvMode ? 'text-xl mt-2' : 'text-[10px]'}`}>MAX: {item.max}{item.unit}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <input 
                    type="number" 
                    value={fuel[item.key]}
                    onChange={(e) => onChange(item.key, parseFloat(e.target.value) || 0)}
                    className={`bg-transparent font-black text-white text-right focus:outline-none focus:text-blue-400 transition-colors ${isTvMode ? 'text-7xl w-60' : 'text-xl w-20'}`}
                  />
                  <span className={`font-black text-slate-500 uppercase ${isTvMode ? 'text-3xl' : 'text-xs'}`}>{item.unit}</span>
                </div>
              </div>
              
              <div className={`relative bg-slate-950 rounded-full overflow-hidden shadow-inner ${isTvMode ? 'h-8' : 'h-2'}`}>
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-1000 ${item.color} shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-4">
                <span className={`font-black text-slate-500 uppercase tracking-widest ${isTvMode ? 'text-2xl' : 'text-[9px]'}`}>{percentage.toFixed(0)}%</span>
                <span className={`font-black text-slate-500 uppercase tracking-widest ${isTvMode ? 'text-2xl' : 'text-[9px]'}`}>NÍVEL OPERACIONAL</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuelPanel;
