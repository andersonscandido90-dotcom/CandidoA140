
import React from 'react';
import { StabilityData } from '../types';
import { Compass, MoveVertical, Anchor, Gauge, Ship, Activity, ShieldAlert } from 'lucide-react';

interface Props {
  data: StabilityData;
  onChange: (key: keyof StabilityData, val: number) => void;
  uiMode?: 'desktop' | 'tv' | 'tablet' | 'phone';
}

const StabilityPanel: React.FC<Props> = ({ data, onChange, uiMode = 'desktop' }) => {
  const isTv = uiMode === 'tv';
  const isDesktop = uiMode === 'desktop';
  
  const meanDraft = (data.draftForward + data.draftAft) / 2;
  const trim = data.draftAft - data.draftForward;

  const renderInput = (label: string, value: number, key: keyof StabilityData, unit: string, icon: React.ReactNode) => {
    // Abrevia deslocamento no modo TV para ganhar espaço
    const displayLabel = (isTv && label === "Deslocamento") ? "DESLOC." : label;

    return (
      <div className={`bg-slate-800/30 border border-slate-700/40 rounded-2xl transition-all hover:border-blue-500/50 shadow-inner ${isTv ? 'p-10' : 'p-4 lg:p-5'}`}>
        <div className={`flex items-center justify-between gap-4 ${isTv ? 'flex-col items-start gap-6' : ''}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`bg-slate-900 rounded-xl text-blue-400 shrink-0 border border-slate-800 ${isTv ? 'p-4' : 'p-2'}`}>
              {/* Clonamos o ícone para ajustar o tamanho no modo TV */}
              {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: isTv ? 48 : 20 }) : icon}
            </div>
            <span className={`font-black text-slate-300 uppercase tracking-[0.1em] truncate ${isTv ? 'text-4xl' : 'text-xs lg:text-sm'}`}>
              {displayLabel}
            </span>
          </div>
          <div className={`flex items-center gap-2 ${isTv ? 'w-full justify-between border-t border-slate-700/50 pt-6' : 'shrink-0'}`}>
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
              className={`bg-transparent text-right font-black text-white focus:outline-none focus:text-blue-400 ${isTv ? 'text-8xl w-full' : 'text-2xl lg:text-4xl w-20 lg:w-32'}`}
            />
            <span className={`text-slate-500 font-black uppercase ${isTv ? 'text-3xl' : 'text-xs lg:text-sm'}`}>{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[3rem] flex flex-col ${isTv ? 'p-20 gap-20' : 'p-6 lg:p-10 gap-10'} w-full backdrop-blur-md`}>
      {/* Header com Resumo Rápido */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-800/60 pb-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40">
            <Compass className={`${isTv ? 'w-24 h-24' : 'w-10 h-10'} text-white`} />
          </div>
          <div className="flex flex-col">
            <h3 className={`font-black text-white uppercase tracking-tighter leading-none ${isTv ? 'text-8xl' : 'text-4xl lg:text-5xl'}`}>
              Estabilidade
            </h3>
          </div>
        </div>

        <div className="flex gap-6 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none bg-blue-600/10 border-2 border-blue-500/30 rounded-2xl px-8 py-4 text-center">
            <p className={`font-black text-blue-400 uppercase mb-1 tracking-widest ${isTv ? 'text-2xl' : 'text-xs'}`}>DM (MÉDIO)</p>
            <p className={`font-black text-white ${isTv ? 'text-8xl' : 'text-3xl lg:text-5xl'}`}>{meanDraft.toFixed(2)}m</p>
          </div>
          <div className={`flex-1 lg:flex-none border-2 rounded-2xl px-8 py-4 text-center ${trim === 0 ? 'bg-slate-800/50 border-slate-700' : 'bg-indigo-600/10 border-indigo-500/30'}`}>
            <p className={`font-black text-indigo-400 uppercase mb-1 tracking-widest ${isTv ? 'text-2xl' : 'text-xs'}`}>TRIM</p>
            <p className={`font-black text-white ${isTv ? 'text-8xl' : 'text-3xl lg:text-5xl'}`}>
              {trim > 0 ? `+${trim.toFixed(2)}` : trim.toFixed(2)}m
            </p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isDesktop ? 'xl:grid-cols-1' : 'xl:col-span-12'} gap-10`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          
          {/* Visualizador de Perfil (Trim) */}
          <div className="bg-slate-950/40 border-2 border-slate-800/50 rounded-[2.5rem] p-6 lg:p-8 flex flex-col relative overflow-hidden min-h-[420px]">
            <div className="flex justify-between items-center mb-4">
               <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                 <Ship className="w-5 h-5 text-blue-400" /> Perfil Longitudinal
               </span>
               <span className={`font-black uppercase text-[10px] lg:text-sm tracking-widest ${trim > 0 ? 'text-indigo-400' : trim < 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                 {trim > 0 ? "Derrabado (AR)" : trim < 0 ? "Abicado (AV)" : "Nivelado"}
               </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative py-4">
              <div className="relative w-full max-w-[320px] lg:max-w-[400px] h-32 flex items-center justify-center mb-16">
                <div className="absolute w-[140%] h-[2px] bg-blue-500/20 z-0 top-1/2 -translate-y-1/2"></div>
                
                <div 
                  className="relative transition-transform duration-1000 ease-in-out z-10 w-full"
                  style={{ transform: `rotate(${-trim * 1.5}deg)` }}
                >
                  <div className="w-full h-16 bg-slate-700 rounded-b-[40%] rounded-t-[10%] border-t-[4px] border-slate-600 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-1/4 w-10 h-12 bg-slate-600 -translate-y-1/2 rounded-t-xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-2 flex justify-between items-end px-4 lg:px-8 pointer-events-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-1 h-12 bg-gradient-to-t from-blue-500/40 to-transparent"></div>
                  <p className="text-2xl lg:text-4xl font-black text-white leading-none">{data.draftForward.toFixed(1)}m</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AV</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-1 h-12 bg-gradient-to-t from-blue-500/40 to-transparent"></div>
                  <p className="text-2xl lg:text-4xl font-black text-white leading-none">{data.draftAft.toFixed(1)}m</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visualizador de Banda (Clinômetro) */}
          <div className="bg-slate-950/40 border-2 border-slate-800/50 rounded-[2.5rem] p-6 lg:p-8 flex flex-col items-center relative overflow-hidden min-h-[420px]">
            <span className="absolute top-8 left-8 text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <Activity className="w-5 h-5 text-red-400" /> Seção Transversal
            </span>
            
            <div className="flex-1 flex items-center justify-center pt-8">
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex items-center justify-center">
                <div className="absolute inset-0 border-[2px] lg:border-[3px] border-slate-800 rounded-full opacity-50"></div>
                <div className="absolute top-0 w-1.5 h-6 bg-red-500 rounded-full"></div>

                <div 
                  className="relative transition-transform duration-700 ease-out z-10"
                  style={{ transform: `rotate(${data.heel}deg)` }}
                >
                  <div className="w-32 h-10 lg:w-48 lg:h-14 bg-blue-600 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center border-b-[4px] border-blue-400">
                    <div className="w-full h-[1px] bg-blue-300/20"></div>
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white font-black text-4xl lg:text-6xl drop-shadow-lg">
                    {Math.abs(data.heel)}°
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between w-full mt-auto pt-6 border-t border-slate-800/50">
              <div className={`text-center flex-1 transition-opacity ${data.heel < 0 ? 'opacity-100' : 'opacity-20'}`}>
                <p className="text-[10px] lg:text-sm font-black text-red-400 uppercase tracking-widest">Bombordo</p>
              </div>
              <div className={`text-center flex-1 transition-opacity ${data.heel > 0 ? 'opacity-100' : 'opacity-20'}`}>
                <p className="text-[10px] lg:text-sm font-black text-green-400 uppercase tracking-widest">Boreste</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entradas de Dados */}
        <div className="flex flex-col gap-6">
          <div className={`bg-slate-950/20 rounded-[2rem] p-4 grid gap-4 ${isTv ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {renderInput("Calado AV", data.draftForward, "draftForward", "m", <MoveVertical size={20} />)}
            {renderInput("Calado AR", data.draftAft, "draftAft", "m", <MoveVertical size={20} />)}
            {renderInput("Banda", data.heel, "heel", "°", <Gauge size={20} />)}
            {renderInput("GM", data.gm, "gm", "m", <Anchor size={20} />)}
            {renderInput("Deslocamento", data.displacement, "displacement", "t", <Gauge size={20} />)}
          </div>

          <div className={`p-6 lg:p-8 rounded-[2.5rem] border-4 flex flex-col gap-4 transition-all shadow-xl ${data.gm < 1.0 ? 'bg-red-600/15 border-red-500/40' : 'bg-green-600/15 border-green-500/40'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${data.gm < 1.0 ? 'bg-red-500' : 'bg-green-500'} text-white shadow-lg`}>
                {data.gm < 1.0 ? <ShieldAlert size={24} /> : <Anchor size={24} />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest leading-none mb-1">Status Operacional</p>
                <p className={`font-black uppercase text-sm lg:text-xl ${data.gm < 1.0 ? 'text-red-400' : 'text-green-400'}`}>
                  {data.gm < 1.0 ? "ALERTA: CRÍTICO" : "ESTABILIDADE POSITIVA"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest font-mono">Altura Metacêntrica (GM)</span>
              <span className="font-black text-white text-3xl lg:text-5xl">
                {data.gm.toFixed(2)}<span className="text-lg ml-1 text-slate-500 font-bold uppercase">m</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StabilityPanel;
