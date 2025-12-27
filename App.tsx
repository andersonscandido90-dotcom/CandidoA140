
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Droplets, 
  LayoutDashboard,
  Calendar,
  Compass,
  Users,
  Shield,
  UserCheck,
  Menu,
  X,
  Tv,
  Monitor,
  ShieldAlert,
  ClipboardList,
  Clock,
  Palette
} from 'lucide-react';
import { EquipmentStatus, DailyReport, FuelData, EquipmentData, StabilityData, PersonnelData, LogEntry } from './types';
import { CATEGORIES, SHIP_CONFIG, STATUS_CONFIG } from './constants';
import EquipmentSection from './components/EquipmentSection';
import FuelPanel from './components/FuelPanel';
import StabilityPanel from './components/StabilityPanel';
import StatusCharts from './components/StatusCharts';
import ActivityLog from './components/ActivityLog';
import CAVPanel from './components/CAVPanel';
import RestrictionsPanel from './components/RestrictionsPanel';
import IsisPanel from './components/IsisPanel';

const DEFAULT_FUEL: FuelData = { 
  water: 0, lubOil: 0, fuelOil: 0, jp5: 0,
  maxWater: 570, maxLubOil: 300, maxFuelOil: 3000, maxJp5: 300
};

const DEFAULT_STABILITY: StabilityData = {
  draftForward: 6.5, 
  draftAft: 6.5, 
  heel: 0, 
  gm: 2.3, 
  displacement: 21500
};

const DEFAULT_PERSONNEL: PersonnelData = {
  supervisorMO: '', supervisorEL: '', fielCav: '',
  encarregadoMaquinas: '', auxiliares: ['', '', ''], patrulha: ['', '', '']
};

const THEMES = [
  { id: 'bg-slate-950', label: 'Slate', color: '#0f172a' },
  { id: 'bg-black', label: 'Midnight', color: '#000000' },
  { id: 'bg-blue-950', label: 'Navy', color: '#08142c' },
  { id: 'bg-emerald-950', label: 'Emerald', color: '#061a15' },
  { id: 'bg-neutral-950', label: 'Carbon', color: '#0a0a0a' },
];

const PersonnelView: React.FC<{ 
  data: PersonnelData; 
  onChange: (key: keyof PersonnelData, value: any) => void 
}> = ({ data, onChange }) => {
  const shifts = ["08:00 às 12:00", "12:00 às 16:00", "16:00 às 20:00"];

  const renderField = (label: string, value: string, key: keyof PersonnelData, icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col gap-4">
      <div className="flex items-center gap-3 text-blue-400">
        {icon}
        <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder="NOME DO MILITAR..."
        className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 font-black uppercase text-xs sm:text-sm text-white focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );

  const renderShiftList = (label: string, list: string[], key: 'auxiliares' | 'patrulha', icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3 text-blue-400">
        {icon}
        <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="space-y-4">
        {list.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 ml-1">
              <Clock size={10} className="text-slate-600" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{shifts[idx] || `Turno ${idx + 1}`}</span>
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const newList = [...list];
                newList[idx] = e.target.value;
                onChange(key, newList);
              }}
              placeholder="NOME DO MILITAR..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 font-black uppercase text-xs sm:text-sm text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
      <div className="space-y-6 sm:space-y-8">
        <h3 className="font-black flex items-center gap-4 text-white uppercase text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          Supervisão
        </h3>
        {renderField("Supervisor MO", data.supervisorMO, "supervisorMO", <UserCheck size={18} />)}
        {renderField("Supervisor EL", data.supervisorEL, "supervisorEL", <UserCheck size={18} />)}
        {renderField("Fiel CAV", data.fielCav, "fielCav", <Shield size={18} />)}
        {renderField("Supervisor de Máquinas", data.encarregadoMaquinas, "encarregadoMaquinas", <Activity size={18} />)}
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        <h3 className="font-black flex items-center gap-4 text-white uppercase text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          Escalas de Serviço
        </h3>
        {renderShiftList("Auxiliares de Serviço", data.auxiliares, "auxiliares", <Users size={18} />)}
        {renderShiftList("Patrulhas de Serviço", data.patrulha, "patrulha", <Shield size={18} />)}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData>({});
  const [fuelData, setFuelData] = useState<FuelData>(DEFAULT_FUEL);
  const [stabilityData, setStabilityData] = useState<StabilityData>(DEFAULT_STABILITY);
  const [personnelData, setPersonnelData] = useState<PersonnelData>(DEFAULT_PERSONNEL);
  const [restrictionReasons, setRestrictionReasons] = useState<Record<string, string>>({});
  const [eductorStatuses, setEductorStatuses] = useState<Record<string, boolean>>({});
  const [isisOverrides, setIsisOverrides] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('bg-slate-950');
  const [view, setView] = useState<'menu-inicial' | 'equipment' | 'fuel' | 'stability' | 'personnel' | 'tv-mode' | 'cav' | 'restrictions' | 'isis'>('menu-inicial');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTvSlide, setCurrentTvSlide] = useState(0);

  const NAV_ITEMS = useMemo(() => [
    { id: 'menu-inicial', icon: <LayoutDashboard size={18} />, label: 'Menu inicial' },
    { id: 'equipment', icon: <Activity size={18} />, label: 'Equipamentos' },
    { id: 'restrictions', icon: <ClipboardList size={18} />, label: 'Restrições' },
    { id: 'fuel', icon: <Droplets size={18} />, label: 'Cargas' },
    { id: 'stability', icon: <Compass size={18} />, label: 'Estabilidade' },
    { id: 'cav', icon: <ShieldAlert size={18} />, label: 'CAV' },
    { id: 'isis', icon: <Monitor size={18} />, label: 'ISIS' },
    { id: 'personnel', icon: <Users size={18} />, label: 'Quarto de Serviço' }
  ], []);

  useEffect(() => {
    const saved = localStorage.getItem(`report_${selectedDate}`);
    const masterReasonsStr = localStorage.getItem('master_equipment_reasons');
    const masterReasons = masterReasonsStr ? JSON.parse(masterReasonsStr) : {};
    
    const savedIsisStr = localStorage.getItem('master_isis_overrides');
    const masterIsis = savedIsisStr ? JSON.parse(savedIsisStr) : {};
    
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) setCurrentTheme(savedTheme);

    if (saved) {
      try {
        const data = JSON.parse(saved) as DailyReport;
        setEquipmentData(data.equipment || {});
        setFuelData(data.fuel || DEFAULT_FUEL);
        setStabilityData(data.stability || DEFAULT_STABILITY);
        setPersonnelData(data.personnel || DEFAULT_PERSONNEL);
        setEductorStatuses(data.eductorStatuses || {});
        setLogs(data.logs || []);
        setIsisOverrides(masterIsis);
        const mergedReasons = { ...masterReasons, ...(data.restrictionReasons || {}) };
        setRestrictionReasons(mergedReasons);
      } catch (e) { console.error("Erro ao carregar dados locais"); }
    } else {
      setEquipmentData({});
      setFuelData(DEFAULT_FUEL);
      setStabilityData(DEFAULT_STABILITY);
      setPersonnelData(DEFAULT_PERSONNEL);
      setEductorStatuses({});
      setLogs([]);
      setIsisOverrides(masterIsis);
      setRestrictionReasons(masterReasons);
    }
  }, [selectedDate]);

  const saveData = (updates: Partial<DailyReport>) => {
    const newReport: DailyReport = {
      date: selectedDate,
      equipment: updates.equipment !== undefined ? updates.equipment : equipmentData,
      fuel: updates.fuel !== undefined ? updates.fuel : fuelData,
      stability: updates.stability !== undefined ? updates.stability : stabilityData,
      personnel: updates.personnel !== undefined ? updates.personnel : personnelData,
      restrictionReasons: updates.restrictionReasons !== undefined ? updates.restrictionReasons : restrictionReasons,
      eductorStatuses: updates.eductorStatuses !== undefined ? updates.eductorStatuses : eductorStatuses,
      isisOverrides: updates.isisOverrides !== undefined ? updates.isisOverrides : isisOverrides,
      logs: updates.logs !== undefined ? updates.logs : logs
    };
    
    if (updates.equipment) setEquipmentData(updates.equipment);
    if (updates.fuel) setFuelData(updates.fuel);
    if (updates.stability) setStabilityData(updates.stability);
    if (updates.personnel) setPersonnelData(updates.personnel);
    if (updates.restrictionReasons) setRestrictionReasons(updates.restrictionReasons);
    if (updates.eductorStatuses) setEductorStatuses(updates.eductorStatuses);
    if (updates.isisOverrides) {
      setIsisOverrides(updates.isisOverrides);
      localStorage.setItem('master_isis_overrides', JSON.stringify(updates.isisOverrides));
    }
    if (updates.logs) setLogs(updates.logs);

    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(newReport));
    
    if (updates.restrictionReasons) {
      const masterReasonsStr = localStorage.getItem('master_equipment_reasons');
      const masterReasons = masterReasonsStr ? JSON.parse(masterReasonsStr) : {};
      const newMaster = { ...masterReasons, ...updates.restrictionReasons };
      localStorage.setItem('master_equipment_reasons', JSON.stringify(newMaster));
    }
  };

  const handleStatusChange = (name: string) => {
    const statusOrder = [
      EquipmentStatus.AVAILABLE, 
      EquipmentStatus.IN_LINE, 
      EquipmentStatus.IN_SERVICE, 
      EquipmentStatus.RESTRICTED, 
      EquipmentStatus.UNAVAILABLE
    ];
    const oldStatus = equipmentData[name] || EquipmentStatus.AVAILABLE;
    const nextIdx = (statusOrder.indexOf(oldStatus) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIdx];
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      item: name,
      timestamp: new Date().toISOString(),
      oldStatus,
      newStatus: nextStatus,
      user: 'CENTRO DE COMANDO'
    };
    saveData({ equipment: { ...equipmentData, [name]: nextStatus }, logs: [...logs, newLog] });
  };

  const handleEductorToggle = (id: string) => {
    const newStatuses = { ...eductorStatuses, [id]: !(eductorStatuses[id] !== false) };
    saveData({ eductorStatuses: newStatuses });
  };

  const handleReasonChange = (item: string, reason: string) => {
    const newReasons = { ...restrictionReasons, [item]: reason };
    saveData({ restrictionReasons: newReasons });
  };

  const handleIsisOverride = (channel: string, translation: string) => {
    const newOverrides = { ...isisOverrides, [channel]: translation };
    saveData({ isisOverrides: newOverrides });
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('app_theme', themeId);
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
    setSidebarOpen(false);
  };

  const formattedSelectedDate = useMemo(() => {
    const [year, month, day] = selectedDate.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const currentViewLabel = useMemo(() => {
    return NAV_ITEMS.find(item => item.id === view)?.label || view;
  }, [view, NAV_ITEMS]);

  if (view === 'tv-mode') {
    return (
      <div className={`fixed inset-0 ${currentTheme} text-white flex flex-col overflow-hidden z-[100]`}>
        <div className="bg-slate-900 border-b-4 border-blue-600 p-8 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <img src={SHIP_CONFIG.badgeUrl} className="h-24" alt="Logo" />
            <div>
              <h1 className="text-5xl font-black uppercase">{SHIP_CONFIG.name}</h1>
              <p className="text-xl text-slate-400 font-bold uppercase">{formattedSelectedDate}</p>
            </div>
          </div>
          <button onClick={() => setView('menu-inicial')} className="bg-red-600 px-8 py-4 rounded-xl font-black">SAIR</button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {currentTvSlide === 0 && <StabilityPanel fuelData={fuelData} data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />}
          {currentTvSlide === 1 && <FuelPanel fuel={fuelData} fullWidth onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />}
          {currentTvSlide === 2 && <EquipmentSection categories={CATEGORIES} data={equipmentData} onStatusChange={handleStatusChange} />}
          {currentTvSlide === 3 && <CAVPanel eductorStatuses={eductorStatuses} onStatusToggle={handleEductorToggle} />}
        </div>
        <div className="bg-slate-900 p-6 flex justify-center gap-6">
          {['ESTABILIDADE', 'CARGAS', 'EQUIPAMENTOS', 'CAV'].map((l, i) => (
            <button key={l} onClick={() => setCurrentTvSlide(i)} className={`px-10 py-4 rounded-xl font-black ${currentTvSlide === i ? 'bg-blue-600' : 'bg-slate-800'}`}>{l}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${currentTheme} text-slate-100 selection:bg-blue-600 relative overflow-x-hidden transition-colors duration-700`}>
      {/* Menu Backdrop para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-80 bg-slate-900 border-r border-slate-800 lg:static transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} print:hidden`}>
        <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h2 className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Navegação</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-10">
            <img src={SHIP_CONFIG.badgeUrl} className="w-24" alt="Logo" />
            <h1 className="font-black text-xl mt-4 text-center leading-tight uppercase">{SHIP_CONFIG.name}</h1>
          </div>
          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map(item => (
              <button 
                key={item.id} 
                onClick={() => handleViewChange(item.id as any)} 
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-black uppercase text-[11px] transition-all ${view === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          
          <button onClick={() => setView('tv-mode')} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-black uppercase text-[11px] flex items-center gap-3 justify-center transition-all border border-slate-700">
            <Tv size={18} /> Modo TV
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/40 backdrop-blur-md gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 bg-slate-900 border border-slate-800 rounded-xl text-blue-500 shadow-lg active:scale-95 transition-all"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg sm:text-2xl font-black uppercase text-white truncate">{currentViewLabel}</h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
              <Palette size={14} className="mx-2 text-slate-500" />
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  title={theme.label}
                  className={`w-8 h-8 rounded-xl border-2 transition-all ${currentTheme === theme.id ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: theme.color }}
                />
              ))}
            </div>

            <div className="bg-slate-900 px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 sm:gap-3 border border-slate-800 shadow-inner">
              <Calendar size={14} className="text-blue-500 shrink-0" />
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent font-black text-white text-[10px] sm:text-xs outline-none w-[100px] sm:w-auto" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 space-y-8 sm:space-y-12 custom-scrollbar print:p-0 print:overflow-visible print:h-auto">
          {view === 'menu-inicial' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12">
               <FuelPanel fuel={fuelData} onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />
               <StabilityPanel fuelData={fuelData} data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />
               <StatusCharts data={equipmentData} />
               <ActivityLog logs={logs} />
            </div>
          )}
          {view === 'equipment' && <EquipmentSection categories={CATEGORIES} data={equipmentData} onStatusChange={handleStatusChange} />}
          {view === 'fuel' && <FuelPanel fuel={fuelData} fullWidth onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />}
          {view === 'stability' && <StabilityPanel fuelData={fuelData} data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />}
          {view === 'cav' && <CAVPanel eductorStatuses={eductorStatuses} onStatusToggle={handleEductorToggle} />}
          {view === 'restrictions' && <RestrictionsPanel data={equipmentData} reasons={restrictionReasons} onReasonChange={handleReasonChange} />}
          {view === 'isis' && <IsisPanel overrides={isisOverrides} onOverrideChange={handleIsisOverride} />}
          {view === 'personnel' && <PersonnelView data={personnelData} onChange={(k, v) => saveData({ personnel: { ...personnelData, [k as keyof PersonnelData]: v } })} />}
        </div>
      </main>
    </div>
  );
};

export default App;
