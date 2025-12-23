
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
  AlertTriangle,
  Camera,
  Tv,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ClipboardList
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

const DEFAULT_FUEL: FuelData = { 
  water: 0, lubOil: 0, fuelOil: 0, jp5: 0,
  maxWater: 570, maxLubOil: 300, maxFuelOil: 3000, maxJp5: 300
};

const DEFAULT_STABILITY: StabilityData = {
  draftForward: 0, draftAft: 0, heel: 0, gm: 0, displacement: 0
};

const DEFAULT_PERSONNEL: PersonnelData = {
  supervisorMO: '', supervisorEL: '', fielCav: '',
  encarregadoMaquinas: '', auxiliares: ['', '', ''], patrulha: ['', '', '']
};

const PersonnelView: React.FC<{ 
  data: PersonnelData; 
  onChange: (key: keyof PersonnelData, value: any) => void 
}> = ({ data, onChange }) => {
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
        placeholder="NOME COMPLETO..."
        className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 font-black uppercase text-xs sm:text-sm text-white focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );

  const renderList = (label: string, list: string[], key: 'auxiliares' | 'patrulha', icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3 text-blue-400">
        {icon}
        <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {list.map((item, idx) => (
          <input
            key={idx}
            type="text"
            value={item}
            onChange={(e) => {
              const newList = [...list];
              newList[idx] = e.target.value;
              onChange(key, newList);
            }}
            placeholder={`${label.split(' ')[0]} ${idx + 1}...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 font-black uppercase text-xs sm:text-sm text-white focus:border-blue-500 outline-none transition-all"
          />
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
        {renderField("Encarregado Maquinas", data.encarregadoMaquinas, "encarregadoMaquinas", <Activity size={18} />)}
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        <h3 className="font-black flex items-center gap-4 text-white uppercase text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          Equipe de Serviço
        </h3>
        {renderList("Auxiliares", data.auxiliares, "auxiliares", <Users size={18} />)}
        {renderList("Patrulha", data.patrulha, "patrulha", <Users size={18} />)}
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [view, setView] = useState<'menu-inicial' | 'equipment' | 'fuel' | 'stability' | 'personnel' | 'tv-mode' | 'cav' | 'restrictions'>('menu-inicial');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTvSlide, setCurrentTvSlide] = useState(0);
  const [customLogo, setCustomLogo] = useState<string | null>(localStorage.getItem('custom_ship_logo'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados e sincronizar com o "Master de Motivos"
  useEffect(() => {
    const saved = localStorage.getItem(`report_${selectedDate}`);
    const masterReasonsStr = localStorage.getItem('master_equipment_reasons');
    const masterReasons = masterReasonsStr ? JSON.parse(masterReasonsStr) : {};

    if (saved) {
      try {
        const data = JSON.parse(saved) as DailyReport;
        setEquipmentData(data.equipment || {});
        setFuelData(data.fuel || DEFAULT_FUEL);
        setStabilityData(data.stability || DEFAULT_STABILITY);
        setPersonnelData(data.personnel || DEFAULT_PERSONNEL);
        setEductorStatuses(data.eductorStatuses || {});
        setLogs(data.logs || []);
        
        // Mesclar motivos do dia com o master para garantir persistência histórica
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
      // Ao iniciar um dia novo, puxamos os motivos master para equipamentos que ainda estão inoperantes/restritos
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
      logs: updates.logs !== undefined ? updates.logs : logs
    };
    
    if (updates.equipment) setEquipmentData(updates.equipment);
    if (updates.fuel) setFuelData(updates.fuel);
    if (updates.stability) setStabilityData(updates.stability);
    if (updates.personnel) setPersonnelData(updates.personnel);
    if (updates.restrictionReasons) setRestrictionReasons(updates.restrictionReasons);
    if (updates.eductorStatuses) setEductorStatuses(updates.eductorStatuses);
    if (updates.logs) setLogs(updates.logs);

    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(newReport));
    
    // Se houve atualização de motivos, salvar no master global para persistência cross-date
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

    saveData({ 
      equipment: { ...equipmentData, [name]: nextStatus },
      logs: [...logs, newLog]
    });
  };

  const handleEductorToggle = (id: string) => {
    const newStatuses = { ...eductorStatuses, [id]: !(eductorStatuses[id] !== false) };
    saveData({ eductorStatuses: newStatuses });
  };

  const handleReasonChange = (item: string, reason: string) => {
    const newReasons = { ...restrictionReasons, [item]: reason };
    saveData({ restrictionReasons: newReasons });
  };

  const formattedSelectedDate = useMemo(() => {
    const [year, month, day] = selectedDate.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const tvSlides = [
    { id: 'estabilidade', label: 'Estabilidade', icon: <Compass size={32} /> },
    { id: 'cargas', label: 'Cargas Líquidas', icon: <Droplets size={32} /> },
    { id: 'equipamentos', label: 'Equipamentos', icon: <Activity size={32} /> },
    { id: 'cav', label: 'CAV', icon: <ShieldAlert size={32} /> }
  ];

  if (view === 'tv-mode') {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white flex flex-col overflow-hidden z-[100]">
        <div className="relative z-50 bg-slate-900 border-b-4 border-blue-600 shadow-2xl">
          <div className="p-4 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 sm:gap-12">
              <img src={customLogo || SHIP_CONFIG.badgeUrl} className="h-16 sm:h-32 w-auto" alt="Logo" />
              <div>
                <h1 className="text-2xl sm:text-6xl font-black tracking-tighter uppercase leading-none">{SHIP_CONFIG.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black text-xs sm:text-2xl uppercase">{SHIP_CONFIG.hullNumber}</span>
                  <span className="text-slate-400 font-bold text-[10px] sm:text-lg uppercase tracking-widest">{SHIP_CONFIG.designation}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-4xl font-black text-white uppercase">{formattedSelectedDate}</div>
            </div>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden p-4 sm:p-10 overflow-y-auto custom-scrollbar">
            {currentTvSlide === 0 && <StabilityPanel fuelData={fuelData} data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />}
            {currentTvSlide === 1 && <FuelPanel fuel={fuelData} fullWidth onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />}
            {currentTvSlide === 2 && <EquipmentSection categories={CATEGORIES} data={equipmentData} onStatusChange={handleStatusChange} />}
            {currentTvSlide === 3 && <CAVPanel eductorStatuses={eductorStatuses} onStatusToggle={handleEductorToggle} />}
        </div>
        <div className="bg-slate-900 border-t-4 border-slate-800 p-4 flex justify-center gap-4">
          {tvSlides.map((slide, index) => (
            <button key={slide.id} onClick={() => setCurrentTvSlide(index)} className={`px-6 py-4 rounded-xl font-black uppercase text-xs transition-all border-2 ${currentTvSlide === index ? 'bg-blue-600 border-white text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
              {slide.label}
            </button>
          ))}
          <button onClick={() => setView('menu-inicial')} className="px-6 py-4 bg-red-600/20 hover:bg-red-600 border-2 border-red-600/50 rounded-xl text-red-500 hover:text-white text-xs font-black uppercase transition-all">SAIR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-blue-600 relative overflow-x-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-[60] p-5 bg-blue-600 rounded-full shadow-2xl">
        {sidebarOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-80 bg-slate-900 border-r border-slate-800 transition-transform duration-500 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 lg:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center mb-10">
            <img src={customLogo || SHIP_CONFIG.badgeUrl} className="w-20 lg:w-28 h-auto" alt="Logo" />
            <h1 className="font-black text-lg lg:text-2xl mt-5 text-center leading-tight tracking-tighter uppercase">{SHIP_CONFIG.name}</h1>
          </div>
          <nav className="flex-1 space-y-1.5">
            {[
              { id: 'menu-inicial', icon: <LayoutDashboard size={18} />, label: 'Menu inicial' },
              { id: 'equipment', icon: <Activity size={18} />, label: 'Equipamentos' },
              { id: 'restrictions', icon: <ClipboardList size={18} />, label: 'Restrições' },
              { id: 'fuel', icon: <Droplets size={18} />, label: 'Cargas' },
              { id: 'stability', icon: <Compass size={18} />, label: 'Estabilidade' },
              { id: 'cav', icon: <ShieldAlert size={18} />, label: 'CAV' },
              { id: 'personnel', icon: <Users size={18} />, label: 'Quarto de Serviço' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => { setView(item.id as any); setSidebarOpen(false); }} 
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-black uppercase text-[11px] transition-all ${view === item.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={() => setView('tv-mode')} className="w-full mt-4 flex items-center gap-4 px-5 py-3.5 rounded-xl font-black uppercase text-[11px] bg-slate-950 text-blue-400 border border-blue-900/30">
              <Tv size={18} /> Modo TV
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="px-6 py-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/80 backdrop-blur-md z-30">
          <h2 className="text-xl lg:text-3xl font-black uppercase text-white">
            {view === 'personnel' ? 'Quarto de Serviço' : 
             view === 'restrictions' ? 'Restrições e Indisponíveis' : 
             view.replace('-', ' ')}
          </h2>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner">
            <Calendar size={16} className="text-blue-500" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent font-black text-white text-xs outline-none" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-12 custom-scrollbar">
          {view === 'menu-inicial' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
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
          {view === 'personnel' && <PersonnelView data={personnelData} onChange={(k, v) => saveData({ personnel: { ...personnelData, [k as keyof PersonnelData]: v } })} />}
        </div>
      </main>
    </div>
  );
};

export default App;
