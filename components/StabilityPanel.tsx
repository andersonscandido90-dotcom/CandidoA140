
import React, { useMemo } from 'react';
import { StabilityData, FuelData } from '../types';
import { Compass, MoveVertical, Anchor, Gauge, Ship, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  data: StabilityData;
  fuelData: FuelData;
  onChange: (key: keyof StabilityData, val: number) => void;
}

const StabilityPanel: React.FC<Props> = ({ data, fuelData, onChange }) => {
  const meanDraft = (data.draftForward + data.draftAft) / 2;
  const trim = data.draftForward - data.draftAft; 
  
  // Lógica Hidrostática baseada em 6.5m -> 21500t
  const hydrostatics = useMemo(() => {
    if (meanDraft <= 0) return { displacement: 0, km: 0 };
    
    // 1. Deslocamento: TPC aproximado de 48t/cm (4800 t/m)
    const displacement = 21500 + (meanDraft - 6.5) * 4800;
    
    // 2. KM (Metacentro): Aproximação de curva hidrostática
    const km = 14.45 - (meanDraft * 0.1);
    
    return { 
      displacement: Math.max(0, displacement), 
      km: Math.max(0, km)
    };
  }, [meanDraft]);

  const displayDisplacement = hydrostatics.displacement;

  // Lógica de Status do Trim e Atitude Geral
  let statusLabel = "";
  let statusColor = "";
  
  if (data.draftForward === data.draftAft) {
    if (data.heel === 0) {
      statusLabel = "A CENTRO";
      statusColor = "bg-green-600 border-white text-white shadow-lg";
    } else {
      statusLabel = "COMPASSADO";
      statusColor = "bg-slate-800 border-slate-700 text-slate-400";
    }
  } else if (data.draftForward > data.draftAft) {
    statusLabel = "⚠ ABICADO";
    statusColor = "bg-blue-600 border-white text-white animate-pulse";
  } else {
    statusLabel = "⚠ DERRABADO";
    statusColor = "bg-amber-500 border-black text-black";
  }

  const scale = 15;
  const waterLineY = 130;
  const keelPosInSvg = 180;
  const verticalOffset = (waterLineY + (meanDraft * scale)) - keelPosInSvg;

  const distBetweenAxes = 400;
  const rotationRad = Math.atan((trim * scale) / distBetweenAxes);
  const rotationDeg = (rotationRad * 180) / Math.PI;

  const handleBBChange = (val: number) => {
    // Se BB tem valor, BE deve ser 0. Banda BB é armazenada como negativo.
    onChange('heel', val === 0 ? 0 : -Math.abs(val));
  };

  const handleBEChange = (val: number) => {
    // Se BE tem valor, BB deve ser 0. Banda BE é armazenada como positivo.
    onChange('heel', val === 0 ? 0 : Math.abs(val));
  };

  const getGMStatus = () => {
    if (data.gm <= 0) return { label: 'PERIGO CRÍTICO', color: 'text-red-500', icon: <AlertCircle size={14} /> };
    if (data.gm < 1.0) return { label: 'ESTABILIDADE REDUZIDA', color: 'text-amber-500', icon: <AlertCircle size={14} /> };
    return { label: 'ESTÁVEL', color: 'text-green-500', icon: <CheckCircle2 size={14} /> };
  };
  const gmStatus = getGMStatus();

  // Lógica do Status da Banda
  const heelStatus = useMemo(() => {
    if (data.heel === 0) return { label: 'A PRUMO', color: 'text-green-400', icon: <CheckCircle2 size={14} /> };
    return { 
      label: data.heel > 0 ? 'ADERNADO PARA BORESTE (BE)' : 'ADERNADO PARA BOMBORDO (BB)', 
      color: 'text-amber-400',
      icon: <AlertCircle size={14} /> 
    };
  }, [data.heel]);

  const renderInput = (label: string, value: number, onValChange: (v: number) => void, unit: string, icon: React.ReactNode, step = "0.1") => (
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
            step={step}
            value={value}
            onChange={(e) => onValChange(parseFloat(e.target.value) || 0)}
            className="bg-transparent text-right font-black text-white text-lg sm:text-2xl w-16 sm:w-24 focus:outline-none focus:text-blue-400 transition-colors"
          />
          <span className="text-slate-500 font-black uppercase text-[10px] sm:text-xs">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-2xl lg:rounded-[3rem] p-5 sm:p-6 lg:p-10 flex flex-col gap-6 sm:gap-10 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8 border-b border-slate-800/60 pb-6 sm:pb-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-3 sm:p-5 bg-blue-600 rounded-xl sm:rounded-[1.5rem] shadow-xl">
            <Compass className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase text-2xl sm:text-4xl lg:text-5xl tracking-tighter">Estabilidade</h3>
            <p className="text-slate-500 font-black text-[9px] sm:text-xs uppercase tracking-widest">A140 NAM ATLÂNTICO</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="bg-blue-600/10 border-2 border-blue-500/20 rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-4 text-center">
            <p className="font-black text-blue-400 uppercase text-[8px] sm:text-[10px] mb-1 tracking-widest">CALADO MÉDIO</p>
            <p className="font-black text-white text-xl sm:text-3xl lg:text-4xl">{meanDraft.toFixed(2)}m</p>
          </div>
          <div className="bg-indigo-600/10 border-2 border-indigo-500/20 rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-4 text-center">
            <p className="font-black text-indigo-400 uppercase text-[8px] sm:text-[10px] mb-1 tracking-widest">DESLOCAMENTO</p>
            <p className="font-black text-white text-xl sm:text-3xl lg:text-4xl">{Math.round(displayDisplacement).toLocaleString()}t</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center min-h-[480px] sm:min-h-[580px] relative overflow-hidden">
          <div className="w-full flex justify-between items-center mb-4 relative z-50">
            <span className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Ship size={14} /> Status do Trim
            </span>
            <div className={`px-3 py-1 sm:px-5 sm:py-2 rounded-lg text-[8px] sm:text-[11px] font-black uppercase border-2 transition-colors ${statusColor}`}>
              {statusLabel}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
            <svg viewBox="0 0 500 250" className="w-full h-auto drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)] overflow-visible">
              <defs>
                <linearGradient id="shipGray" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="oceanBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <rect x="-50" y={waterLineY} width="600" height="200" fill="url(#oceanBlue)" />
              <line x1="-50" y1={waterLineY} x2="550" y2={waterLineY} stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <g 
                className="transition-all duration-1000 ease-in-out"
                style={{ transform: `translateY(${verticalOffset}px) rotate(${rotationDeg}deg)`, transformOrigin: '250px 140px' }}
              >
                <path d="M15,40 L485,40 L485,95 L15,95 Z" fill="url(#shipGray)" stroke="#1e293b" strokeWidth="1" />
                <path d="M15,95 L485,95 L460,180 L40,180 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5" />
                <rect x="310" y="5" width="85" height="35" fill="#334155" />
                <rect x="330" y="-15" width="12" height="20" fill="#0f172a" />
                <rect x="360" y="-25" width="8" height="30" fill="#0f172a" />
                <text x="55" y="195" fontSize="10" fontWeight="900" fill="#475569" textAnchor="middle" className="uppercase tracking-widest">Popa (AR)</text>
                <text x="445" y="195" fontSize="10" fontWeight="900" fill="#475569" textAnchor="middle" className="uppercase tracking-widest">Proa (AV)</text>
                <text x="250" y="145" fontSize="14" fontWeight="900" fill="white" opacity="0.1" textAnchor="middle" className="uppercase tracking-[1.2em]">A140</text>
              </g>
            </svg>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-4 sm:mt-12 relative z-50">
            <div className={`text-center p-3 rounded-xl border bg-slate-900/95 shadow-xl transition-all ${data.draftAft > data.draftForward ? 'border-amber-500 ring-4 ring-amber-500/20' : 'border-slate-700'}`}>
              <p className="text-xl sm:text-4xl font-black text-white tracking-tighter">{data.draftAft.toFixed(2)}m</p>
              <p className="text-[8px] font-black uppercase text-slate-500 mt-1">Calado Popa (AR)</p>
            </div>
            <div className={`text-center p-3 rounded-xl border bg-slate-900/95 shadow-xl transition-all ${data.draftForward > data.draftAft ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-700'}`}>
              <p className="text-xl sm:text-4xl font-black text-white tracking-tighter">{data.draftForward.toFixed(2)}m</p>
              <p className="text-[8px] font-black uppercase text-slate-500 mt-1">Calado Proa (AV)</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col items-center min-h-[480px] sm:min-h-[580px]">
          <div className="w-full flex justify-between items-center mb-4 sm:mb-8">
            <span className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Status da Banda
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
          
          <div className="w-full mt-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A140:</span>
              <div className="flex items-center gap-2">
                {heelStatus.icon}
                <span className={`text-sm lg:text-lg font-black ${heelStatus.color} tracking-tight`}>
                  {heelStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {renderInput("Calado AV", data.draftForward, (v) => onChange('draftForward', v), "m", <MoveVertical size={18} />)}
        {renderInput("Calado AR", data.draftAft, (v) => onChange('draftAft', v), "m", <MoveVertical size={18} />)}
        
        {renderInput("GM", data.gm, (v) => onChange('gm', v), "m", <Anchor size={18} />)}

        {renderInput("Banda BB", data.heel < 0 ? Math.abs(data.heel) : 0, handleBBChange, "°", <Activity size={18} />)}
        {renderInput("Banda BE", data.heel > 0 ? Math.abs(data.heel) : 0, handleBEChange, "°", <Activity size={18} />)}

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 rounded-lg text-blue-400 p-2 border border-slate-800 group-hover:scale-110 transition-transform shrink-0">
                <Gauge size={18} />
              </div>
              <span className="font-black text-slate-300 uppercase tracking-widest text-[9px] sm:text-[11px] leading-tight">Deslocamento</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg sm:text-2xl">
                {Math.round(displayDisplacement).toLocaleString()}
              </span>
              <span className="text-slate-500 font-black uppercase text-[10px]">t</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StabilityPanel;
