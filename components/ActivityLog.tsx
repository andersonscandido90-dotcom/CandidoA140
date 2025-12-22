
import React from 'react';
import { History, Clock, User, ArrowRight } from 'lucide-react';
import { LogEntry, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

interface Props {
  logs: LogEntry[];
}

const ActivityLog: React.FC<Props> = ({ logs }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-6 lg:p-10 shadow-2xl backdrop-blur-md h-full flex flex-col">
      <h3 className="text-xl font-black mb-8 flex items-center gap-4 text-blue-400">
        <History size={24} /> LOG DE ATIVIDADES
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-slate-600 font-bold uppercase text-xs text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            Nenhuma atividade registrada hoje
          </div>
        ) : (
          [...logs].reverse().map((log) => (
            <div key={log.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="font-black text-white text-sm uppercase">{log.item}</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${STATUS_CONFIG[log.oldStatus].bgColor} ${STATUS_CONFIG[log.oldStatus].textColor} opacity-50`}>
                  {STATUS_CONFIG[log.oldStatus].label}
                </div>
                <ArrowRight size={14} className="text-slate-600" />
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${STATUS_CONFIG[log.newStatus].bgColor} ${STATUS_CONFIG[log.newStatus].textColor}`}>
                  {STATUS_CONFIG[log.newStatus].label}
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-500/70 uppercase">
                <User size={12} /> {log.user || 'SISTEMA'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
