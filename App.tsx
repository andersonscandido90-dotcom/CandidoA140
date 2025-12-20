
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  Download, 
  LayoutDashboard,
  Clock,
  Menu,
  X,
  Monitor,
  Minimize2,
  Settings2,
  Anchor,
  Calendar
} from 'lucide-react';
import { EquipmentStatus, DailyReport, FuelData, EquipmentData } from './types';
import { CATEGORIES, STATUS_CONFIG, SHIP_CONFIG } from './constants';
import EquipmentSection from './components/EquipmentSection';
import FuelPanel from './components/FuelPanel';
import StatusCharts from './components/StatusCharts';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData>({});
  const [fuelData, setFuelData] = useState<FuelData>({ water: 0, lubOil: 0, fuelOil: 0, jp5: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'equipment' | 'fuel' | 'tv'>('dashboard');
  const [tvTab, setTvTab] = useState<'systems' | 'fuel'>('systems');

  useEffect(() => {
    const saved = localStorage.getItem(`report_${selectedDate}`);
    if (saved) {
      const parsed: DailyReport = JSON.parse(saved);
      setEquipmentData(parsed.equipment || {});
      setFuelData(parsed.fuel || { water: 0, lubOil: 0, fuelOil: 0, jp5: 0 });
    } else {
      setEquipmentData({});
      setFuelData({ water: 0, lubOil: 0, fuelOil: 0, jp5: 0 });
    }
  }, [selectedDate]);

  const saveCurrentData = (newEquip?: EquipmentData, newFuel?: FuelData) => {
    const report: DailyReport = {
      date: selectedDate,
      equipment: newEquip || equipmentData,
      fuel: newFuel || fuelData
    };
    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(report));
    if (newEquip) setEquipmentData(newEquip);
    if (newFuel) setFuelData(newFuel);
  };

  const handleStatusChange = (name: string) => {
    const statusOrder = [
      EquipmentStatus.AVAILABLE,
      EquipmentStatus.IN_LINE,
      EquipmentStatus.IN_SERVICE,
      EquipmentStatus.RESTRICTED,
      EquipmentStatus.UNAVAILABLE
    ];
    const currentStatus = equipmentData[name] || EquipmentStatus.AVAILABLE;
    const nextIdx = (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIdx];
    
    const updated = { ...equipmentData, [name]: nextStatus };
    saveCurrentData(updated);
  };

  const handleFuelChange = (key: keyof FuelData, val: number) => {
    const updated = { ...fuelData, [key]: val };
    saveCurrentData(undefined, updated);
  };

  const exportData = () => {
    const allData: Record<string, DailyReport> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('report_')) {
        allData[key] = JSON.parse(localStorage.getItem(key)!);
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlantico_full_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const isTvMode = view === 'tv';

  const ShipLogo = ({ className = "w-24 h-auto" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src={SHIP_CONFIG.badgeUrl} 
        alt="Brasão NAM Atlântico" 
        className="w-full h-full object-contain drop-shadow-2xl"
        crossOrigin="anonymous"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const icon = document.createElement('div');
            icon.className = "p-4 bg-blue-600 rounded-full border-4 border-blue-400";
            icon.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
            parent.appendChild(icon);
          }
        }}
      />
    </div>
  );

  if (isTvMode) {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden flex flex-col animate-in fade-in duration-700">
        <header className="flex flex-col gap-8 p-12 lg:p-16 bg-slate-900/50 border-b-8 border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-12">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <ShipLogo className="w-56 h-auto relative" />
              </div>
              <div>
                <h1 className="text-9xl font-black tracking-tighter drop-shadow-2xl leading-none flex items-baseline gap-6">
                  {SHIP_CONFIG.name}
                  <span className="text-5xl text-blue-500 opacity-80">{SHIP_CONFIG.hullNumber}</span>
                </h1>
                <div className="flex items-center gap-6 mt-6">
                   <p className="text-4xl text-slate-500 font-bold uppercase tracking-[0.15em]">{SHIP_CONFIG.designation}</p>
                   <div className="h-10 w-1.5 bg-slate-700"></div>
                   <div className="flex items-center gap-4">
                      <Clock className="w-12 h-12 text-blue-500" />
                      <p className="text-5xl font-black text-white">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView('dashboard')}
              className="p-8 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-4 border-red-600/30 rounded-[3rem] transition-all flex items-center gap-6 font-black text-4xl shadow-2xl active:scale-95"
            >
              <Minimize2 className="w-16 h-16" />
              FECHAR PAINEL
            </button>
          </div>

          <div className="flex gap-10 mt-6">
            <button 
              onClick={() => setTvTab('systems')}
              className={`flex-1 py-12 rounded-[3rem] flex items-center justify-center gap-10 border-4 transition-all duration-300 font-black text-6xl uppercase tracking-widest ${
                tvTab === 'systems' 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_80px_rgba(37,99,235,0.5)] scale-[1.02]' 
                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'
              }`}
            >
              <Settings2 className="w-20 h-20" />
              Sistemas
            </button>
            <button 
              onClick={() => setTvTab('fuel')}
              className={`flex-1 py-12 rounded-[3rem] flex items-center justify-center gap-10 border-4 transition-all duration-300 font-black text-6xl uppercase tracking-widest ${
                tvTab === 'fuel' 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_80px_rgba(37,99,235,0.5)] scale-[1.02]' 
                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'
              }`}
            >
              <Droplets className="w-20 h-20" />
              Carga Líquida
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 lg:p-24 scroll-smooth custom-scrollbar">
          {tvTab === 'systems' ? (
            <div className="space-y-32">
              {CATEGORIES.map((category) => (
                <div key={category.name} className="animate-in slide-in-from-bottom-12 duration-500">
                  <EquipmentSection 
                    category={category} 
                    data={equipmentData} 
                    onStatusChange={handleStatusChange} 
                    isTvMode
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-screen-2xl mx-auto py-16 animate-in zoom-in-95 duration-500">
              <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth isTvMode />
            </div>
          )}
        </div>

        <footer className="bg-slate-900 p-10 border-t-8 border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="w-8 h-8 rounded-full bg-green-500 animate-pulse shadow-[0_0_20px_#22c55e]"></div>
            <span className="text-4xl font-black text-slate-400 uppercase tracking-widest">SISTEMA ATIVO - {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="text-4xl font-black text-blue-500 uppercase tracking-widest flex items-center gap-4">
            <Anchor className="w-10 h-10" />
            {tvTab === 'systems' ? 'Status dos Equipamentos' : 'Controle de Insumos'}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-6 bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <ShipLogo className="w-12 h-auto" />
          <span className="font-black tracking-tighter text-white text-xl">ATLÂNTICO</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-800 rounded-xl text-slate-300">
          {isSidebarOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 border-r border-slate-800 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="hidden lg:flex flex-col items-center gap-6 mb-12">
            <div className="relative group">
               <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
               <ShipLogo className="w-32 h-auto relative" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl leading-none tracking-tight text-white">{SHIP_CONFIG.name}</h1>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.1em] mt-2">ATAQUE CONTÍNUO E AGRESSIVO</p>
            </div>
          </div>

          <nav className="flex-1 space-y-4">
            <NavItem 
              active={view === 'dashboard'} 
              icon={<LayoutDashboard className="w-7 h-7" />} 
              label="Dashboard" 
              onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              active={view === 'equipment'} 
              icon={<Activity className="w-7 h-7" />} 
              label="Equipamentos" 
              onClick={() => { setView('equipment'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              active={view === 'fuel'} 
              icon={<Droplets className="w-7 h-7" />} 
              label="Carga Líquida" 
              onClick={() => { setView('fuel'); setIsSidebarOpen(false); }} 
            />
            <div className="pt-4 border-t border-slate-800/50">
              <NavItem 
                active={view === 'tv'} 
                icon={<Monitor className="w-7 h-7" />} 
                label="Modo TV" 
                variant="special"
                onClick={() => { setView('tv'); setIsSidebarOpen(false); setTvTab('systems'); }} 
              />
            </div>
          </nav>

          <div className="mt-auto space-y-6 pt-8 border-t border-slate-800/50">
            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">SISTEMA</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-lg font-bold">OPERACIONAL</span>
              </div>
            </div>
            <button 
              onClick={exportData}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition-all font-bold text-sm border border-slate-700 active:scale-95"
            >
              <Download className="w-5 h-5" />
              Relatório Geral
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen bg-slate-950 scroll-smooth">
        <header className="p-8 lg:p-12 bg-slate-900/40 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-10 sticky top-0 z-30 backdrop-blur-xl">
          <div className="flex items-center gap-8">
            <ShipLogo className="w-24 h-auto hidden md:block" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black tracking-[0.2em] uppercase border border-blue-500/20 shadow-sm">
                  ATAQUE CONTÍNUO E AGRESSIVO
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg flex items-baseline gap-4">
                {SHIP_CONFIG.name}
                <span className="text-2xl text-slate-500 font-bold">{SHIP_CONFIG.hullNumber}</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-56 bg-slate-800/80 border border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-lg font-bold focus:ring-4 focus:ring-blue-500/20 focus:outline-none text-white transition-all shadow-xl"
              />
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 space-y-12">
          {view === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 gap-12">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <StatusCharts data={equipmentData} />
                  <FuelPanel fuel={fuelData} onChange={handleFuelChange} />
                </div>
              </div>
              
              <div className="space-y-10">
                <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-6 py-2">
                  <h3 className="text-3xl font-black uppercase tracking-[0.15em] text-white">
                    Sistemas em Operação
                  </h3>
                </div>
                {CATEGORIES.map((category) => (
                  <EquipmentSection 
                    key={category.name} 
                    category={category} 
                    data={equipmentData} 
                    onStatusChange={handleStatusChange} 
                  />
                ))}
              </div>
            </div>
          )}

          {view === 'equipment' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-3xl border border-slate-800">
                <h3 className="text-3xl font-black uppercase">Status dos Equipamentos</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.values(STATUS_CONFIG).map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-2.5 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-sm">
                      <div className={`w-4 h-4 rounded-full ${s.bgColor} shadow-md`}></div>
                      <span className="text-xs font-black text-slate-100 uppercase tracking-widest">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {CATEGORIES.map((category) => (
                <EquipmentSection 
                  key={category.name} 
                  category={category} 
                  data={equipmentData} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
            </div>
          )}

          {view === 'fuel' && (
            <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
               <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'special';
}

const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl font-black transition-all group ${
      active 
        ? variant === 'special' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 translate-x-2' : 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 translate-x-2' 
        : variant === 'special' ? 'text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-200' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <span className={`${active ? 'text-white' : variant === 'special' ? 'text-indigo-500' : 'text-slate-600 group-hover:text-blue-400 group-hover:scale-110 transition-transform'}`}>{icon}</span>
    <span className="text-lg uppercase tracking-wider">{label}</span>
    {active && <div className="ml-auto w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>}
  </button>
);

export default App;
