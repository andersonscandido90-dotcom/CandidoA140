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
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { EquipmentStatus, DailyReport, FuelData, EquipmentData, StabilityData, PersonnelData, LogEntry } from './types';
import { CATEGORIES, SHIP_CONFIG, STATUS_CONFIG } from './constants';
import EquipmentSection from './components/EquipmentSection';
import FuelPanel from './components/FuelPanel';
import StabilityPanel from './components/StabilityPanel';
import StatusCharts from './components/StatusCharts';
import ActivityLog from './components/ActivityLog';

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

const TV_SLIDES = [
  { id: 'estabilidade', label: 'Estabilidade', icon: <Compass size={32} /> },
  { id: 'cargas', label: 'Cargas Líquidas', icon: <Droplets size={32} /> },
  { id: 'equipamentos', label: 'Equipamentos', icon: <Activity size={32} /> }
];

const PersonnelView: React.FC<{ 
  data: PersonnelData; 
  onChange: (key: keyof PersonnelData, value: any) => void 
}> = ({ data, onChange }) => {
  const renderField = (label: string, value: string, key: keyof PersonnelData, icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-4">
      <div className="flex items-center gap-3 text-blue-400">
        {icon}
        <span className="font-black text-xs uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder="NOME COMPLETO..."
        className="bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 font-black uppercase text-sm text-white focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );

  const renderList = (label: string, list: string[], key: 'auxiliares' | 'patrulha', icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-6">
      <div className="flex items-center gap-3 text-blue-400">
        {icon}
        <span className="font-black text-xs uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="space-y-3">
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 font-black uppercase text-sm text-white focus:border-blue-500 outline-none transition-all"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <div className="space-y-8">
        <h3 className="font-black flex items-center gap-4 text-white uppercase text-xl lg:text-2xl mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          Supervisão
        </h3>
        {renderField("Supervisor MO", data.supervisorMO, "supervisorMO", <UserCheck size={18} />)}
        {renderField("Supervisor EL", data.supervisorEL, "supervisorEL", <UserCheck size={18} />)}
        {renderField("Fiel CAV", data.fielCav, "fielCav", <Shield size={18} />)}
        {renderField("Encarregado Maquinas", data.encarregadoMaquinas, "encarregadoMaquinas", <Activity size={18} />)}
      </div>
      
      <div className="space-y-8">
        <h3 className="font-black flex items-center gap-4 text-white uppercase text-xl lg:text-2xl mb-6">
          <Users className="w-6 h-6 text-blue-400" />
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [view, setView] = useState<'menu-inicial' | 'equipment' | 'fuel' | 'stability' | 'personnel' | 'tv-mode'>('menu-inicial');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTvSlide, setCurrentTvSlide] = useState(0);
  const [customLogo, setCustomLogo] = useState<string | null>(localStorage.getItem('custom_ship_logo'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`report_${selectedDate}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEquipmentData(data.equipment || {});
        setFuelData(data.fuel || DEFAULT_FUEL);
        setStabilityData(data.stability || DEFAULT_STABILITY);
        setPersonnelData(data.personnel || DEFAULT_PERSONNEL);
        setLogs(data.logs || []);
      } catch (e) { console.error("Erro ao carregar dados locais"); }
    } else {
      setEquipmentData({});
      setFuelData(DEFAULT_FUEL);
      setStabilityData(DEFAULT_STABILITY);
      setPersonnelData(DEFAULT_PERSONNEL);
      setLogs([]);
    }
  }, [selectedDate]);

  const saveData = (updates: Partial<DailyReport>) => {
    const newReport: DailyReport = {
      date: selectedDate,
      equipment: updates.equipment !== undefined ? updates.equipment : equipmentData,
      fuel: updates.fuel !== undefined ? updates.fuel : fuelData,
      stability: updates.stability !== undefined ? updates.stability : stabilityData,
      personnel: updates.personnel !== undefined ? updates.personnel : personnelData,
      logs: updates.logs !== undefined ? updates.logs : logs
    };
    
    if (updates.equipment) setEquipmentData(updates.equipment);
    if (updates.fuel) setFuelData(updates.fuel);
    if (updates.stability) setStabilityData(updates.stability);
    if (updates.personnel) setPersonnelData(updates.personnel);
    if (updates.logs) setLogs(updates.logs);

    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(newReport));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem('custom_ship_logo', base64String);
        setCustomLogo(base64String);
      };
      reader.readAsDataURL(file);
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
    
    // Fix: Corrected variable reference from newStatus to nextStatus in LogEntry object
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

  const nextTvSlide = () => setCurrentTvSlide(prev => (prev + 1) % TV_SLIDES.length);
  const prevTvSlide = () => setCurrentTvSlide(prev => (prev - 1 + TV_SLIDES.length) % TV_SLIDES.length);

  const formattedSelectedDate = useMemo(() => {
    const [year, month, day] = selectedDate.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  if (view === 'tv-mode') {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white flex flex-col overflow-hidden">
        <div className="relative z-50 bg-slate-900 border-b-8 border-blue-600 shadow-2xl">
          <div className="p-10 lg:p-14 flex justify-between items-center">
            <div className="flex items-center gap-12">
              <img src={customLogo || SHIP_CONFIG.badgeUrl} className="h-32 lg:h-48 w-auto" alt="Logo" />
              <div>
                <h1 className="text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-none">{SHIP_CONFIG.name}</h1>
                <div className="flex items-center gap-8 mt-6">
                  <span className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-4xl uppercase shadow-lg">{SHIP_CONFIG.hullNumber}</span>
                  <span className="text-slate-400 font-bold text-3xl uppercase tracking-[0.4em]">{SHIP_CONFIG.designation}</span>
                </div>
              </div>
            </div>
            <div className="text-right bg-slate-950/50 p-8 rounded-[3rem] border border-white/5 shadow-inner">
              <div className="text-3xl font-black text-blue-500 uppercase tracking-[0.3em] mb-4">
                Data do Serviço
              </div>
              <div className="text-6xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none">
                {formattedSelectedDate}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          <button 
            onClick={prevTvSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-10 bg-slate-900/80 hover:bg-blue-600 rounded-full border-4 border-slate-700 transition-all text-white/50 hover:text-white shadow-2xl"
          >
            <ChevronLeft size={80} />
          </button>
          
          <button 
            onClick={nextTvSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-10 bg-slate-900/80 hover:bg-blue-600 rounded-full border-4 border-slate-700 transition-all text-white/50 hover:text-white shadow-2xl"
          >
            <ChevronRight size={80} />
          </button>

          <div className="flex-1 p-10 lg:p-14 overflow-y-auto custom-scrollbar">
            {currentTvSlide === 0 && (
              <div className="h-full space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-7xl font-black uppercase text-blue-400 flex items-center gap-6">
                  <Compass size={60} /> Estabilidade e Calados
                </h2>
                <StabilityPanel data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />
              </div>
            )}

            {currentTvSlide === 1 && (
              <div className="h-full space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-7xl font-black uppercase text-blue-400 flex items-center gap-6">
                  <Droplets size={60} /> Cargas Líquidas
                </h2>
                <FuelPanel fuel={fuelData} fullWidth onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />
              </div>
            )}

            {currentTvSlide === 2 && (
              <div className="h-full space-y-10 pb-20 animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-7xl font-black uppercase text-blue-400 flex items-center gap-6">
                  <Activity size={60} /> Status de Equipamentos
                </h2>
                <EquipmentSection 
                  categories={CATEGORIES} 
                  data={equipmentData} 
                  onStatusChange={handleStatusChange} 
                />
              </div>
            )}
          </div>

          <div className="bg-slate-900 border-t-8 border-slate-800 p-8 flex justify-center gap-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            {TV_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentTvSlide(index)}
                className={`flex items-center gap-6 px-14 py-8 rounded-[3rem] font-black uppercase text-2xl transition-all border-4 ${currentTvSlide === index ? 'bg-blue-600 border-white text-white shadow-[0_0_40px_rgba(37,99,235,0.6)] scale-110' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                {slide.icon}
                {slide.label}
              </button>
            ))}
            <div className="w-px h-16 bg-slate-800 mx-6 self-center" />
            <button 
              onClick={() => setView('menu-inicial')}
              className="px-14 py-8 bg-red-600/20 hover:bg-red-600 border-4 border-red-600/50 rounded-[3rem] text-red-500 hover:text-white text-2xl font-black uppercase flex items-center gap-6 transition-all"
            >
              <Monitor size={48} /> SAIR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-blue-600">
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="lg:hidden fixed bottom-6 right-6 z-[60] p-5 bg-blue-600 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.6)] active:scale-90 transition-transform"
      >
        {sidebarOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-80 bg-slate-900 border-r border-slate-800 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 lg:p-8 flex flex-col h-full">
          <div className="flex flex-col items-center mb-10 group">
            <div 
              className="relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Clique para alterar o brasão"
            >
              <img 
                src={customLogo || SHIP_CONFIG.badgeUrl} 
                className="w-24 lg:w-28 h-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:brightness-125" 
                alt="Logo" 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600/80 p-2 rounded-full">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              className="hidden" 
              accept="image/*" 
            />
            
            <h1 className="font-black text-xl lg:text-2xl mt-5 text-center leading-tight tracking-tighter">{SHIP_CONFIG.name}</h1>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-2 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">{SHIP_CONFIG.hullNumber}</span>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'menu-inicial', icon: <LayoutDashboard size={20} />, label: 'Menu inicial' },
              { id: 'equipment', icon: <Activity size={20} />, label: 'Equipamentos' },
              { id: 'fuel', icon: <Droplets size={20} />, label: 'Cargas' },
              { id: 'stability', icon: <Compass size={20} />, label: 'Estabilidade' },
              { id: 'personnel', icon: <Users size={20} />, label: 'Quadro' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => { setView(item.id as any); setSidebarOpen(false); }} 
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-xs transition-all ${view === item.id ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)]' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button 
                onClick={() => { setView('tv-mode'); setSidebarOpen(false); }} 
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-xs bg-slate-950 text-blue-400 border border-blue-900/30 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
              >
                <Tv size={20} /> Modo TV (Totem)
              </button>
            </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="px-5 lg:px-12 py-5 lg:py-8 border-b border-slate-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-md z-30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-8 w-full sm:w-auto">
            <h2 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-sm">
              {view === 'menu-inicial' ? 'Menu Inicial' : 
               view === 'equipment' ? 'Equipamentos' : 
               view === 'fuel' ? 'Cargas Líquidas' : 
               view === 'stability' ? 'Estabilidade' : 
               view === 'personnel' ? 'Quadro de Serviço' : ''}
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="bg-slate-900 border border-slate-800 px-3 lg:px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
                <Calendar size={18} className="text-blue-500" />
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)} 
                  className="bg-transparent font-black outline-none text-white text-sm lg:text-base cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 space-y-8 lg:space-y-12 pb-32 lg:pb-12 scroll-smooth custom-scrollbar">
          {view === 'menu-inicial' && (
            <div className="animate-in fade-in duration-500 space-y-12">
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
                  <FuelPanel fuel={fuelData} onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />
                  <StabilityPanel data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 min-h-[500px]">
                  <StatusCharts data={equipmentData} />
                  <ActivityLog logs={logs} />
               </div>
            </div>
          )}

          {view === 'equipment' && (
            <EquipmentSection 
              categories={CATEGORIES} 
              data={equipmentData} 
              onStatusChange={handleStatusChange} 
            />
          )}

          {view === 'fuel' && (
            <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
              <FuelPanel fuel={fuelData} fullWidth onChange={(k, v) => saveData({ fuel: {...fuelData, [k]: v}})} />
            </div>
          )}

          {view === 'stability' && (
            <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
              <StabilityPanel data={stabilityData} onChange={(k, v) => saveData({ stability: {...stabilityData, [k]: v}})} />
            </div>
          )}

          {view === 'personnel' && (
            <PersonnelView 
              data={personnelData} 
              onChange={(k, v) => saveData({ personnel: { ...personnelData, [k as keyof PersonnelData]: v } })} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;