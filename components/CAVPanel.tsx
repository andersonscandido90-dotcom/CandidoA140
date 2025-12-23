
import React from 'react';
import { ShieldAlert, Droplets, Info, Power } from 'lucide-react';

interface Eductor {
  capacity: number;
  deck: number;
  side?: 'BB' | 'BE';
}

interface SectionData {
  section: string;
  eductors: Eductor[];
}

const SECTIONS: SectionData[] = [
  { section: 'C', eductors: [] },
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
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase text-2xl lg:text-4xl tracking-tighter">Controle de Avarias (CAV)</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] lg:text-xs tracking-widest mt-1">Status e Distribuição de Edutores</p>
          </div>
        </div>
        <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 text-amber-500">
          <Info size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            Clique no edutor para mudar status
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {SECTIONS.map((item) => (
          <div 
            key={item.section}
            className={`relative p-5 lg:p-8 rounded-[1.5rem] border-2 transition-all duration-300 group ${
              item.eductors.length > 0 
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50' 
                : 'bg-slate-900/40 border-slate-800 opacity-60 grayscale'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <span className="text-4xl lg:text-6xl font-black text-white leading-none tracking-tighter">
                  {item.section}
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">SEÇÃO</span>
              </div>
              {item.eductors.length > 0 ? (
                <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-500/20 group-hover:bg-blue-600/20 transition-colors">
                  <Droplets className="text-blue-500" size={24} />
                </div>
              ) : (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <ShieldAlert className="text-slate-600" size={24} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {item.eductors.length > 0 ? (
                <>
                  <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QTD:</span>
                    <span className="text-xl font-black text-white">{item.eductors.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {item.eductors.map((ed, idx) => {
                      const eductorId = `${item.section}-${idx}`;
                      const isAvailable = eductorStatuses[eductorId] !== false; // Default true
                      return (
                        <button 
                          key={idx} 
                          onClick={() => onStatusToggle(eductorId)}
                          className={`flex items-center justify-between border p-3 rounded-xl transition-all active:scale-95 ${
                            isAvailable 
                              ? 'bg-blue-600/5 border-blue-500/10 hover:bg-blue-600/10' 
                              : 'bg-red-600/10 border-red-500/30 hover:bg-red-600/20'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className={`text-[9px] font-black uppercase ${isAvailable ? 'text-blue-400/70' : 'text-red-400/70'}`}>
                              CAP {ed.capacity} / #{ed.deck} {ed.side ? `- ${ed.side}` : ''}
                            </span>
                            <span className={`text-sm font-black uppercase tracking-widest ${isAvailable ? 'text-white' : 'text-red-500'}`}>
                              {isAvailable ? 'DISPONÍVEL' : 'INOPERANTE'}
                            </span>
                          </div>
                          <Power className={isAvailable ? 'text-blue-500' : 'text-red-500'} size={18} />
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Sem Edutor</span>
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
