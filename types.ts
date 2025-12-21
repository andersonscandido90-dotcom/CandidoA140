
export enum EquipmentStatus {
  IN_LINE = 'IN_LINE',
  RESTRICTED = 'RESTRICTED',
  IN_SERVICE = 'IN_SERVICE',
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface StatusConfig {
  id: EquipmentStatus;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface FuelData {
  water: number;
  lubOil: number;
  fuelOil: number;
  jp5: number;
  maxWater: number;
  maxLubOil: number;
  maxFuelOil: number;
  maxJp5: number;
}

export interface StabilityData {
  draftForward: number; // Calado AV
  draftAft: number;     // Calado AR
  heel: number;         // Banda (Graus)
  gm: number;           // Altura Metacêntrica
  displacement: number; // Deslocamento
}

export interface PersonnelData {
  supervisorMO: string;
  supervisorEL: string;
  fielCav: string;
  fielAuxiliares: string[];
  patrulhaCav: string[];
}

export interface EquipmentData {
  [name: string]: EquipmentStatus;
}

export interface DailyReport {
  date: string;
  equipment: EquipmentData;
  fuel: FuelData;
  stability: StabilityData;
  personnel: PersonnelData;
}

export interface EquipmentCategory {
  name: string;
  items: string[];
}
