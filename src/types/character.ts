export interface Stat {
  value: number;
  locked: boolean;
}
export interface ArmorSlot {
  used: boolean;
  locked: boolean;
}
export interface Armor {
  max: number;
  locked: boolean;
  slots: ArmorSlot[];
}
export interface DamageThresholds {
  minor: number;
  major: number;
  severe: number;
  locked: boolean;
}
export interface ResourceSlot {
  used: boolean;
  locked: boolean;
}
export interface ResourcePool {
  max: number;
  slots: ResourceSlot[];
}
export interface Character {
  name: string;
  class: string;
  level: number;
  origin: string;
  domain: string;
  stats: {
    AGILITY: Stat;
    STRENGTH: Stat;
    FINESSE: Stat;
    INSTINCT: Stat;
    PRESENCE: Stat;
    KNOWLEDGE: Stat;
  };
  evasion: Stat;
  armor: Armor;
  damageThresholds: DamageThresholds;
  health: ResourcePool;
  stress: ResourcePool;
}