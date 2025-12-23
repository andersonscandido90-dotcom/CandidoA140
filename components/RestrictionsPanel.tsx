
import React from 'react';
import { AlertTriangle, MapPin, ClipboardEdit, AlertCircle } from 'lucide-react';
import { EquipmentData, EquipmentStatus } from '../types';
import { EQUIPMENT_LOCATIONS } from '../constants';

interface Props {
  data: EquipmentData;
  reasons: Record<string, string>;
  onReasonChange: (item: string, reason: string) => void;
}

const RestrictionsPanel: React.FC<Props> = ({ data, reasons, onReasonChange }) => {
  // Agora filtra tanto RESTRICTED quanto UNAVAILABLE
  const restrictedItems = Object.entries(data).filter(([_, status]) => 
    status === EquipmentStatus.RESTRICTED || status === EquipmentStatus.UNAVAILABLE
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] sm:rounded-[3rem] p-6 lg:p-12 backdrop-blur-md">
      <div className="flex items-center gap-5 mb-10 border-b border-slate-800/60 pb-8">
        <div className="p-4 bg-slate-800 rounded-2xl shadow-xl flex gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="font-black text-white uppercase text-2xl lg:text-4xl tracking-tighter">Equipamentos Fora de Prontidão</h3>
          <p className="text-slate-500 font-bold uppercase text-[10px] lg:text-xs tracking-widest mt-1">Detalhamento de restrições e indisponibilidades</p>
        </div>
      </div>

      {restrictedItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-950/50 rounded-[2rem] border-2 border-dashed border-slate-800">
          <div className="p-6 bg-slate-900 rounded-full mb-4 text-slate-700">
            <AlertCircle size={48} />
          </div>
          <span className="font-black text-slate-600 uppercase tracking-[0.2em]">Todos os equipamentos operando normalmente</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restrictedItems.map(([name, status]) => {
            const isUnavailable = status === EquipmentStatus.UNAVAILABLE;
            const statusColor = isUnavailable ? 'text-red-500' : 'text-amber-500';
            const statusBg = isUnavailable ? 'bg-red-500/10' : 'bg-amber-500/10';
            const statusBorder = isUnavailable ? 'border-red-500/20' : 'border-amber-500/20';
            const shadowHover = isUnavailable ? 'hover:border-red-500/30' : 'hover:border-amber-500/30';

            return (
              <div key={name} className={`bg-slate-950 border border-slate-800 rounded-2xl p-6 ${shadowHover} transition-all group relative overflow-hidden`}>
                {/* Indicador lateral de status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isUnavailable ? 'bg-red-500' : 'bg-amber-500'}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="font-black text-white text-xl uppercase tracking-tighter">{name}</span>
                    <div className="flex items-center gap-2 mt-1 text-slate-500">
                      <MapPin size={12} className={statusColor} />
                      <span className="text-[10px] font-black uppercase">Localização: #{EQUIPMENT_LOCATIONS[name] || '??'}</span>
                    </div>
                  </div>
                  <div className={`${statusBg} ${statusColor} px-3 py-1 rounded-lg border ${statusBorder} text-[9px] font-black uppercase tracking-widest`}>
                    {isUnavailable ? 'INDISPONÍVEL' : 'RESTRIÇÃO'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    <ClipboardEdit size={12} /> Justificativa Técnica / Motivo
                  </label>
                  <textarea
                    value={reasons[name] || ''}
                    onChange={(e) => onReasonChange(name, e.target.value)}
                    placeholder={`Descreva por que o ${name} está ${isUnavailable ? 'indisponível' : 'com restrição'}...`}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold text-white focus:border-${isUnavailable ? 'red' : 'amber'}-500 outline-none transition-all min-h-[100px] placeholder:text-slate-700`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RestrictionsPanel;
