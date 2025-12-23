
import React from 'react';
import { StabilityData, FuelData } from '../types';
import { Compass, MoveVertical, Anchor, Gauge, Ship, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  data: StabilityData;
  fuelData: FuelData;
  onChange: (key: keyof StabilityData, val: number) => void;
}

const StabilityPanel: React.FC<Props> = ({ data, fuelData, onChange }) => {
  const meanDraft = (data.draftForward + data.draftAft) / 2;
  const heightDiff = data.draftForward - data.draftAft; // Positivo = Proa mais ALTA (conforme modelo do usuário)
  
  // Lógica de Status:
  // Proa (AV) > Popa (AR) = DERRABADO (Proa mais alta)
  // Popa (AR) > Proa (AV) = ABICADO (Popa mais alta)
  let statusLabel = "NIVELADO";
  let statusColor = "bg-slate-800 border-slate-700 text-slate-400";
  
  if (data.draftForward > data.draftAft) {
    statusLabel = "⚠ DERRABADO";
    statusColor = "bg-amber-500 border-black text-black";
  } else if (data.draftAft > data.draftForward) {
    statusLabel = "⚠ ABICADO";
    statusColor = "bg-blue-600 border-white text-white animate-pulse";
  }

  // CINEMÁTICA VISUAL:
  const rotationAngle = -heightDiff * 3.0; 
  const sensitivity = 18; 
  const verticalOffset = -(meanDraft - 7.0) * sensitivity;

  const handleBBChange = (val: number) => {
    onChange('heel', val === 0 ? 0 : -Math.abs(val));
  };

  const handleBEChange = (val: number) => {
    onChange('heel', val === 0 ? 0 : Math.abs(val));
  };

  const getGMStatus = () => {
    if (data.gm <= 0) return { label: 'PERIGO CRÍTICO', color: 'text-red-500', icon: <AlertCircle size={14} /> };
    if (data.gm < 1.0) return { label: 'ESTABILIDADE REDUZIDA', color: 'text-amber-500', icon: <AlertCircle size={14} /> };
    return { label: 'ESTÁVEL', color: 'text-green-500', icon: <CheckCircle2 size={14} /> };
  };
  const gmStatus = getGMStatus();

  const renderInput = (label: string, value: number, key: keyof StabilityData, unit: string, icon: React.ReactNode) => (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 rounded-lg sm:rounded-xl text-blue-400 p-2 sm:p-2.5 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
            {icon}
          </div>
          <span className="font-black text-slate-300 uppercase tracking-widest text-[9px] sm:text-[11px] leading-tight">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
            className="bg-transparent text-right font-black text-white text-lg sm:text-2xl w-16 sm:w-24 focus:outline-none focus:text-blue-400 transition-colors"
          />
          <span className="text-slate-500 font-black uppercase text-[10px] sm:text-xs">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] p-5 sm:p-6 lg:p-10 flex flex-col gap-6 sm:gap-10 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8 border-b border-slate-800/60 pb-6 sm:pb-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-3 sm:p-5 bg-blue-600 rounded-xl sm:rounded-[1.5rem] shadow-xl">
            <Compass className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
          </div>
          <h3 className="font-black text-white uppercase text-2xl sm:text-4xl lg:text-5xl tracking-tighter">Estabilidade</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="bg-blue-600/10 border-2 border-blue-500/20 rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-4 text-center">
            <p className="font-black text-blue-400 uppercase text-[8px] sm:text-[10px] mb-1 tracking-widest">CALADO MÉDIO</p>
            <p className="font-black text-white text-xl sm:text-3xl lg:text-4xl">{meanDraft.toFixed(2)}m</p>
          </div>
          <div className="bg-indigo-600/10 border-2 border-indigo-500/20 rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-4 text-center">
            <p className="font-black text-indigo-400 uppercase text-[8px] sm:text-[10px] mb-1 tracking-widest">TRIM</p>
            <p className="font-black text-white text-xl sm:text-3xl lg:text-4xl">{Math.abs(heightDiff).toFixed(2)}m</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center min-h-[350px] sm:min-h-[480px] relative overflow-hidden">
          <div className="w-full flex justify-between items-center mb-4 relative z-50">
            <span className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Ship size={14} /> TRIM
            </span>
            <div className={`px-3 py-1 sm:px-5 sm:py-2 rounded-lg text-[8px] sm:text-[11px] font-black uppercase border-2 ${statusColor}`}>
              {statusLabel}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
            <div className="absolute inset-x-0 top-[60%] h-[2px] bg-blue-500/40 z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <div 
              className="relative w-full transition-all duration-1000 z-20 px-4"
              style={{ transform: `translateY(${verticalOffset}px) rotate(${rotationAngle}deg)`, transformOrigin: 'center center' }}
            >
              <svg viewBox="0 0 500 150" className="w-full h-auto drop-shadow-2xl">
                <path d="M40,85 L460,85 L445,115 L55,115 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
                <path d="M40,70 L460,70 L460,85 L40,85 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                <path d="M320,70 L320,25 L380,25 L395,45 L395,70 Z" fill="#475569" stroke="#334155" strokeWidth="1" />
                <rect x="335" y="12" width="10" height="13" fill="#1e293b" />
              </svg>
              <div className="absolute left-4 top-[85px] -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-[8px] sm:text-[10px] font-black text-white uppercase bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">AR</span>
              </div>
              <div className="absolute right-4 top-[85px] -translate-y-1/2 translate-x-1/2 flex flex-col items-center">
                <span className="text-[8px] sm:text-[10px] font-black text-white uppercase bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">AV</span>
              </div>
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-3 mt-6 sm:mt-12 relative z-50">
            <div className="text-center p-3 rounded-xl border bg-slate-900/95 border-slate-700">
              <p className="text-xl sm:text-4xl font-black text-white tracking-tighter">{data.draftAft.toFixed(2)}m</p>
              <p className="text-[8px] font-black uppercase text-slate-500 mt-1">CALADO AR</p>
            </div>
            <div className="text-center p-3 rounded-xl border bg-slate-900/95 border-slate-700">
              <p className="text-xl sm:text-4xl font-black text-white tracking-tighter">{data.draftForward.toFixed(2)}m</p>
              <p className="text-[8px] font-black uppercase text-slate-500 mt-1">CALADO AV</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center min-h-[350px] sm:min-h-[480px]">
          <div className="w-full flex justify-between items-center mb-4 sm:mb-8">
            <span className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Banda Real (BB/BE)
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-48 h-48 sm:w-72 sm:h-72 border-4 border-slate-900 rounded-full flex items-center justify-center bg-slate-950/50 shadow-inner">
              <div className="absolute top-0 w-1 sm:w-1.5 h-8 bg-red-600 rounded-full -translate-y-1/2 z-20" />
              <div 
                className="w-32 h-12 sm:w-56 sm:h-20 transition-transform duration-1000 ease-out relative"
                style={{ transform: `rotate(${data.heel}deg)` }}
              >
                <div className="absolute bottom-0 left-0 w-full h-8 sm:h-12 bg-slate-800 rounded-b-[1.5rem] border-b-[6px] border-blue-600" />
                <div className="absolute top-0 left-0 w-full h-5 sm:h-8 bg-slate-700 rounded-t-sm shadow-xl" />
              </div>
              <div className="absolute -bottom-4 bg-slate-900 border border-blue-500/40 px-4 py-2 rounded-xl shadow-2xl">
                <span className="text-2xl sm:text-5xl font-black text-white tracking-tighter">{Math.abs(data.heel).toFixed(1)}°</span>
                <span className="text-[10px] font-black text-blue-400 ml-2 uppercase">
                  {data.heel > 0 ? 'BE' : data.heel < 0 ? 'BB' : 'Centro'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {renderInput("Calado AV", data.draftForward, "draftForward", "m", <MoveVertical size={18} />)}
        {renderInput("Calado AR", data.draftAft, "draftAft", "m", <MoveVertical size={18} />)}
        
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 rounded-lg text-amber-500 p-2 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
                <Activity size={18} />
              </div>
              <span className="font-black text-slate-300 uppercase tracking-widest text-[9px] sm:text-[11px] leading-tight">Banda BB</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={data.heel < 0 ? Math.abs(data.heel) : 0}
                onChange={(e) => handleBBChange(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-right font-black text-white text-lg sm:text-2xl w-16 sm:w-24 focus:outline-none focus:text-amber-500 transition-colors"
              />
              <span className="text-slate-500 font-black uppercase text-[10px]">°</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 rounded-lg text-blue-500 p-2 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
                <Activity size={18} />
              </div>
              <span className="font-black text-slate-300 uppercase tracking-widest text-[9px] sm:text-[11px] leading-tight">Banda BE</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={data.heel > 0 ? data.heel : 0}
                onChange={(e) => handleBEChange(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-right font-black text-white text-lg sm:text-2xl w-16 sm:w-24 focus:outline-none focus:text-blue-500 transition-colors"
              />
              <span className="text-slate-500 font-black uppercase text-[10px]">°</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 rounded-lg text-blue-400 p-2 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
                <Anchor size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-300 uppercase tracking-widest text-[9px] sm:text-[11px] leading-tight">GM (Metacêntrica)</span>
                <span className={`text-[7px] font-black uppercase flex items-center gap-1 ${gmStatus.color}`}>
                  {gmStatus.icon} {gmStatus.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={data.gm}
                onChange={(e) => onChange('gm', parseFloat(e.target.value) || 0)}
                className={`bg-transparent text-right font-black text-lg sm:text-2xl w-16 sm:w-24 focus:outline-none transition-colors ${gmStatus.color}`}
              />
              <span className="text-slate-500 font-black uppercase text-[10px]">m</span>
            </div>
          </div>
        </div>

        {renderInput("Deslocamento", data.displacement, "displacement", "t", <Gauge size={18} />)}
      </div>
    </div>
  );
};

export default StabilityPanel;
