import React, { useState } from 'react';
import { StickyNote, Clock, User as UserIcon, Send, Trash2, History, AlertCircle, Lock } from 'lucide-react';
import { NoteEntry } from '../types';

interface Props {
  notes: NoteEntry[];
  onAddNote: (text: string) => void;
  onDeleteNote: (id: string) => void;
  currentUser: string;
  readOnly?: boolean;
}

const NotesPanel: React.FC<Props> = ({ notes, onAddNote, onDeleteNote, currentUser, readOnly = false }) => {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[1.5rem] lg:rounded-[3rem] p-6 lg:p-12 backdrop-blur-md relative animate-in fade-in duration-500">
      {readOnly && (
        <div className="absolute top-4 right-10 flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase bg-slate-950 px-3 py-1 rounded-full border border-slate-800 z-10">
          <Lock size={10} /> Consulta
        </div>
      )}

      <div className="flex items-center gap-5 mb-10 border-b border-slate-800/60 pb-8">
        <div className="p-4 bg-amber-600 rounded-2xl shadow-xl shadow-amber-900/20">
          <StickyNote className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="font-black text-white uppercase text-2xl lg:text-5xl tracking-tighter">Anotações de Serviço</h3>
          <p className="text-slate-500 font-bold uppercase text-[10px] lg:text-sm tracking-widest mt-1">Livro de Ocorrências Digital</p>
        </div>
      </div>

      {!readOnly && (
        <form onSubmit={handleSubmit} className="mb-12 bg-slate-950 border border-slate-800 p-6 rounded-[2rem] shadow-inner">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 ml-2">
              <UserIcon size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Relatado por: {currentUser}</span>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Descreva o que aconteceu no serviço (eventos, manutenções, rondas...)"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white font-medium focus:border-blue-500 outline-none min-h-[150px] resize-none transition-all placeholder:text-slate-700"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 px-8 py-4 rounded-xl font-black uppercase text-xs text-white transition-all shadow-lg active:scale-95"
              >
                <Send size={18} /> Registrar Ocorrência
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4 ml-2">
          <History size={16} className="text-slate-500" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Histórico do Dia</span>
        </div>

        {notes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-950/40 rounded-[2rem] border-2 border-dashed border-slate-800">
            <AlertCircle size={48} className="text-slate-700 mb-4" />
            <span className="font-black text-slate-600 uppercase tracking-[0.2em]">Nenhum registro encontrado para esta data</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {[...notes].reverse().map((note) => (
              <div key={note.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-4 group transition-all hover:border-slate-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 font-black text-lg">
                      {note.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase text-sm">{note.user}</h4>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold">
                        <Clock size={12} />
                        {new Date(note.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {!readOnly && (note.user === currentUser || currentUser === 'Candido') && (
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium pl-2 border-l-2 border-slate-800">
                  {note.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
