
import React from 'react';
import { StabilityData } from '../types';
import { Compass, MoveVertical, Anchor, Gauge, Ship, Activity } from 'lucide-react';

interface Props {
  data: StabilityData;
  onChange: (key: keyof StabilityData, val: number) => void;
}

const StabilityPanel: React.FC<Props> = ({ data, onChange }) => {
  const meanDraft = (data.draftForward + data.draftAft) / 2;
  const heightDiff = data.draftForward - data.draftAft; // Positivo = Proa mais ALTA
  
  // Lógica de Status solicitada:
  // Proa (AV) > Popa (AR) = ABICADO (Proa mais alta)
  // Popa (AR) > Proa (AV) = DERRABADO (Popa mais alta)
  // Igual = NIVELADO
  let statusLabel = "NIVELADO";
  let statusColor = "bg-slate-800 border-slate-700 text-slate-400";
  
  if (data.draftForward > data.draftAft) {
    statusLabel = "⚠ ABICADO";
    statusColor = "bg-blue-600 border-white text-white animate-pulse";
  } else if (data.draftAft > data.draftForward) {
    statusLabel = "⚠ DERRABADO";
    statusColor = "bg-amber-500 border-black text-black";
  }

  // CÁLCULO DE CINEMÁTICA VISUAL:
  // Popa (AR) está na ESQUERDA (x=40), Proa (AV) está na DIREITA (x=460).
  // Se heightDiff > 0 (Abicado -> Proa mais alta), a DIREITA deve subir.
  // No CSS rotate(), valores negativos giram no sentido anti-horário (direita sobe).
  const rotationAngle = -heightDiff * 3.0; 
  
  // Calibração de elevação: Quanto maior o calado médio, mais alto o navio fica (sobe no eixo Y).
  // Ponto zero em 7.0m. Se meanDraft > 7, verticalOffset fica negativo (move para cima).
  const sensitivity = 14; 
  const verticalOffset = -(meanDraft - 7.0) * sensitivity;

  const renderInput = (label: string, value: number, key: keyof StabilityData, unit: string, icon: React.ReactNode) => (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 shadow-inner transition-all hover:bg-slate-800/60 group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 rounded-xl text-blue-400 p-2.5 border border-slate-800 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="font-black text-slate-300 uppercase tracking-widest text-[11px]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
            className="bg-transparent text-right font-black text-white text-2xl w-24 focus:outline-none focus:text-blue-400 transition-colors"
          />
          <span className="text-slate-500 font-black uppercase text-xs">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 flex flex-col gap-10 backdrop-blur-md">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-800/60 pb-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-blue-600 rounded-[1.5rem] shadow-xl">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-black text-white uppercase text-4xl lg:text-5xl tracking-tighter">Estabilidade</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
          <div className="bg-blue-600/10 border-2 border-blue-500/20 rounded-2xl px-6 py-4 text-center">
            <p className="font-black text-blue-400 uppercase text-[10px] mb-1 tracking-widest">ELEVAÇÃO MÉDIA</p>
            <p className="font-black text-white text-3xl lg:text-4xl">{meanDraft.toFixed(2)}m</p>
          </div>
          <div className="bg-indigo-600/10 border-2 border-indigo-500/20 rounded-2xl px-6 py-4 text-center">
            <p className="font-black text-indigo-400 uppercase text-[10px] mb-1 tracking-widest">DIFERENÇA</p>
            <p className="font-black text-white text-3xl lg:text-4xl">{Math.abs(heightDiff).toFixed(2)}m</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulação Longitudinal - Proa na Direita (AV), Popa na Esquerda (AR) */}
        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center min-h-[480px] relative overflow-hidden">
          <div className="w-full flex justify-between items-center mb-4 relative z-50">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Ship size={16} /> Simulador de Atitude (Draft = Altura)
            </span>
            <div className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl border-2 transition-all duration-500 ${statusColor}`}>
              {statusLabel}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative w-full h-full">
            {/* Linha de Referência Base (Fixa) */}
            <div className="absolute inset-x-0 top-[70%] h-[2px] bg-slate-800 z-10" />
            
            {/* Indicador de "Abicado" (Cima/Direita) */}
            <div className="absolute right-10 top-20 text-blue-500/20 font-black text-6xl select-none pointer-events-none uppercase">PROA AV</div>
            {/* Indicador de "Derrabado" (Cima/Esquerda) */}
            <div className="absolute left-10 top-20 text-amber-500/20 font-black text-6xl select-none pointer-events-none uppercase">POPA AR</div>

            {/* Navio */}
            <div 
              className="relative w-full max-w-[550px] transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) z-20"
              style={{ 
                transform: `translateY(${verticalOffset}px) rotate(${rotationAngle}deg)`,
                transformOrigin: 'center center' 
              }}
            >
              <svg viewBox="0 0 500 150" className="w-full h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                {/* OBRAS VIVAS (Vermelho) */}
                <path d="M40,85 L460,85 L445,115 L55,115 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
                
                {/* OBRAS MORTAS (Cinza) */}
                <path d="M40,70 L460,70 L460,85 L40,85 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                
                {/* Ilha - Orientada para a Proa (Direita) */}
                <path d="M320,70 L320,25 L380,25 L395,45 L395,70 Z" fill="#475569" stroke="#334155" strokeWidth="1" />
                <rect x="335" y="12" width="10" height="13" fill="#1e293b" />
                
                {/* Réguas Laterais */}
                <g stroke="rgba(255,255,255,0.3)" strokeWidth="1">
                  <line x1="45" y1="85" x2="45" y2="115" />
                  <line x1="455" y1="85" x2="455" y2="115" />
                </g>
              </svg>

              {/* Etiquetas AR/AV */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-[10px] font-black text-white uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-xl">POPA (AR)</span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center">
                <span className="text-[10px] font-black text-white uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-xl">PROA (AV)</span>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-6 mt-12 relative z-50">
            <div className={`text-center p-5 rounded-2xl border transition-all duration-500 ${data.draftAft > data.draftForward ? 'bg-amber-600 border-white shadow-[0_0_30px_rgba(217,119,6,0.4)]' : 'bg-slate-900/95 border-slate-700'}`}>
              <p className="text-4xl font-black text-white tracking-tighter">{data.draftAft.toFixed(2)}m</p>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${data.draftAft > data.draftForward ? 'text-white' : 'text-slate-500'}`}>ALTURA POPA (AR)</p>
            </div>
            <div className={`text-center p-5 rounded-2xl border transition-all duration-500 ${data.draftForward > data.draftAft ? 'bg-blue-600 border-white shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-slate-900/95 border-slate-700'}`}>
              <p className="text-4xl font-black text-white tracking-tighter">{data.draftForward.toFixed(2)}m</p>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${data.draftForward > data.draftAft ? 'text-white' : 'text-slate-500'}`}>ALTURA PROA (AV)</p>
            </div>
          </div>
        </div>

        {/* Inclinação Transversal (Banda) */}
        <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center min-h-[480px]">
          <div className="w-full flex justify-between items-center mb-8">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} /> Inclinação Transversal (Banda)
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-72 h-72 border-8 border-slate-900 rounded-full flex items-center justify-center bg-slate-950/50 shadow-inner">
              <div className="absolute top-0 w-1.5 h-12 bg-red-600 rounded-full -translate-y-1/2 z-20" />
              <div 
                className="w-56 h-20 transition-transform duration-1000 ease-out relative"
                style={{ transform: `rotate(${data.heel}deg)` }}
              >
                <div className="absolute bottom-0 left-0 w-full h-12 bg-slate-800 rounded-b-[3rem] border-b-[10px] border-blue-600" />
                <div className="absolute top-0 left-0 w-full h-8 bg-slate-700 rounded-t-lg shadow-xl" />
              </div>
              <div className="absolute -bottom-6 bg-slate-900 border-2 border-blue-500/40 px-8 py-3 rounded-2xl shadow-2xl">
                <span className="text-5xl font-black text-white tracking-tighter">{Math.abs(data.heel).toFixed(1)}°</span>
                <span className="text-sm font-black text-blue-400 ml-3 uppercase">
                  {data.heel > 0 ? 'BE' : data.heel < 0 ? 'BB' : 'Centro'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderInput("Alt. Proa AV (+ sobe)", data.draftForward, "draftForward", "m", <MoveVertical size={18} />)}
        {renderInput("Alt. Popa AR (+ sobe)", data.draftAft, "draftAft", "m", <MoveVertical size={18} />)}
        {renderInput("Banda (BB- / BE+)", data.heel, "heel", "°", <Activity size={18} />)}
        {renderInput("GM (Estabilidade)", data.gm, "gm", "m", <Anchor size={18} />)}
        {renderInput("Deslocamento", data.displacement, "displacement", "t", <Gauge size={18} />)}
      </div>
    </div>
  );
};

export default StabilityPanel;
