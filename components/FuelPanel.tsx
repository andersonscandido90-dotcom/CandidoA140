
import React from 'react';
import { FuelData } from '../types';
import { Droplet, Waves, Thermometer, FlaskConical, LucideIcon } from 'lucide-react';

interface Props {
  fuel: FuelData;
  onChange: (key: keyof FuelData, val: number) => void;
  fullWidth?: boolean;
}

const FuelPanel: React.FC<Props> = ({ fuel, onChange, fullWidth }) => {
  const items: {
    key: keyof FuelData;
    maxKey: keyof FuelData;
    label: string;
    icon: LucideIcon;
    unit: string;
    color: string;
    shadowColor: string;
    accentColor: string;
  }[] = [
    { key: 'water', maxKey: 'maxWater', label: 'Água Doce', icon: Waves, unit: 'm³', color: 'bg-blue-500', shadowColor: 'shadow-blue-500/20', accentColor: 'text-blue-400' },
    { key: 'lubOil', maxKey: 'maxLubOil', label: 'Óleo Lub.', icon: Thermometer, unit: 'm³', color: 'bg-yellow-500', shadowColor: 'shadow-yellow-500/20', accentColor: 'text-yellow-400' },
    { key: 'fuelOil', maxKey: 'maxFuelOil', label: 'Óleo Comb.', icon: Droplet, unit: 'm³', color: 'bg-slate-400', shadowColor: 'shadow-slate-400/20', accentColor: 'text-slate-300' },
    { key: 'jp5', maxKey: 'maxJp5', label: 'JP-5 (AV)', icon: FlaskConical, unit: 'm³', color: 'bg-indigo-500', shadowColor: 'shadow-indigo-500/20', accentColor: 'text-indigo-400' },
  ];

  const totalVolume = fuel.water + fuel.lubOil + fuel.fuelOil + fuel.jp5;

  return (
    <div className={`bg-slate-900/40 border border-slate-800 shadow-2xl rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 backdrop-blur-xl ${fullWidth ? 'w-full' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <h3 className={`font-black flex items-center gap-6 text-white uppercase tracking-tighter ${fullWidth ? 'text-4xl lg:text-7xl' : 'text-2xl lg:text-4xl'}`}>
          <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-600/20">
            <Droplet className="text-white w-8 h-8 lg:w-12 lg:h-12" />
          </div>
          Cargas Líquidas
        </h3>
        {fullWidth && (
          <div className="bg-slate-950/80 border border-slate-800 px-8 py-4 rounded-[2rem] flex flex-col items-end gap-1 shadow-inner">
            <span className="font-black text-slate-500 uppercase tracking-widest text-[10px] lg:text-xs">Carga Total de Fluidos</span>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-blue-400 text-3xl lg:text-5xl tracking-tighter">
                {totalVolume.toLocaleString('pt-BR')}
              </span>
              <span className="font-black text-slate-600 text-sm lg:text-xl uppercase">m³</span>
            </div>
          </div>
        )}
      </div>
      
      <div className={`grid gap-8 lg:gap-12 ${fullWidth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {items.map((item) => {
          const maxValue = fuel[item.maxKey] || 1;
          const currentVal = fuel[item.key];
          const percentage = Math.min((currentVal / maxValue) * 100, 100);
          const Icon = item.icon;
          
          return (
            <div key={item.key} className="bg-slate-950/60 border-2 border-slate-800/50 rounded-[2.5rem] p-8 lg:p-10 flex flex-col gap-8 group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
              {/* Background Decorativo Contido */}
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                <Icon size={240} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-5">
                  <div className={`bg-slate-900 border border-slate-800 p-4 rounded-2xl ${item.accentColor} shadow-xl`}>
                    <Icon size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase tracking-widest text-lg lg:text-2xl mb-1">{item.label}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cap. Max:</span>
                      <input 
                        type="number" 
                        value={fuel[item.maxKey]}
                        onChange={(e) => onChange(item.maxKey, parseFloat(e.target.value) || 0)}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg px-2 py-0.5 text-blue-400 font-black w-20 text-sm focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <span className="text-slate-600 font-bold text-[10px] uppercase">{item.unit}</span>
                    </div>
                  </div>
                </div>
                
                {/* Porcentagem em destaque dentro de uma caixa */}
                <div className="bg-slate-900/80 border border-slate-800 px-6 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[100px] shadow-inner">
                  <span className={`font-black text-3xl lg:text-4xl tracking-tighter ${percentage > 90 ? 'text-blue-400' : percentage < 15 ? 'text-red-500' : 'text-white'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">NÍVEL</span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-baseline gap-4">
                  <input 
                    type="number" 
                    value={currentVal}
                    onChange={(e) => onChange(item.key, parseFloat(e.target.value) || 0)}
                    className="bg-transparent font-black text-white w-full focus:outline-none tracking-tighter text-7xl lg:text-9xl hover:text-blue-400 focus:text-blue-400 transition-colors"
                  />
                  <span className="text-slate-500 font-black uppercase tracking-widest text-2xl lg:text-4xl">
                    {item.unit}
                  </span>
                </div>
              </div>
              
              <div className="relative z-10 mt-auto space-y-4">
                <div className="relative bg-slate-900 h-6 lg:h-8 rounded-full overflow-hidden border-2 border-slate-800/50 shadow-inner">
                  <div 
                    className={`absolute left-0 top-0 h-full transition-all duration-1000 ${item.color} relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className={`font-black uppercase tracking-widest text-[10px] lg:text-xs ${percentage < 15 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                    {percentage < 15 ? '⚠ ABAIXO DO LIMITE' : 'STATUS OPERACIONAL'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500/50" />
                    <span className="text-slate-600 font-black text-[9px] uppercase tracking-widest">Leitura Real-Time</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuelPanel;
