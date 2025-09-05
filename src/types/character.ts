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
  locked: boolean;
}
export interface ResourceSlot {
  used: boolean;
}
export interface ResourcePool {
  max: number;
  slots: ResourceSlot[];
  locked: boolean;
}
export interface Experience {
  description: string;
  modifier: number;
}
// Add weapon and armor types
export type DamageDie = 'd4' | 'd6' | 'd8' | 'd12' | 'd20';
export type DamageType = "Physical" | "Magical";
export type Traits = "Agility" | "Strength" | "Finesse" | "Instinct" | "Presence" | "Knowledge";
export type Ranges = "Melee" | "Very Close" | "Close" | "Far" | "Very Far";
export type WeaponFeatures = 
  | "Light" | "Heavy" | "Precise" | "Brutal" | "Reach" | "Thrown" 
  | "Versatile" | "Finesse" | "Two-Handed" | "Loading" | "Special" 
  | "Defensive" | "Swift" | "Parrying" | "Disarming" | "Tripping" 
  | "Silent" | "Concealable" | "Magical" | "Silvered" | "Returning";

export type ArmorFeatures =
  | "Light" | "Medium" | "Heavy" | "Reinforced" | "Flexible" 
  | "Stealthy" | "Magical" | "Resistant" | "Deflective" | "Absorbent" 
  | "Fortified" | "Mobile" | "Adaptive" | "Concealing" | "Regenerating" 
  | "Energized" | "Spiked" | "Shielding" | "Ancient" | "Sacred";
export interface Weapon {
  name: string;
  trait: Traits;
  range: Ranges;
  damageDie: DamageDie;
  damageBonus: number;
  damageType: DamageType;
  features: WeaponFeatures[];
  description: string;
  enabled: boolean; // For toggling secondary weapons
}
export interface ArmorItem {
  name: string;
  minorThreshold: number;
  majorThreshold: number;
  baseScore: number;
  features: ArmorFeatures[];
  description: string;
}
export type CharacterClass = 
  | 'Bard: Troubadour'
  | 'Bard: Wordsmith'
  | 'Druid: Warden of Elements'
  | 'Druid: Warden of Renewal'
  | 'Guardian: Oath of Stalwart'
  | 'Guardian: Oath of Vengeance'
  | 'Ranger: Beastbound'
  | 'Ranger: Wayfinder'
  | 'Rogue: Nightwalker'
  | 'Rogue: Syndicate'
  | 'Seraph: Divine Wielder'
  | 'Seraph: Winged Sentinel'
  | 'Sorcerer: Primal Origin'
  | 'Sorcerer: Elemental Origin'
  | 'Warrior: Call of the Brave'
  | 'Warrior: Call of the Slayer'
  | 'Wizard: School of Knowledge'
  | 'Wizard: School of War';
export const characterClasses: CharacterClass[] = [
  'Bard: Troubadour',
  'Bard: Wordsmith',
  'Druid: Warden of Elements',
  'Druid: Warden of Renewal',
  'Guardian: Oath of Stalwart',
  'Guardian: Oath of Vengeance',
  'Ranger: Beastbound',
  'Ranger: Wayfinder',
  'Rogue: Nightwalker',
  'Rogue: Syndicate',
  'Seraph: Divine Wielder',
  'Seraph: Winged Sentinel',
  'Sorcerer: Primal Origin',
  'Sorcerer: Elemental Origin',
  'Warrior: Call of the Brave',
  'Warrior: Call of the Slayer',
  'Wizard: School of Knowledge',
  'Wizard: School of War'
];
export interface Character {
  name: string;
  class: CharacterClass;
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
  hope: {
    available: number;
  };
  experiences: Experience[];
  proficiency: {
    value: number;
    locked: boolean;
  };
  classFeature: string;
  // Add weapons and active armor
  weapons: {
    primary: Weapon;
    secondary: Weapon;
  };
  activeArmor: ArmorItem;
  uiState: {
    showPrimaryWeapon: boolean,
    showSecondaryWeapon: boolean,
    showActiveArmor: boolean
  }
}