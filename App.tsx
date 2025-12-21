
import React, { useState, useEffect, memo, useRef } from 'react';
import { 
  Activity, 
  Droplets, 
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
  Compass,
  Upload,
  Users,
  Shield,
  Wrench,
  UserCheck,
  Palette
} from 'lucide-react';
import { EquipmentStatus, DailyReport, FuelData, EquipmentData, StabilityData, PersonnelData } from './types';
import { CATEGORIES, STATUS_CONFIG, SHIP_CONFIG } from './constants';
import EquipmentSection from './components/EquipmentSection';
import FuelPanel from './components/FuelPanel';
import StatusCharts from './components/StatusCharts';
import StabilityPanel from './components/StabilityPanel';

type Theme = 'dark' | 'navy' | 'light';

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
  draftForward: 0,
  draftAft: 0,
  heel: 0,
  gm: 0,
  displacement: 0
};

const DEFAULT_PERSONNEL: PersonnelData = {
  supervisorMO: '',
  supervisorEL: '',
  fielCav: '',
  fielAuxiliares: ['', '', ''],
  patrulhaCav: ['', '', '']
};

const ShipLogo = memo(({ className = "w-24 h-auto", customUrl }: { className?: string, customUrl?: string | null }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img 
      src={customUrl || SHIP_CONFIG.badgeUrl} 
      alt="Logo do Navio" 
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

interface PersonnelFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  theme: Theme;
  uiMode?: UIMode;
}

const PersonnelField: React.FC<PersonnelFieldProps> = ({ icon, label, value, onChange, theme, uiMode = 'desktop' }) => {
  const isLight = theme === 'light';
  const isTv = uiMode === 'tv';
  
  return (
    <div className={`${isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-800/30 border-slate-700/40 shadow-inner'} border rounded-2xl ${isTv ? 'p-10' : 'p-4 lg:p-5'} transition-all hover:border-blue-500/50 group`}>
      <div className={`flex items-center gap-3 ${isTv ? 'mb-6' : 'mb-3'}`}>
        <div className={`${isLight ? 'bg-slate-100 text-blue-600 border-slate-200' : 'bg-slate-900 text-blue-400 border-slate-800'} ${isTv ? 'p-5 rounded-2xl' : 'p-2 rounded-xl'} group-hover:text-white group-hover:bg-blue-600 transition-colors border`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: isTv ? 40 : 18 }) : icon}
        </div>
        <span className={`${isTv ? 'text-2xl' : 'text-[10px]'} font-black uppercase tracking-widest leading-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
      </div>
      <input 
        type="text" 
        placeholder="NOME / GRAD"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300' : 'bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-700'} ${isTv ? 'px-8 py-6 text-4xl' : 'px-4 py-3 text-sm font-bold'} placeholder:text-[10px]`}
      />
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'special';
  theme: Theme;
}

const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick, variant = 'default', theme }) => {
  const isLight = theme === 'light';
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${
      active 
        ? (variant === 'special' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20') 
        : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-500 hover:bg-slate-800')
    }`}>
      {icon} <span className="text-sm uppercase tracking-wider">{label}</span>
    </button>
  );
};

type UIMode = 'desktop' | 'tv' | 'tablet' | 'phone';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('app_theme') as Theme) || 'dark');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData>({});
  const [fuelData, setFuelData] = useState<FuelData>(DEFAULT_FUEL);
  const [stabilityData, setStabilityData] = useState<StabilityData>(DEFAULT_STABILITY);
  const [personnelData, setPersonnelData] = useState<PersonnelData>(DEFAULT_PERSONNEL);
  const [customLogo, setCustomLogo] = useState<string | null>(localStorage.getItem('custom_ship_logo'));
  const [view, setView] = useState<'dashboard' | 'equipment' | 'fuel' | 'stability' | 'tv' | 'tablet' | 'smartphone'>('dashboard');
  const [kioskTab, setKioskTab] = useState<'dashboard' | 'systems' | 'fuel' | 'stability'>('dashboard');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem(`report_${selectedDate}`);
    if (saved) {
      const parsed: DailyReport = JSON.parse(saved);
      setEquipmentData(parsed.equipment || {});
      setFuelData({ ...DEFAULT_FUEL, ...(parsed.fuel || {}) });
      setStabilityData({ ...DEFAULT_STABILITY, ...(parsed.stability || {}) });
      setPersonnelData({ ...DEFAULT_PERSONNEL, ...(parsed.personnel || {}) });
    } else {
      setEquipmentData({});
      setFuelData(DEFAULT_FUEL);
      setStabilityData(DEFAULT_STABILITY);
      setPersonnelData(DEFAULT_PERSONNEL);
    }
  }, [selectedDate]);

  const saveCurrentData = (
    newEquip?: EquipmentData, 
    newFuel?: FuelData, 
    newStability?: StabilityData,
    newPersonnel?: PersonnelData
  ) => {
    const report: DailyReport = {
      date: selectedDate,
      equipment: newEquip || equipmentData,
      fuel: newFuel || fuelData,
      stability: newStability || stabilityData,
      personnel: newPersonnel || personnelData
    };
    localStorage.setItem(`report_${selectedDate}`, JSON.stringify(report));
    if (newEquip) setEquipmentData(newEquip);
    if (newFuel) setFuelData(newFuel);
    if (newStability) setStabilityData(newStability);
    if (newPersonnel) setPersonnelData(newPersonnel);
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
    saveCurrentData({ ...equipmentData, [name]: nextStatus });
  };

  const handleFuelChange = (key: keyof FuelData, val: number) => {
    saveCurrentData(undefined, { ...fuelData, [key]: val });
  };

  const handleStabilityChange = (key: keyof StabilityData, val: number) => {
    saveCurrentData(undefined, undefined, { ...stabilityData, [key]: val });
  };

  const handlePersonnelChange = (key: keyof PersonnelData, val: any) => {
    saveCurrentData(undefined, undefined, undefined, { ...personnelData, [key]: val });
  };

  const isKioskMode = view === 'tv' || view === 'tablet' || view === 'smartphone';
  const currentUIMode: UIMode = 
    view === 'tv' ? 'tv' : 
    view === 'tablet' ? 'tablet' : 
    view === 'smartphone' ? 'phone' : 'desktop';

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getThemeClasses = () => {
    switch(theme) {
      case 'navy': return 'bg-blue-950 text-white';
      case 'light': return 'bg-slate-50 text-slate-900';
      default: return 'bg-slate-950 text-white';
    }
  };

  const ThemeSelector = ({ vertical = false }: { vertical?: boolean }) => (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-4 bg-black/20 p-3 rounded-2xl border border-white/5`}>
      <button onClick={() => setTheme('dark')} className={`w-8 h-8 rounded-full bg-slate-900 border-2 ${theme === 'dark' ? 'border-blue-500 scale-110' : 'border-transparent opacity-50'} transition-all`} title="Preto (Midnight)"></button>
      <button onClick={() => setTheme('navy')} className={`w-8 h-8 rounded-full bg-blue-900 border-2 ${theme === 'navy' ? 'border-blue-500 scale-110' : 'border-transparent opacity-50'} transition-all`} title="Azul (Ocean)"></button>
      <button onClick={() => setTheme('light')} className={`w-8 h-8 rounded-full bg-white border-2 ${theme === 'light' ? 'border-blue-500 scale-110' : 'border-slate-300 opacity-50'} transition-all`} title="Branco (Command)"></button>
    </div>
  );

  const renderPersonnelSection = (mode: UIMode) => {
    const isTv = mode === 'tv';
    return (
      <section className={`${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'} border rounded-[3rem] ${isTv ? 'p-16' : 'p-8 lg:p-12'} shadow-2xl transition-colors duration-500`}>
        <div className={`flex items-center gap-6 mb-10 border-b pb-8 ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
          <div className={`${isTv ? 'p-8' : 'p-4'} bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/20`}><Users className={`${isTv ? 'w-16 h-16' : 'w-8 h-8'} text-white`} /></div>
          <h3 className={`${isTv ? 'text-7xl' : 'text-4xl'} font-black uppercase tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Tabela e Quarto de Serviço</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          <PersonnelField uiMode={mode} icon={<Shield />} label="Supervisor MO" value={personnelData.supervisorMO} onChange={(v) => handlePersonnelChange('supervisorMO', v)} theme={theme} />
          <PersonnelField uiMode={mode} icon={<Shield />} label="Supervisor EL" value={personnelData.supervisorEL} onChange={(v) => handlePersonnelChange('supervisorEL', v)} theme={theme} />
          <PersonnelField uiMode={mode} icon={<UserCheck />} label="Fiel de Cav" value={personnelData.fielCav} onChange={(v) => handlePersonnelChange('fielCav', v)} theme={theme} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className={`${isTv ? 'text-2xl mb-8' : 'text-[10px] mb-4'} font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Fiel das Auxiliares (3 Militares)</p>
            <div className={`grid grid-cols-1 ${isTv ? 'gap-8' : 'md:grid-cols-3 gap-4'}`}>
              {[0,1,2].map(i => (
                <PersonnelField uiMode={mode} key={i} icon={<Wrench />} label={`Fiel Auxiliar ${i+1}`} value={personnelData.fielAuxiliares[i]} onChange={(v) => {
                  const copy = [...personnelData.fielAuxiliares];
                  copy[i] = v;
                  handlePersonnelChange('fielAuxiliares', copy);
                }} theme={theme} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className={`${isTv ? 'text-2xl mb-8' : 'text-[10px] mb-4'} font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Patrulha do Cav (3 Militares)</p>
            <div className={`grid grid-cols-1 ${isTv ? 'gap-8' : 'md:grid-cols-3 gap-4'}`}>
              {[0,1,2].map(i => (
                <PersonnelField uiMode={mode} key={i} icon={<Activity />} label={`Patrulha ${i+1}`} value={personnelData.patrulhaCav[i]} onChange={(v) => {
                  const copy = [...personnelData.patrulhaCav];
                  copy[i] = v;
                  handlePersonnelChange('patrulhaCav', copy);
                }} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${getThemeClasses()} overflow-hidden transition-colors duration-500`}>
      
      {/* INTERFACE NORMAL DO APP (DESKTOP) */}
      {!isKioskMode ? (
        <>
          <aside className={`w-80 ${theme === 'light' ? 'bg-white border-slate-200' : (theme === 'navy' ? 'bg-blue-900 border-blue-800' : 'bg-slate-900 border-slate-800')} border-r flex flex-col p-8 hidden lg:flex transition-colors duration-500`}>
            <div className="flex flex-col items-center gap-6 mb-12">
              <button onClick={() => fileInputRef.current?.click()} className="group relative">
                <ShipLogo className="w-32 h-auto" customUrl={customLogo} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center"><Upload className="text-white" /></div>
              </button>
              <div className="text-center">
                <h1 className={`font-black text-2xl ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{SHIP_CONFIG.name}</h1>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-2">ATAQUE CONTÍNUO E AGRESSIVO</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={24} />} label="Dashboard" onClick={() => setView('dashboard')} theme={theme} />
              <NavItem active={view === 'equipment'} icon={<Activity size={24} />} label="Equipamentos" onClick={() => setView('equipment')} theme={theme} />
              <NavItem active={view === 'fuel'} icon={<Droplets size={24} />} label="Carga Líquida" onClick={() => setView('fuel')} theme={theme} />
              <NavItem active={view === 'stability'} icon={<Compass size={24} />} label="Estabilidade" onClick={() => setView('stability')} theme={theme} />
              
              <div className="pt-8 space-y-4">
                 <p className={`text-[10px] font-black uppercase tracking-widest px-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Visualização Tática</p>
                 <NavItem active={false} icon={<Monitor size={24} />} label="Modo TV" variant="special" onClick={() => setView('tv')} theme={theme} />
                 <NavItem active={false} icon={<Tablet size={24} />} label="Modo Tablet" variant="special" onClick={() => setView('tablet')} theme={theme} />
                 <NavItem active={false} icon={<Smartphone size={24} />} label="Modo Celular" variant="special" onClick={() => setView('smartphone')} theme={theme} />
              </div>
            </nav>

            <div className="mt-auto space-y-4">
              <div className="px-4">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Esquema de Cores</p>
                <ThemeSelector />
              </div>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto max-h-screen">
            <header className={`p-8 lg:p-12 ${theme === 'light' ? 'bg-white/80 border-slate-200 text-slate-900' : 'bg-slate-900/40 border-slate-800 text-white'} border-b flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl transition-all duration-500`}>
               <div className="flex items-center gap-8">
                 <ShipLogo className="w-20 hidden md:block" customUrl={customLogo} />
                 <div>
                   <h2 className={`text-4xl lg:text-5xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{SHIP_CONFIG.name}</h2>
                   <div className="flex items-center gap-4 mt-2">
                     <Calendar className="text-blue-500" size={20} />
                     <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`px-4 py-1 rounded-lg font-bold border transition-all ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-500' : 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500'}`} />
                   </div>
                 </div>
               </div>
            </header>

            <div className="p-8 lg:p-12 space-y-12">
              {view === 'dashboard' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                  {renderPersonnelSection('desktop')}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <FuelPanel fuel={fuelData} onChange={handleFuelChange} uiMode="desktop" />
                    <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode="desktop" />
                  </div>
                </div>
              )}

              {view === 'equipment' && CATEGORIES.map(cat => <EquipmentSection key={cat.name} category={cat} data={equipmentData} onStatusChange={handleStatusChange} uiMode="desktop" />)}
              {view === 'fuel' && <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth uiMode="desktop" />}
              {view === 'stability' && <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode="desktop" />}
            </div>
          </main>
        </>
      ) : (
        /* MODO KIOSK (TV, TABLET, SMARTPHONE) */
        <div className={`fixed inset-0 ${getThemeClasses()} overflow-hidden flex flex-col transition-colors duration-500`}>
          <header className={`flex flex-col gap-6 ${currentUIMode === 'tv' ? 'p-16' : currentUIMode === 'tablet' ? 'p-10' : 'p-6'} ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/50 border-slate-800'} border-b-4 backdrop-blur-md`}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6 lg:gap-12">
                <ShipLogo className={currentUIMode === 'tv' ? 'w-56' : currentUIMode === 'tablet' ? 'w-32' : 'w-20'} customUrl={customLogo} />
                <div>
                  <h1 className={`${currentUIMode === 'tv' ? 'text-9xl' : currentUIMode === 'tablet' ? 'text-6xl' : 'text-3xl'} font-black tracking-tighter leading-none`}>
                    {SHIP_CONFIG.name} <span className="text-blue-500">{SHIP_CONFIG.hullNumber}</span>
                  </h1>
                  <div className="flex flex-col">
                    <p className="text-blue-400 font-black uppercase tracking-[0.2em] mt-4">ATAQUE CONTÍNUO E AGRESSIVO</p>
                    <div className={`flex items-center gap-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} font-black font-mono ${currentUIMode === 'tv' ? 'text-6xl mt-8' : currentUIMode === 'tablet' ? 'text-3xl mt-4' : 'text-sm mt-2'}`}>
                      <Calendar className={currentUIMode === 'tv' ? 'w-20 h-20' : currentUIMode === 'tablet' ? 'w-10 h-10' : 'w-5 h-5'} /> {formatDisplayDate(selectedDate)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <ThemeSelector />
                <button onClick={() => setView('dashboard')} className="p-6 rounded-[2rem] bg-red-600/10 border-2 border-red-600/30 text-red-500 font-black flex items-center gap-4 hover:bg-red-600/20 transition-all">
                  <Minimize2 className={currentUIMode === 'tv' ? 'w-20 h-20' : currentUIMode === 'tablet' ? 'w-10 h-10' : 'w-5 h-5'} /> SAIR
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setKioskTab('dashboard')} className={`flex-1 min-w-[120px] ${currentUIMode === 'tv' ? 'text-5xl py-12' : currentUIMode === 'tablet' ? 'text-2xl py-6' : 'text-sm py-4'} rounded-[3rem] border-2 font-black uppercase transition-all ${kioskTab === 'dashboard' ? 'bg-indigo-600 border-indigo-400 text-white' : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500')}`}>Serviço</button>
              <button onClick={() => setKioskTab('systems')} className={`flex-1 min-w-[120px] ${currentUIMode === 'tv' ? 'text-5xl py-12' : currentUIMode === 'tablet' ? 'text-2xl py-6' : 'text-sm py-4'} rounded-[3rem] border-2 font-black uppercase transition-all ${kioskTab === 'systems' ? 'bg-blue-600 border-blue-400 text-white' : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500')}`}>Equipamentos</button>
              <button onClick={() => setKioskTab('fuel')} className={`flex-1 min-w-[120px] ${currentUIMode === 'tv' ? 'text-5xl py-12' : currentUIMode === 'tablet' ? 'text-2xl py-6' : 'text-sm py-4'} rounded-[3rem] border-2 font-black uppercase transition-all ${kioskTab === 'fuel' ? 'bg-blue-600 border-blue-400 text-white' : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500')}`}>Cargas</button>
              <button onClick={() => setKioskTab('stability')} className={`flex-1 min-w-[120px] ${currentUIMode === 'tv' ? 'text-5xl py-12' : currentUIMode === 'tablet' ? 'text-2xl py-6' : 'text-sm py-4'} rounded-[3rem] border-2 font-black uppercase transition-all ${kioskTab === 'stability' ? 'bg-blue-600 border-blue-400 text-white' : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500')}`}>Estabilidade</button>
            </div>
          </header>

          <div className={`flex-1 overflow-y-auto ${currentUIMode === 'tv' ? 'p-20' : 'p-6 md:p-12'}`}>
            {kioskTab === 'dashboard' && renderPersonnelSection(currentUIMode)}
            {kioskTab === 'systems' && (
              <div className="space-y-12">
                {CATEGORIES.map(cat => <EquipmentSection key={cat.name} category={cat} data={equipmentData} onStatusChange={handleStatusChange} uiMode={currentUIMode} />)}
              </div>
            )}
            {kioskTab === 'fuel' && <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth uiMode={currentUIMode} />}
            {kioskTab === 'stability' && <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode={currentUIMode} />}
          </div>
        </div>
      )}

      {/* INPUTS ESCONDIDOS */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setCustomLogo(base64);
            localStorage.setItem('custom_ship_logo', base64);
          };
          reader.readAsDataURL(file);
        }
      }} />
    </div>
  );
};

export default App;
