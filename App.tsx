
import React, { useState, useEffect, memo } from 'react';
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
  Calendar,
  Smartphone,
  Tablet,
  Compass
} from 'lucide-react';
import { EquipmentStatus, DailyReport, FuelData, EquipmentData, StabilityData } from './types';
import { CATEGORIES, STATUS_CONFIG, SHIP_CONFIG } from './constants';
import EquipmentSection from './components/EquipmentSection';
import FuelPanel from './components/FuelPanel';
import StatusCharts from './components/StatusCharts';
import StabilityPanel from './components/StabilityPanel';

const DEFAULT_FUEL: FuelData = { 
  water: 0, 
  lubOil: 0, 
  fuelOil: 0, 
  jp5: 0,
  maxWater: 800,
  maxLubOil: 200,
  maxFuelOil: 500,
  maxJp5: 300
};

const DEFAULT_STABILITY: StabilityData = {
  draftForward: 9.5,
  draftAft: 9.8,
  heel: 0,
  gm: 1.5,
  displacement: 21500
};

const ShipLogo = memo(({ className = "w-24 h-auto" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
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
));

type UIMode = 'desktop' | 'tv' | 'tablet' | 'phone';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData>({});
  const [fuelData, setFuelData] = useState<FuelData>(DEFAULT_FUEL);
  const [stabilityData, setStabilityData] = useState<StabilityData>(DEFAULT_STABILITY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'equipment' | 'fuel' | 'stability' | 'tv' | 'tablet' | 'smartphone'>('dashboard');
  const [kioskTab, setKioskTab] = useState<'systems' | 'fuel' | 'stability'>('systems');

  useEffect(() => {
    const saved = localStorage.getItem(`report_${selectedDate}`);
    if (saved) {
      const parsed: DailyReport = JSON.parse(saved);
      setEquipmentData(parsed.equipment || {});
      setFuelData({ ...DEFAULT_FUEL, ...(parsed.fuel || {}) });
      setStabilityData({ ...DEFAULT_STABILITY, ...(parsed.stability || {}) });
    } else {
      setEquipmentData({});
      setFuelData(DEFAULT_FUEL);
      setStabilityData(DEFAULT_STABILITY);
    }
  }, [selectedDate]);

  const saveCurrentData = (newEquip?: EquipmentData, newFuel?: FuelData, newStability?: StabilityData) => {
    const report: DailyReport = {
      date: selectedDate,
      equipment: newEquip || equipmentData,
      fuel: newFuel || fuelData,
      stability: newStability || stabilityData
    };
    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(report));
    if (newEquip) setEquipmentData(newEquip);
    if (newFuel) setFuelData(newFuel);
    if (newStability) setStabilityData(newStability);
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

  const handleStabilityChange = (key: keyof StabilityData, val: number) => {
    const updated = { ...stabilityData, [key]: val };
    saveCurrentData(undefined, undefined, updated);
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

  const isKioskMode = view === 'tv' || view === 'tablet' || view === 'smartphone';
  const currentUIMode: UIMode = 
    view === 'tv' ? 'tv' : 
    view === 'tablet' ? 'tablet' : 
    view === 'smartphone' ? 'phone' : 'desktop';

  if (isKioskMode) {
    const headerScale = currentUIMode === 'tv' ? 'p-16' : currentUIMode === 'tablet' ? 'p-10' : 'p-6';
    const titleScale = currentUIMode === 'tv' ? 'text-9xl' : currentUIMode === 'tablet' ? 'text-6xl' : 'text-3xl';
    const subTitleScale = currentUIMode === 'tv' ? 'text-5xl' : currentUIMode === 'tablet' ? 'text-3xl' : 'text-xl';
    const logoSize = currentUIMode === 'tv' ? 'w-56' : currentUIMode === 'tablet' ? 'w-32' : 'w-20';
    const tabTextSize = currentUIMode === 'tv' ? 'text-5xl py-12' : currentUIMode === 'tablet' ? 'text-2xl py-6' : 'text-sm py-4';
    const iconSize = currentUIMode === 'tv' ? 'w-20 h-20' : currentUIMode === 'tablet' ? 'w-10 h-10' : 'w-5 h-5';

    return (
      <div className={`fixed inset-0 bg-slate-950 text-white overflow-hidden flex flex-col ${currentUIMode === 'phone' ? 'safe-area-top' : ''}`}>
        <header className={`flex flex-col gap-6 ${headerScale} bg-slate-900/50 border-b-4 border-slate-800 backdrop-blur-md`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6 lg:gap-12">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <ShipLogo className={`${logoSize} h-auto relative`} />
              </div>
              <div>
                <h1 className={`${titleScale} font-black tracking-tighter drop-shadow-2xl leading-none flex items-baseline gap-4`}>
                  {SHIP_CONFIG.name}
                  <span className={`${subTitleScale} text-blue-500 opacity-80`}>{SHIP_CONFIG.hullNumber}</span>
                </h1>
                <div className="flex items-center gap-4 mt-2 lg:mt-6">
                   <p className={`${currentUIMode === 'phone' ? 'text-[10px]' : 'text-2xl'} text-slate-500 font-bold uppercase tracking-[0.15em]`}>{SHIP_CONFIG.designation}</p>
                   {currentUIMode !== 'phone' && <div className="h-6 w-1 bg-slate-700"></div>}
                   {currentUIMode !== 'phone' && (
                     <div className="flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        <p className="text-2xl font-black text-white">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView('dashboard')}
              className={`${currentUIMode === 'phone' ? 'p-4 rounded-xl' : 'p-6 rounded-[2rem]'} bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-2 border-red-600/30 transition-all flex items-center gap-4 font-black shadow-2xl active:scale-95`}
            >
              <Minimize2 className={iconSize} />
              {currentUIMode !== 'phone' && <span className="text-xl">SAIR</span>}
            </button>
          </div>

          <div className={`flex ${currentUIMode === 'phone' ? 'gap-2' : 'gap-4'} mt-2`}>
            <button 
              onClick={() => setKioskTab('systems')}
              className={`flex-1 ${tabTextSize} rounded-2xl lg:rounded-[3rem] flex items-center justify-center gap-4 border-2 transition-all duration-300 font-black uppercase tracking-widest ${
                kioskTab === 'systems' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-500'
              }`}
            >
              <Settings2 className={iconSize} />
              {currentUIMode !== 'phone' && "Sistemas"}
            </button>
            <button 
              onClick={() => setKioskTab('fuel')}
              className={`flex-1 ${tabTextSize} rounded-2xl lg:rounded-[3rem] flex items-center justify-center gap-4 border-2 transition-all duration-300 font-black uppercase tracking-widest ${
                kioskTab === 'fuel' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-500'
              }`}
            >
              <Droplets className={iconSize} />
              {currentUIMode !== 'phone' && "Cargas"}
            </button>
            <button 
              onClick={() => setKioskTab('stability')}
              className={`flex-1 ${tabTextSize} rounded-2xl lg:rounded-[3rem] flex items-center justify-center gap-4 border-2 transition-all duration-300 font-black uppercase tracking-widest ${
                kioskTab === 'stability' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-500'
              }`}
            >
              <Compass className={iconSize} />
              {currentUIMode !== 'phone' && "Estabilidade"}
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto ${currentUIMode === 'phone' ? 'p-4' : 'p-12'} scroll-smooth custom-scrollbar`}>
          {kioskTab === 'systems' ? (
            <div className={`${currentUIMode === 'tv' ? 'space-y-32' : 'space-y-12'}`}>
              {CATEGORIES.map((category) => (
                <div key={category.name}>
                  <EquipmentSection category={category} data={equipmentData} onStatusChange={handleStatusChange} uiMode={currentUIMode} />
                </div>
              ))}
            </div>
          ) : kioskTab === 'fuel' ? (
            <div className="max-w-screen-2xl mx-auto py-8">
              <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth uiMode={currentUIMode} />
            </div>
          ) : (
            <div className="max-w-screen-2xl mx-auto py-8">
              <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode={currentUIMode} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 border-r border-slate-800 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex flex-col items-center gap-6 mb-12">
            <ShipLogo className="w-32 h-auto" />
            <div className="text-center">
              <h1 className="font-black text-2xl text-white">{SHIP_CONFIG.name}</h1>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.1em] mt-2">ESTADO DE PRONTIDÃO</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4">Operacional</p>
            <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={24} />} label="Dashboard" onClick={() => setView('dashboard')} />
            <NavItem active={view === 'equipment'} icon={<Activity size={24} />} label="Equipamentos" onClick={() => setView('equipment')} />
            <NavItem active={view === 'fuel'} icon={<Droplets size={24} />} label="Carga Líquida" onClick={() => setView('fuel')} />
            <NavItem active={view === 'stability'} icon={<Compass size={24} />} label="Estabilidade" onClick={() => setView('stability')} />
            
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-8 mb-4 px-4">Exibição</p>
            <NavItem active={(view as string) === 'tv'} icon={<Monitor size={24} />} label="Modo TV" variant="special" onClick={() => { setView('tv'); setKioskTab('systems'); }} />
            <NavItem active={(view as string) === 'tablet'} icon={<Tablet size={24} />} label="Modo Tablet" variant="special" onClick={() => { setView('tablet'); setKioskTab('systems'); }} />
            <NavItem active={(view as string) === 'smartphone'} icon={<Smartphone size={24} />} label="Modo Celular" variant="special" onClick={() => { setView('smartphone'); setKioskTab('systems'); }} />
          </nav>

          <button onClick={exportData} className="mt-auto w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 text-white rounded-2xl font-bold border border-slate-700">
            <Download size={20} /> Exportar Relatório
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen bg-slate-950">
        <header className="p-8 lg:p-12 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
          <div className="flex items-center gap-8">
            <ShipLogo className="w-24 h-auto hidden md:block" />
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white">{SHIP_CONFIG.name} <span className="text-slate-500 text-2xl">{SHIP_CONFIG.hullNumber}</span></h2>
              <div className="flex items-center gap-4 mt-2">
                <Calendar className="text-blue-500" size={20} />
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-bold text-white focus:outline-none" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 space-y-12">
          {view === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <FuelPanel fuel={fuelData} onChange={handleFuelChange} uiMode="desktop" />
                <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode="desktop" />
              </div>
            </div>
          )}

          {view === 'equipment' && (
            <div className="space-y-12">
              {CATEGORIES.map(category => (
                <EquipmentSection key={category.name} category={category} data={equipmentData} onStatusChange={handleStatusChange} uiMode="desktop" />
              ))}
            </div>
          )}

          {view === 'fuel' && <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth uiMode="desktop" />}
          
          {view === 'stability' && <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode="desktop" />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick, variant = 'default' }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, variant?: 'default' | 'special' }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${active ? (variant === 'special' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white') : 'text-slate-500 hover:bg-slate-800'}`}>
    {icon} <span className="text-sm uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
