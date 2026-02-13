import React, { useState, useEffect } from 'react';
import { Notebook, Save, Trash2, Type } from 'lucide-react';

interface Props {
  uiMode?: 'desktop' | 'tv' | 'tablet' | 'phone';
}

const Notepad: React.FC<Props> = ({ uiMode = 'desktop' }) => {
  const [noteText, setNoteText] = useState<string>('');
  const isTv = uiMode === 'tv';
  const isTablet = uiMode === 'tablet';
  const isPhone = uiMode === 'phone';

  // Carrega anotação salva
  useEffect(() => {
    const savedNote = localStorage.getItem('a140_notepad');
    if (savedNote) {
      setNoteText(savedNote);
    }
  }, []);

  // Salva automaticamente
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNoteText(newText);
    localStorage.setItem('a140_notepad', newText);
  };

  // Limpa anotações
  const clearNote = () => {
    if (window.confirm('Limpar todas as anotações?')) {
      setNoteText('');
      localStorage.removeItem('a140_notepad');
    }
  };

  // Exportar anotações
  const exportNote = () => {
    const blob = new Blob([noteText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anotacoes_a140_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-slate-900/80 border border-slate-800 shadow-2xl rounded-[3rem] flex flex-col w-full backdrop-blur-md ${
      isTv ? 'p-12' : isPhone ? 'p-4' : 'p-8'
    }`}>
      {/* Header - igual aos outros painéis */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-8 mb-6">
        <div className="flex items-center gap-6">
          <div className={`p-5 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/40 ${
            isTv ? 'p-8' : ''
          }`}>
            <Notebook className={`${isTv ? 'w-16 h-16' : 'w-8 h-8'} text-white`} />
          </div>
          <div>
            <h3 className={`font-black text-white uppercase tracking-tighter leading-none ${
              isTv ? 'text-7xl' : 'text-3xl lg:text-4xl'
            }`}>
              Bloco de Notas
            </h3>
            <p className={`text-slate-500 font-bold uppercase tracking-widest mt-1 ${
              isTv ? 'text-2xl' : 'text-xs'
            }`}>
              Anotações de Serviço
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            onClick={exportNote}
            className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl px-4 py-2 transition-all border border-slate-700 ${
              isTv ? 'text-2xl px-8 py-4' : 'text-sm'
            }`}
            title="Exportar anotações"
          >
            <Save size={isTv ? 32 : 16} />
            {!isPhone && 'Exportar'}
          </button>
          <button
            onClick={clearNote}
            className={`flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl px-4 py-2 transition-all border border-red-800/50 ${
              isTv ? 'text-2xl px-8 py-4' : 'text-sm'
            }`}
            title="Limpar anotações"
          >
            <Trash2 size={isTv ? 32 : 16} />
            {!isPhone && 'Limpar'}
          </button>
        </div>
      </div>

      {/* Área de texto - igual aos inputs dos outros painéis */}
      <div className="flex-1">
        <textarea
          value={noteText}
          onChange={handleNoteChange}
          placeholder="Digite aqui observações gerais do serviço, ocorrências, lembretes, procedimentos ou qualquer informação relevante... (as anotações são salvas automaticamente)"
          className={`w-full h-[500px] lg:h-[600px] bg-slate-950/40 border-2 border-slate-800/50 rounded-[2.5rem] p-8 font-mono text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none transition-all resize-none ${
            isTv ? 'text-3xl p-12' : isPhone ? 'text-base p-4' : 'text-lg'
          }`}
          style={{ lineHeight: isTv ? '1.8' : '1.6' }}
        />
      </div>

      {/* Rodapé com contador - igual aos painéis de estabilidade */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2 text-slate-500">
          <Type size={isTv ? 24 : 16} />
          <span className={`font-mono ${isTv ? 'text-2xl' : 'text-sm'}`}>
            {noteText.length} caracteres
          </span>
        </div>
        <span className={`text-slate-600 font-mono ${isTv ? 'text-xl' : 'text-xs'}`}>
          {noteText.split('\n').length} linhas
        </span>
      </div>
    </div>
  );
};

export default Notepad;
