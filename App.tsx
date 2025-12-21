
import React, { useState, useEffect, memo, useRef } from 'react';
import { 
  Activity, 
  Droplets, 
  LayoutDashboard,
  Calendar,
  Monitor,
  Minimize2,
  Smartphone,
  Tablet,
  Compass,
  Upload,
  Users,
  Shield,
  Wrench,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import { EquipmentStatus, DailyReport, FuelData, EquipmentData, StabilityData, PersonnelData } from './types';
import { CATEGORIES, STATUS_CONFIG, SHIP_CONFIG } from './constants';
import EquipmentSection from './components/EquipmentSection';
import FuelPanel from './components/FuelPanel';
import StabilityPanel from './components/StabilityPanel';

type Theme = 'dark' | 'navy' | 'light';
type UIMode = 'desktop' | 'tv' | 'tablet' | 'phone';

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
  const isPhone = uiMode === 'phone';
  
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

const NavItem: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void; theme: Theme; variant?: 'default' | 'special' }> = ({ active, icon, label, onClick, theme, variant = 'default' }) => {
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

// @fix: Added missing ThemeSelector component to resolve "Cannot find name 'ThemeSelector'" error
const ThemeSelector: React.FC<{ current: Theme; onSelect: (t: Theme) => void; theme: Theme }> = ({ current, onSelect, theme }) => {
  const isLight = theme === 'light';
  return (
    <div className={`flex p-1 rounded-2xl border transition-all ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
      {(['dark', 'navy', 'light'] as Theme[]).map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            current === t 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const saveCurrentData = (newEquip?: EquipmentData, newFuel?: FuelData, newStability?: StabilityData, newPersonnel?: PersonnelData) => {
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
    const statusOrder = [EquipmentStatus.AVAILABLE, EquipmentStatus.IN_LINE, EquipmentStatus.IN_SERVICE, EquipmentStatus.RESTRICTED, EquipmentStatus.UNAVAILABLE];
    const currentStatus = equipmentData[name] || EquipmentStatus.AVAILABLE;
    const nextIdx = (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
    saveCurrentData({ ...equipmentData, [name]: statusOrder[nextIdx] });
  };

  const handleFuelChange = (key: keyof FuelData, val: number) => saveCurrentData(undefined, { ...fuelData, [key]: val });
  const handleStabilityChange = (key: keyof StabilityData, val: number) => saveCurrentData(undefined, undefined, { ...stabilityData, [key]: val });
  const handlePersonnelChange = (key: keyof PersonnelData, val: any) => saveCurrentData(undefined, undefined, undefined, { ...personnelData, [key]: val });

  const isKioskMode = view === 'tv' || view === 'tablet' || view === 'smartphone';
  const currentUIMode: UIMode = isKioskMode ? (view === 'tv' ? 'tv' : view === 'tablet' ? 'tablet' : 'phone') : (isMobile ? 'phone' : 'desktop');

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

  const renderPersonnelSection = (mode: UIMode) => {
    const isTv = mode === 'tv';
    return (
      <section className={`${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'} border rounded-[2rem] md:rounded-[3rem] ${isTv ? 'p-16' : 'p-6 lg:p-12'} shadow-2xl transition-colors duration-500`}>
        <div className={`flex items-center gap-6 mb-10 border-b pb-8 ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
          <div className={`${isTv ? 'p-8' : 'p-3 md:p-4'} bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/20`}><Users className={`${isTv ? 'w-16 h-16' : 'w-6 h-6 md:w-8 h-8'} text-white`} /></div>
          <h3 className={`${isTv ? 'text-7xl' : 'text-2xl md:text-4xl'} font-black uppercase tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Tabela de Serviço</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-8">
          <PersonnelField uiMode={mode} icon={<Shield />} label="Supervisor MO" value={personnelData.supervisorMO} onChange={(v) => handlePersonnelChange('supervisorMO', v)} theme={theme} />
          <PersonnelField uiMode={mode} icon={<Shield />} label="Supervisor EL" value={personnelData.supervisorEL} onChange={(v) => handlePersonnelChange('supervisorEL', v)} theme={theme} />
          <PersonnelField uiMode={mode} icon={<UserCheck />} label="Fiel de Cav" value={personnelData.fielCav} onChange={(v) => handlePersonnelChange('fielCav', v)} theme={theme} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className={`${isTv ? 'text-2xl mb-8' : 'text-[10px] mb-4'} font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Fiel Auxiliares</p>
            <div className={`grid grid-cols-1 ${isTv ? 'gap-8' : 'md:grid-cols-3 gap-4'}`}>
              {[0,1,2].map(i => (
                <PersonnelField uiMode={mode} key={i} icon={<Wrench />} label={`Auxiliar ${i+1}`} value={personnelData.fielAuxiliares[i]} onChange={(v) => {
                  const copy = [...personnelData.fielAuxiliares]; copy[i] = v; handlePersonnelChange('fielAuxiliares', copy);
                }} theme={theme} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className={`${isTv ? 'text-2xl mb-8' : 'text-[10px] mb-4'} font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Patrulha Cav</p>
            <div className={`grid grid-cols-1 ${isTv ? 'gap-8' : 'md:grid-cols-3 gap-4'}`}>
              {[0,1,2].map(i => (
                <PersonnelField uiMode={mode} key={i} icon={<Activity />} label={`Patrulha ${i+1}`} value={personnelData.patrulhaCav[i]} onChange={(v) => {
                  const copy = [...personnelData.patrulhaCav]; copy[i] = v; handlePersonnelChange('patrulhaCav', copy);
                }} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${getThemeClasses()} overflow-x-hidden transition-colors duration-500`}>
      
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
          </aside>

          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className={`p-6 md:p-8 lg:p-12 ${theme === 'light' ? 'bg-white/80 border-slate-200 text-slate-900' : 'bg-slate-900/40 border-slate-800 text-white'} border-b flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl shrink-0`}>
               <div className="flex items-center gap-4 md:gap-8">
                 <ShipLogo className="w-12 md:w-20" customUrl={customLogo} />
                 <div>
                   <h2 className={`text-xl md:text-4xl lg:text-5xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{SHIP_CONFIG.name}</h2>
                   <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2">
                     <Calendar className="text-blue-500 w-4 h-4 md:w-5 md:h-5" />
                     <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`px-2 py-1 md:px-4 md:py-1 rounded-lg font-bold border transition-all text-xs md:text-sm ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-500' : 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500'}`} />
                   </div>
                 </div>
               </div>
               <div className="hidden lg:block">
                 {/* @fix: Pass required props to ThemeSelector component */}
                 <ThemeSelector current={theme} onSelect={setTheme} theme={theme} />
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 pb-24 md:pb-12">
              {view === 'dashboard' && (
                <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
                  {renderPersonnelSection(currentUIMode)}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <FuelPanel fuel={fuelData} onChange={handleFuelChange} uiMode={currentUIMode} />
                    <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode={currentUIMode} />
                  </div>
                </div>
              )}
              {view === 'equipment' && CATEGORIES.map(cat => <EquipmentSection key={cat.name} category={cat} data={equipmentData} onStatusChange={handleStatusChange} uiMode={currentUIMode} />)}
              {view === 'fuel' && <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth uiMode={currentUIMode} />}
              {view === 'stability' && <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode={currentUIMode} />}
            </div>

            {isMobile && (
              <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border-t px-6 py-4 flex justify-around items-center z-50 shadow-2xl`}>
                <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-blue-500' : 'text-slate-500'}`}>
                  <LayoutDashboard size={24} /> <span className="text-[10px] font-black uppercase">Início</span>
                </button>
                <button onClick={() => setView('equipment')} className={`flex flex-col items-center gap-1 ${view === 'equipment' ? 'text-blue-500' : 'text-slate-500'}`}>
                  <Activity size={24} /> <span className="text-[10px] font-black uppercase">Equips</span>
                </button>
                <button onClick={() => setView('fuel')} className={`flex flex-col items-center gap-1 ${view === 'fuel' ? 'text-blue-500' : 'text-slate-500'}`}>
                  <Droplets size={24} /> <span className="text-[10px] font-black uppercase">Cargas</span>
                </button>
                <button onClick={() => setView('stability')} className={`flex flex-col items-center gap-1 ${view === 'stability' ? 'text-blue-500' : 'text-slate-500'}`}>
                  <Compass size={24} /> <span className="text-[10px] font-black uppercase">Estab</span>
                </button>
              </div>
            )}
          </main>
        </>
      ) : (
        <div className={`fixed inset-0 ${getThemeClasses()} overflow-hidden flex flex-col transition-colors duration-500`}>
          <header className={`flex flex-col gap-6 ${currentUIMode === 'tv' ? 'p-16' : currentUIMode === 'tablet' ? 'p-10' : 'p-6'} ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/50 border-slate-800'} border-b-4 backdrop-blur-md`}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6 lg:gap-12">
                <ShipLogo className={currentUIMode === 'tv' ? 'w-56' : currentUIMode === 'tablet' ? 'w-32' : 'w-20'} customUrl={customLogo} />
                <div>
                  <h1 className={`${currentUIMode === 'tv' ? 'text-9xl' : currentUIMode === 'tablet' ? 'text-6xl' : 'text-3xl'} font-black tracking-tighter leading-none`}>
                    {SHIP_CONFIG.name} <span className="text-blue-500">{SHIP_CONFIG.hullNumber}</span>
                  </h1>
                  <p className="text-blue-400 font-black uppercase tracking-[0.2em] mt-4">ATAQUE CONTÍNUO E AGRESSIVO</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setView('dashboard')} className="p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-red-600/10 border-2 border-red-600/30 text-red-500 font-black flex items-center gap-2 md:gap-4 hover:bg-red-600/20 transition-all">
                  <Minimize2 className={currentUIMode === 'tv' ? 'w-20 h-20' : 'w-6 h-6 md:w-10 md:h-10'} /> {currentUIMode !== 'phone' && 'SAIR'}
                </button>
              </div>
            </div>
            <div className="flex gap-2 md:gap-4 mt-2 overflow-x-auto pb-2 scrollbar-hide">
              {['dashboard', 'systems', 'fuel', 'stability'].map((tab) => (
                <button key={tab} onClick={() => setKioskTab(tab as any)} className={`flex-1 min-w-[100px] md:min-w-[150px] ${currentUIMode === 'tv' ? 'text-5xl py-12' : currentUIMode === 'tablet' ? 'text-2xl py-6' : 'text-xs md:text-sm py-3'} rounded-[1.5rem] md:rounded-[3rem] border-2 font-black uppercase transition-all ${kioskTab === tab ? 'bg-blue-600 border-blue-400 text-white' : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500')}`}>
                  {tab === 'dashboard' ? 'Serviço' : tab === 'systems' ? 'Equips' : tab === 'fuel' ? 'Cargas' : 'Estab'}
                </button>
              ))}
            </div>
          </header>
          <div className={`flex-1 overflow-y-auto ${currentUIMode === 'tv' ? 'p-20' : 'p-4 md:p-12'}`}>
            {kioskTab === 'dashboard' && renderPersonnelSection(currentUIMode)}
            {kioskTab === 'systems' && <div className="space-y-8 md:space-y-12">{CATEGORIES.map(cat => <EquipmentSection key={cat.name} category={cat} data={equipmentData} onStatusChange={handleStatusChange} uiMode={currentUIMode} />)}</div>}
            {kioskTab === 'fuel' && <FuelPanel fuel={fuelData} onChange={handleFuelChange} fullWidth uiMode={currentUIMode} />}
            {kioskTab === 'stability' && <StabilityPanel data={stabilityData} onChange={handleStabilityChange} uiMode={currentUIMode} />}
          </div>
        </div>
      )}

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
