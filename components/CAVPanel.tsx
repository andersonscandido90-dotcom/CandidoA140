
import React from 'react';
import { ShieldAlert, Droplets, Info } from 'lucide-react';

interface Eductor {
  capacity: number;
  deck: number;
}

interface SectionData {
  section: string;
  eductors: Eductor[];
}

const SECTIONS: SectionData[] = [
  { section: 'C', eductors: [] },
  { section: 'D', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'F', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'G', eductors: [{ capacity: 75, deck: 9 }, { capacity: 75, deck: 9 }] },
  { section: 'H', eductors: [{ capacity: 75, deck: 9 }, { capacity: 75, deck: 9 }] },
  { section: 'J', eductors: [{ capacity: 75, deck: 9 }, { capacity: 75, deck: 9 }] },
  { section: 'K', eductors: [{ capacity: 75, deck: 9 }, { capacity: 75, deck: 9 }] },
  { section: 'L', eductors: [{ capacity: 75, deck: 9 }, { capacity: 75, deck: 9 }] },
  { section: 'M', eductors: [{ capacity: 75, deck: 9 }, { capacity: 75, deck: 9 }] },
  { section: 'N', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'P', eductors: [] },
  { section: 'Q', eductors: [{ capacity: 15, deck: 9 }] },
  { section: 'R', eductors: [] },
  { section: 'S', eductors: [] },
  { section: 'T', eductors: [{ capacity: 15, deck: 7 }] },
];

const CAVPanel: React.FC = () => {
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
        <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Info className="text-blue-400" size={18} />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
            As letras representam as seções do navio
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
                    {item.eductors.map((ed, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-blue-600/5 border border-blue-500/10 p-3 rounded-xl">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-blue-400/70 uppercase">CAPACIDADE</span>
                          <span className="text-lg font-black text-blue-400">{ed.capacity}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-slate-500 uppercase">PISO</span>
                          <span className="text-lg font-black text-white">#{ed.deck}</span>
                        </div>
                      </div>
                    ))}
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
