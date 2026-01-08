
import React from 'react';
import { ShieldAlert, Info, Waves, Settings2 } from 'lucide-react';

// Componente visual customizado de Válvula de Esgoto (Manivela + Fluxo)
const SewageValveIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="10" r="8" />
    <path d="M12 2v16" />
    <path d="M4 10h16" />
    <circle cx="12" cy="10" r="2" fill="currentColor" />
    <path d="M2 20c1 1 2 0 3-1 2-2 3 0 5 0s3 2 5 2 3-2 5-2c1 0 2 1 3 1" />
  </svg>
);

interface Eductor {
  capacity: number;
  deck: number;
  side?: 'BB' | 'BE';
  atraves: string;
}

interface SectionData {
  section: string;
  eductors: Eductor[];
}

const SECTIONS: SectionData[] = [
  { section: 'C', eductors: [{ atraves: 'Via compartimento 9D'}  ] },
  { section: 'D', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'F', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'G', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'H', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'J', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'K', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'L', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'M', eductors: [{ capacity: 75, deck: 9, side: 'BB' }, { capacity: 75, deck: 9, side: 'BE' }] },
  { section: 'N', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'P', eductors: [] },
  { section: 'Q', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'R', eductors: [] },
  { section: 'S', eductors: [] },
  { section: 'T', eductors: [{ capacity: 15, deck: 7 }] },
];

interface Props {
  eductorStatuses: Record<string, boolean>;
  onStatusToggle: (id: string) => void;
}

const CAVPanel: React.FC<Props> = ({ eductorStatuses, onStatusToggle }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-[3rem] p-6 lg:p-12 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-b border-slate-800/60 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-red-600 rounded-2xl shadow-xl shadow-red-900/20">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase text-2xl lg:text-5xl tracking-tighter">Controle de Avarias (CAV)</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] lg:text-sm tracking-widest mt-1">Esgoto por Arrastamento (Edutores)</p>
          </div>
        </div>
        <div className="bg-slate-950 px-8 py-4 rounded-2xl border border-slate-800 flex items-center gap-4 text-amber-500 shadow-inner">
          <Info size={24} />
          <span className="text-[12px] font-black uppercase tracking-widest leading-tight">
            Interaja com as válvulas para <br/> alternar o status de prontidão
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
        {SECTIONS.map((item) => (
          <div 
            key={item.section}
            className={`relative p-8 lg:p-12 rounded-[2.5rem] border-2 transition-all duration-300 group ${
              item.eductors.length > 0 
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/40' 
                : 'bg-slate-900/40 border-slate-800 opacity-60 grayscale'
            }`}
          >
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col">
                <span className="text-7xl lg:text-9xl font-black text-white leading-none tracking-tighter">
                  {item.section}
                </span>
                <span className="text-[14px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">SEÇÃO</span>
              </div>
              {item.eductors.length > 0 && (
                <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                  <SewageValveIcon className="text-blue-500" size={48} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {item.eductors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {item.eductors.map((ed, idx) => {
                    const eductorId = `${item.section}-${idx}`;
                    const isAvailable = eductorStatuses[eductorId] !== false;
                    return (
                      <button 
                        key={idx} 
                        onClick={() => onStatusToggle(eductorId)}
                        className={`flex items-center justify-between border-2 p-6 rounded-2xl transition-all active:scale-95 ${
                          isAvailable 
                            ? 'bg-blue-600/5 border-blue-500/20 hover:bg-blue-600/10 hover:border-blue-500/40' 
                            : 'bg-red-600/10 border-red-500/40 hover:bg-red-600/20'
                        }`}
                      >
                        <div className="flex flex-col text-left gap-1">
                          <span className={`text-[11px] lg:text-[13px] font-black uppercase tracking-wider ${isAvailable ? 'text-blue-400/80' : 'text-red-400/80'}`}>
                             {ed.capacity} ton/h — Deck {ed.deck} {ed.side ? `(${ed.side})` : ''} {ed.atraves}
                          </span>
                          <span className={`text-[11px] lg:text-[13px] font-black uppercase tracking-wider ${isAvailable ? 'text-blue-400/80' : 'text-red-400/80'}`}>
                             {ed.atraves}
                          </span>
                          <span className={`text-xl lg:text-3xl font-black uppercase tracking-widest leading-none ${isAvailable ? 'text-white' : 'text-red-500'}`}>
                            {isAvailable ? 'PRONTO' : 'AVARIADO'}
                          </span>
                        </div>
                        <SewageValveIcon size={24} className={isAvailable ? 'text-blue-400' : 'text-red-400'} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-14 flex flex-col items-center justify-center text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                  <span className="text-[12px] font-black text-slate-700 uppercase tracking-[0.3em]">Sem edutor</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CAVPanel;
