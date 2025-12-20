
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
}

export interface EquipmentData {
  [name: string]: EquipmentStatus;
}

export interface DailyReport {
  date: string;
  equipment: EquipmentData;
  fuel: FuelData;
}

export interface EquipmentCategory {
  name: string;
  items: string[];
}
