import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { saveCharacterData, loadCharacterData } from "../../utils/storage";
import type { Character } from "../../types/character";
import { characterClasses, type CharacterClass } from '../../types/character';

import Tooltip from '../../components/Tooltip';
import { tooltips } from '../../data/tooltip';

import "./Home.css";

const statDescriptions = {
  AGILITY: "Sprint, Leap, Maneuver",
  STRENGTH: "Lift, Smash, Grapple",
  FINESSE: "Control, Hide, Tinker",
  INSTINCT: "Perceive, Sense, Navigate",
  PRESENCE: "Charm, Perform, Deceive",
  KNOWLEDGE: "Recall, Analyze, Comprehend",
};
const initialCharacter: Character = {
  name: "",
  class: "Bard: Troubadour",
  level: 1,
  origin: "",
  domain: "",
  stats: {
    AGILITY: { value: 0, locked: false },
    STRENGTH: { value: 0, locked: false },
    FINESSE: { value: 0, locked: false },
    INSTINCT: { value: 0, locked: false },
    PRESENCE: { value: 0, locked: false },
    KNOWLEDGE: { value: 0, locked: false },
  },
  evasion: { value: 0, locked: false },
  armor: {
    max: 0,
    locked: false,
    slots: Array.from({ length: 12 }, () => ({
      used: false,
      locked: false,
    })),
  },
  damageThresholds: {
    minor: 6,
    major: 12,
    locked: false,
  },
  health: {
    max: 6,
    slots: Array.from({ length: 12 }, () => ({
      used: false,
    })),
    locked: false,
  },
  stress: {
    max: 6,
    slots: Array.from({ length: 12 }, () => ({
      used: false,
    })),
    locked: false,
  },
  hope: {
    available: 0,
  },
  experiences: [
    { description: "I read about this", modifier: 2 },
    { description: "In the clan, we used to...", modifier: 2 },
  ],
  proficiency: {
    value: 1, // Starts at 1
    locked: false,
  },
  classFeature:
    "**Example Class Feature**\n\n- Does something cool\n- _Another ability_\n- Works in combat",
  weapons: {
      primary: {
      name: '',
      trait: 'Strength',
      range: 'Melee',
      damageDie: 'd6',
      damageBonus: 0,
      damageType: 'Physical',
      features: [],
      description: '',
      enabled: true
    },
    secondary: {
      name: '',
      trait: 'Strength',
      range: 'Melee',
      damageDie: 'd6',
      damageBonus: 0,
      damageType: 'Physical',
      features: [],
      description: '',
      enabled: false
    }
  },
  activeArmor: {
    name: "",
    minorThreshold: 6,
    majorThreshold: 12,
    baseScore: 0,
    features: [],
    description: "",
  },
  uiState: {
    showPrimaryWeapon: false,
    showSecondaryWeapon: false,
    showActiveArmor: false
  }
};
type DamageDie = "d4" | "d6" | "d8" | "d12" | "d20";
type DamageType = "Physical" | "Magical";
type Traits = "Agility" | "Strength" | "Finesse" | "Instinct" | "Presence" | "Knowledge";
type Ranges = "Melee" | "Very Close" | "Close" | "Far" | "Very Far";
type WeaponFeatures = 
  | "Light" | "Heavy" | "Precise" | "Brutal" | "Reach" | "Thrown" 
  | "Versatile" | "Finesse" | "Two-Handed" | "Loading" | "Special" 
  | "Defensive" | "Swift" | "Parrying" | "Disarming" | "Tripping" 
  | "Silent" | "Concealable" | "Magical" | "Silvered" | "Returning";
type ArmorFeatures =
  | "Light" | "Medium" | "Heavy" | "Reinforced" | "Flexible" 
  | "Stealthy" | "Magical" | "Resistant" | "Deflective" | "Absorbent" 
  | "Fortified" | "Mobile" | "Adaptive" | "Concealing" | "Regenerating" 
  | "Energized" | "Spiked" | "Shielding" | "Ancient" | "Sacred";
interface Weapon {
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
interface ArmorItem {
  name: string;
  minorThreshold: number;
  majorThreshold: number;
  baseScore: number;
  feature: ArmorFeatures[];
  description: string;
}
interface SaveStatus {
  loading: boolean;
  success: boolean;
  error?: string;
}

const ResourceSlot = ({
  used,
  hp,
  onToggle,
}: {
  used: boolean;
  hp: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`resource-slot ${used ? "used" : ""}`}
    onClick={onToggle}
    onContextMenu={(e) => {
      e.preventDefault();
    }}
  >
    {hp ? (
      used ? (
        <img className="icon" src="/i-hp.svg" alt="Locked" />
      ) : (
        <img className="icon" src="/i-hp_used.svg" alt="Locked" />
      )
    ) : used ? (
      <img className="icon" src="/i-stress.svg" alt="Unlocked" />
    ) : (
      <img className="icon" src="/i-stress_used.svg" alt="Unlocked" />
    )}
  </div>
);

export default function CharacterSheet() {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    loading: false,
    success: false,
    error: undefined,
  });
  const handleWeaponChange = (
    weaponType: "primary" | "secondary",
    field: keyof Weapon,
    value: string | number | WeaponFeatures[]
  ) => {
    setCharacter((prev) => ({
      ...prev,
      weapons: {
        ...prev.weapons,
        [weaponType]: {
          ...prev.weapons[weaponType],
          [field]: value,
        },
      },
    }));
  };
  const handleArmorChange = (
    field: keyof ArmorItem,
    value: string | number | ArmorFeatures[]
  ) => {
    setCharacter((prev) => ({
      ...prev,
      activeArmor: {
        ...prev.activeArmor,
        [field]: value,
      },
    }));
  };
  const toggleSecondaryWeapon = () => {
    setCharacter(prev => ({
      ...prev,
      weapons: {
        ...prev.weapons,
        secondary: {
          ...prev.weapons.secondary,
          enabled: !prev.weapons.secondary.enabled
        }
      }
    }));
  };
  useEffect(() => {
    const savedData = loadCharacterData();
    interface ArmorSlotData {
      used: boolean;
      locked: boolean;
    }
    interface HealthSlotData {
      used: boolean;
    }
    interface StessSlotData {
      used: boolean;
    }
    if (savedData) {
      setCharacter({
        ...initialCharacter,
        ...savedData,
        evasion: savedData.evasion
          ? { ...initialCharacter.evasion, ...savedData.evasion }
          : initialCharacter.evasion,
        armor: savedData.armor
          ? {
              ...initialCharacter.armor,
              ...savedData.armor,
              slots: savedData.armor.slots
                ? savedData.armor.slots.map((slot: ArmorSlotData) => ({
                    ...initialCharacter.armor.slots[0],
                    ...slot,
                  }))
                : initialCharacter.armor.slots,
            }
          : initialCharacter.armor,
        damageThresholds: savedData.damageThresholds
          ? {
              ...initialCharacter.damageThresholds,
              ...savedData.damageThresholds,
            }
          : initialCharacter.damageThresholds,
        health: savedData.health
          ? {
              ...initialCharacter.health,
              ...savedData.health,
              slots: savedData.health.slots
                ? savedData.health.slots.map((slot: HealthSlotData) => ({
                    ...initialCharacter.health.slots[0],
                    ...slot,
                  }))
                : initialCharacter.health.slots,
            }
          : initialCharacter.health,
        stress: savedData.stress
          ? {
              ...initialCharacter.stress,
              ...savedData.stress,
              slots: savedData.stress.slots
                ? savedData.stress.slots.map((slot: StessSlotData) => ({
                    ...initialCharacter.stress.slots[0],
                    ...slot,
                  }))
                : initialCharacter.stress.slots,
            }
          : initialCharacter.stress,
        proficiency: savedData.proficiency || initialCharacter.proficiency,
        hope: savedData.hope
          ? {
              ...initialCharacter.hope,
              ...savedData.hope,
            }
          : initialCharacter.hope,
        weapons: savedData.weapons || initialCharacter.weapons,
        activeArmor: savedData.activeArmor || initialCharacter.activeArmor,
        uiState: savedData.uiState || {
          showPrimaryWeapon: true,
          showSecondaryWeapon: true,
          showActiveArmor: true
        },
        class: (savedData.class && characterClasses.includes(initialCharacter.class as CharacterClass)) 
        ? savedData.class as CharacterClass 
        : (initialCharacter.class || '') as CharacterClass,
      });
    }
  }, []);
  const handleSave = async () => {
    setSaveStatus({ loading: true, success: false });
    const result = saveCharacterData(character);

    setSaveStatus({
      loading: false,
      success: result.success,
      error: result.error,
    });

    setTimeout(() => {
      setSaveStatus((prev) => ({ ...prev, success: false, error: undefined }));
    }, 3000);
  };
  const SaveToast = () => {
    if (saveStatus.loading)
      return <div className="toast loading">Saving...</div>;
    if (saveStatus.success)
      return <div className="toast success">Character saved successfully!</div>;
    if (saveStatus.error)
      return <div className="toast error">Error: {saveStatus.error}</div>;
    return null;
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCharacter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCharacter((prev) => ({
      ...prev,
      level: Math.max(1, Math.min(10, value)),
    }));
  };
  const handleStatChange = (stat: keyof Character["stats"], value: number) => {
    setCharacter((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: {
          ...prev.stats[stat],
          value: Math.max(-3, Math.min(3, value)),
        },
      },
    }));
  };
  const toggleStatMark = (stat: keyof Character["stats"]) => {
    setCharacter((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: {
          ...prev.stats[stat],
          locked: !prev.stats[stat].locked,
        },
      },
    }));
  };
  const handleEvasionChange = (value: number) => {
    setCharacter((prev) => ({
      ...prev,
      evasion: {
        ...prev.evasion,
        value: Math.max(0, Math.min(10, value)),
      },
    }));
  };
  const handleArmorMaxChange = (value: number) => {
    setCharacter((prev) => ({
      ...prev,
      armor: {
        ...prev.armor,
        max: Math.max(0, Math.min(12, value)),
      },
    }));
  };
  const toggleArmorSlot = (index: number) => {
    setCharacter((prev) => {
      const newSlots = [...prev.armor.slots];
      newSlots[index] = {
        ...newSlots[index],
        used: !newSlots[index].used,
      };
      return {
        ...prev,
        armor: {
          ...prev.armor,
          slots: newSlots,
        },
      };
    });
  };
  const toggleArmorSlotLock = (index: number) => {
    setCharacter((prev) => {
      const newSlots = [...prev.armor.slots];
      newSlots[index] = {
        ...newSlots[index],
        locked: !newSlots[index].locked,
      };
      return {
        ...prev,
        armor: {
          ...prev.armor,
          slots: newSlots,
        },
      };
    });
  };
  const toggleEvasionLock = () => {
    setCharacter((prev) => ({
      ...prev,
      evasion: {
        ...prev.evasion,
        locked: !prev.evasion.locked,
      },
    }));
  };
  const toggleArmorMaxLock = () => {
    setCharacter((prev) => ({
      ...prev,
      armor: {
        ...prev.armor,
        locked: !prev.armor.locked,
      },
    }));
  };
  const updateThresholdInput = (type: "minor" | "major", value: number) => {
    setCharacter((prev) => ({
      ...prev,
      damageThresholds: {
        ...prev.damageThresholds,
        [type]: Math.max(0, value), // Ensure it doesn't go below 0
      },
    }));
  };
  const toggleThresholdsLock = () => {
    setCharacter((prev) => ({
      ...prev,
      damageThresholds: {
        ...prev.damageThresholds,
        locked: !prev.damageThresholds.locked,
      },
    }));
  };
  const updateResourceMax = (resource: "health" | "stress", change: number) => {
    setCharacter((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        max: Math.max(1, Math.min(12, prev[resource].max + change)),
      },
    }));
  };
  const toggleResourceSlot = (resource: "health" | "stress", index: number) => {
    setCharacter((prev) => {
      const newSlots = [...prev[resource].slots];
      newSlots[index] = {
        ...newSlots[index],
        used: !newSlots[index].used,
      };
      return {
        ...prev,
        [resource]: {
          ...prev[resource],
          slots: newSlots,
        },
      };
    });
  };
  // Add this state at the top of your component
  const [tabberVisible, setTabberVisible] = useState(false);
  // Add this component before your return statement
  const Tabber = () => (
    <div className={`tabber ${tabberVisible ? "visible" : ""}`}>
      <div className="tabber-content">
        <Link to="/actionscreen" className="tabber-icon">
          <img src="/i-act.svg" alt="Domain Cards" title="Domain Cards" />
          <p>Actions</p>
        </Link>
        <Link to="/diceroller" className="tabber-icon">
          <img src="/i-dice.svg" alt="Dice Roller" title="Dice Roller" />
          <p>DiceRoller</p>
        </Link>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saveStatus.loading}
          aria-label="Save all changes"
        >
          {saveStatus.loading ? "Saving..." : "Save"}
        </button>
      </div>
      <button
        className="tabber-toggle"
        onClick={() => setTabberVisible(!tabberVisible)}
        aria-label={tabberVisible ? "Hide navigation" : "Show navigation"}
      >
        <img
          src={tabberVisible ? "/i-cheveron_down.svg" : "/i-cheveron_up.svg"}
          alt={tabberVisible ? "▼" : "▲"}
        />
      </button>
    </div>
  );
  const [showClassFeatureEdit, setShowClassFeatureEdit] = useState(false);
  const renderMarkdownPreview = (text: string) => {
    // Simple markdown to HTML conversion
    const html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
      .replace(/\_(.*?)\_/g, "<em>$1</em>") // italics
      .replace(/\n\-(.*?)(\n|$)/g, "\n• $1$2") // bullets
      .replace(/\n/g, "<br/>"); // line breaks

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
  const formatText = (prefix: string, suffix: string) => {
    const textarea = document.querySelector(
      ".class-feature-input"
    ) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = character.classFeature.substring(start, end);
    const newText =
      character.classFeature.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      character.classFeature.substring(end);

    setCharacter({ ...character, classFeature: newText });

    // Focus back on the textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };
  // For weapons
  const weaponFeatures: WeaponFeatures[] = [
    "Light", "Heavy", "Precise", "Brutal", "Reach", "Thrown",
    "Versatile", "Finesse", "Two-Handed", "Loading", "Special",
    "Defensive", "Swift", "Parrying", "Disarming", "Tripping",
    "Silent", "Concealable", "Magical", "Silvered", "Returning"
  ];
  // For armor  
  const armorFeatures: ArmorFeatures[] = [
    "Light", "Medium", "Heavy", "Reinforced", "Flexible",
    "Stealthy", "Magical", "Resistant", "Deflective", "Absorbent",
    "Fortified", "Mobile", "Adaptive", "Concealing", "Regenerating",
    "Energized", "Spiked", "Shielding", "Ancient", "Sacred"
  ];
  const WeaponFeatureSelector = ({ features, onChange }: { features: WeaponFeatures[], onChange: (features: WeaponFeatures[]) => void }) => (
  <div className="features-selector">
    <label>Weapon Features</label>
    <div className="features-grid">
      {weaponFeatures.map(feature => (
        <div className="container" key={feature + 'a'}>
          <input
            id={`wfeature-${feature}`}
            type="checkbox"
            checked={features?.includes(feature) || false} // Added safety check
            onChange={(e) => {
              const currentFeatures = features || []; // Handle undefined features
              const newFeatures = e.target.checked
                ? [...currentFeatures, feature]
                : currentFeatures.filter(f => f !== feature);
              onChange(newFeatures);
            }}
          />
          <Tooltip key={feature} content={tooltips[feature]}>
            <label htmlFor={`wfeature-${feature}`} key={feature} className="feature-checkbox">
              <p>{feature}</p>
            </label>
          </Tooltip>
        </div>
      ))}
    </div>
  </div>
  );
  const ArmorFeatureSelector = ({ features, onChange }: { features: ArmorFeatures[], onChange: (features: ArmorFeatures[]) => void }) => (
  <div className="features-selector">
    <label>Armor Features</label>
    <div className="features-grid">
      {armorFeatures.map(feature => (
        <div className="container" key={feature + 'a'}>
          <input
            id={`afeature-${feature}`}
            type="checkbox"
            checked={features?.includes(feature) || false} // Added safety check
            onChange={(e) => {
              const currentFeatures = features || []; // Handle undefined features
              const newFeatures = e.target.checked
                ? [...currentFeatures, feature]
                : currentFeatures.filter(f => f !== feature);
              onChange(newFeatures);
            }}
          />
          <Tooltip key={feature} content={tooltips[feature]}>
            <label htmlFor={`afeature-${feature}`} key={feature} className="feature-checkbox">
              <p>{feature}</p>
            </label>
          </Tooltip>
        </div>
      ))}
    </div>
  </div>
  );
  const showPrimaryWeapon = () => {
    //console.log(character.uiState.showPrimaryWeapon = !character.uiState.showPrimaryWeapon)
    setCharacter(prev => ({
      ...prev,
      uiState: {
          ...prev.uiState,
          showPrimaryWeapon: !prev.uiState.showPrimaryWeapon
      }
    }));
  };
  const TraitsSelect = ({ value, onChange }: { value: Traits, onChange: (value: Traits) => void }) => (
    <div className="form-group">
      <label>Trait</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Traits)}
      >
        <option value="Agility">Agility</option>
        <option value="Strength">Strength</option>
        <option value="Finesse">Finesse</option>
        <option value="Instinct">Instinct</option>
        <option value="Presence">Presence</option>
        <option value="Knowledge">Knowledge</option>
      </select>
    </div>
  );
  const RangesSelect = ({ value, onChange }: { value: Ranges, onChange: (value: Ranges) => void }) => (
    <div className="form-group">
      <label>Range</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Ranges)}
      >
        <option value="Melee">Melee</option>
        <option value="Very Close">Very Close</option>
        <option value="Close">Close</option>
        <option value="Far">Far</option>
        <option value="Very Far">Very Far</option>
      </select>
    </div>
  );
  useEffect(() => {
    if (showClassFeatureEdit) {
      const textarea = document.querySelector(
        ".class-feature-input"
      ) as HTMLTextAreaElement;
      textarea?.focus();
    }
  }, [showClassFeatureEdit]);

  return (
    <div>
      <div className="character-sheet">
        <div className="title">
          <h1>RollWithIt</h1>
          <p>DaggerHeart Companion App</p>
        </div>
        <div className="character-info info-container">
          <div className="info-grid">
            <div className="info-col">
              <div className="info-cell name">
                <p>Name</p>
                <input
                  type="text"
                  name="name"
                  value={character.name}
                  onChange={handleInputChange}
                  placeholder="Lyra the Smith"
                />
              </div>
              <div className="info-cell origin">
                <p>Origin</p>
                <input
                  type="text"
                  name="origin"
                  value={character.origin}
                  onChange={handleInputChange}
                  placeholder="Elf Highborn"
                />
              </div>
            </div>

            <div className="info-col">
              {/*
              <div className="info-cell class">
                <p>Class</p>
                <input
                  type="text"
                  name="class"
                  value={character.class}
                  onChange={handleInputChange}
                  placeholder="Bard: Wordsmith"
                />
              </div>
              */}
              <div className="info-cell class">
                <p>Class</p>
                <select
                  name="class"
                  value={character.class}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCharacter(prev => ({
                        ...prev,
                        class: e.target.value as CharacterClass
                      }));
                    }
                  }}
                >
                  <option value="">Select a Class</option>
                  <optgroup label="Bard">
                    <option value="Bard: Troubadour">Bard: Troubadour</option>
                    <option value="Bard: Wordsmith">Bard: Wordsmith</option>
                  </optgroup>
                  <optgroup label="Druid">
                    <option value="Druid: Warden of Elements">Druid: Elements</option>
                    <option value="Druid: Warden of Renewal">Druid: Renewal</option>
                  </optgroup>
                  <optgroup label="Guardian">
                    <option value="Guardian: Oath of Stalwart">Guardian: Stalwart</option>
                    <option value="Guardian: Oath of Vengeance">Guardian: Vengeance</option>
                  </optgroup>
                  <optgroup label="Ranger">
                    <option value="Ranger: Beastbound">Ranger: Beastbound</option>
                    <option value="Ranger: Wayfinder">Ranger: Wayfinder</option>
                  </optgroup>
                  <optgroup label="Rogue">
                    <option value="Rogue: Nightwalker">Rogue: Nightwalker</option>
                    <option value="Rogue: Syndicate">Rogue: Syndicate</option>
                  </optgroup>
                  <optgroup label="Seraph">
                    <option value="Seraph: Divine Wielder">Seraph: Divine Wielder</option>
                    <option value="Seraph: Winged Sentinel">Seraph: Winged Sentinel</option>
                  </optgroup>
                  <optgroup label="Sorcerer">
                    <option value="Sorcerer: Primal Origin">Sorcerer: Primal</option>
                    <option value="Sorcerer: Elemental Origin">Sorcerer: Elemental</option>
                  </optgroup>
                  <optgroup label="Warrior">
                    <option value="Warrior: Call of the Brave">Warrior: Brave</option>
                    <option value="Warrior: Call of the Slayer">Warrior: Slayer</option>
                  </optgroup>
                  <optgroup label="Wizard">
                    <option value="Wizard: School of Knowledge">Wizard: Knowledge</option>
                    <option value="Wizard: School of War">Wizard: War</option>
                  </optgroup>
                </select>
              </div>
              <div className="info-cell domain">
                <p>Domain</p>
                <input
                  type="text"
                  name="domain"
                  value={character.domain}
                  onChange={handleInputChange}
                  placeholder="Grace Codex"
                />
              </div>
            </div>

            <div className="info-col">
              <div className="info-cell level">
                <p>Level</p>
                <input
                  type="number"
                  name="level"
                  value={character.level}
                  onChange={handleLevelChange}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>
        </div>
        <Swiper
          spaceBetween={50}
          pagination={{
            dynamicBullets: true,
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="HomeSlider info-container"
          slidesPerView={1}
        >
          {/* Character Stats + Porf & Hope */}
          <SwiperSlide>
            <h2>Character Stats</h2>
            <section className="stats-grid">
              {Object.entries(character.stats).map(([statKey, statValue]) => (
                <div key={statKey} className="stat-cell box-container">
                  <div className="header">
                    <span
                      className="stat-name"
                      title={
                        statDescriptions[
                          statKey as keyof typeof statDescriptions
                        ]
                      }
                    >
                      {statKey}
                    </span>
                    <button
                      className={`mark-btn ${statValue.locked ? "locked" : ""}`}
                      onClick={() =>
                        toggleStatMark(statKey as keyof Character["stats"])
                      }
                      title={
                        statValue.locked
                          ? "Locked"
                          : "Click to mark for +1 bonus"
                      }
                    >
                      {statValue.locked ? (
                        <img
                          className="icon"
                          src="/i-locked.svg"
                          alt="Locked"
                        />
                      ) : (
                        <img
                          className="icon"
                          src="/i-unlocked.svg"
                          alt="Unlocked"
                        />
                      )}
                    </button>
                  </div>
                  <div className="stat-value">
                    <button
                      onClick={() =>
                        handleStatChange(
                          statKey as keyof Character["stats"],
                          statValue.value - 1
                        )
                      }
                      disabled={statValue.value <= -3 || statValue.locked}
                    >
                      -
                    </button>
                    <span>{statValue.value}</span>
                    <button
                      onClick={() =>
                        handleStatChange(
                          statKey as keyof Character["stats"],
                          statValue.value + 1
                        )
                      }
                      disabled={statValue.value >= 3 || statValue.locked}
                    >
                      +
                    </button>
                  </div>
                  <p className="stat-description">
                    {statDescriptions[statKey as keyof typeof statDescriptions]}
                  </p>
                </div>
              ))}
            </section>
            <section className="proficiency-section box-container">
              <div className="header">
                <h3>Proficiency</h3>
                <button
                  className={`lock-btn ${
                    character.proficiency.locked ? "locked" : ""
                  }`}
                  onClick={() =>
                    setCharacter({
                      ...character,
                      proficiency: {
                        ...character.proficiency,
                        locked: !character.proficiency.locked,
                      },
                    })
                  }
                  title={
                    character.proficiency.locked
                      ? "Unlock proficiency"
                      : "Lock proficiency"
                  }
                >
                  {character.proficiency.locked ? (
                    <img className="icon" src="/i-locked.svg" alt="Locked" />
                  ) : (
                    <img
                      className="icon"
                      src="/i-unlocked.svg"
                      alt="Unlocked"
                    />
                  )}
                </button>
              </div>
              <div className="proficiency-value">
                <button
                  onClick={() =>
                    setCharacter({
                      ...character,
                      proficiency: {
                        ...character.proficiency,
                        value: Math.max(1, character.proficiency.value - 1),
                      },
                    })
                  }
                  disabled={
                    character.proficiency.value <= 1 ||
                    character.proficiency.locked
                  }
                >
                  -
                </button>
                <span>{character.proficiency.value}</span>
                <button
                  onClick={() =>
                    setCharacter({
                      ...character,
                      proficiency: {
                        ...character.proficiency,
                        value: Math.min(6, character.proficiency.value + 1),
                      },
                    })
                  }
                  disabled={
                    character.proficiency.value >= 6 ||
                    character.proficiency.locked
                  }
                >
                  +
                </button>
              </div>
            </section>
            <section className="hope-section box-container">
              <h3 className="header">Hope: {character.hope.available} / 6</h3>
              <div className="hope-slots">
                {Array.from({ length: 6 }).map((_, index) => {
                  const isAvailable = index < character.hope.available;
                  return (
                    <div
                      key={`hope-${index}`}
                      className={`hope-slot ${isAvailable ? "" : "used"}`}
                      onClick={() => {
                        setCharacter((prev) => {
                          const newAvailable = isAvailable
                            ? prev.hope.available - 1
                            : prev.hope.available + 1;

                          return {
                            ...prev,
                            hope: {
                              available: Math.max(0, Math.min(6, newAvailable)),
                            },
                          };
                        });
                      }}
                      title={
                        isAvailable
                          ? "Click to spend hope"
                          : "Click to restore hope"
                      }
                    >
                      {isAvailable ? (
                        <img className="icon" src="/i-hope.svg" alt="Locked" />
                      ) : (
                        <img
                          className="icon"
                          src="/i-hope_slot.svg"
                          alt="Unlocked"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            <div className="experience-section box-container">
              <h3 className="header">Experiences</h3>
              <div className="experience-list">
                {character.experiences.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <input
                      type="text"
                      value={exp.description}
                      onChange={(e) => {
                        const newExperiences = [...character.experiences];
                        newExperiences[index].description = e.target.value;
                        setCharacter({
                          ...character,
                          experiences: newExperiences,
                        });
                      }}
                      placeholder="e.g., 'SHHhhhhhhh...' for stealth"
                    />
                    <div className="modifier-controls">
                      <button
                        onClick={() => {
                          const newExperiences = [...character.experiences];
                          newExperiences[index].modifier = Math.max(
                            0,
                            exp.modifier - 1
                          );
                          setCharacter({
                            ...character,
                            experiences: newExperiences,
                          });
                        }}
                      >
                        -
                      </button>
                      <span>+{exp.modifier}</span>
                      <button
                        onClick={() => {
                          const newExperiences = [...character.experiences];
                          newExperiences[index].modifier = exp.modifier + 1;
                          setCharacter({
                            ...character,
                            experiences: newExperiences,
                          });
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-experience"
                      onClick={() => {
                        const newExperiences = character.experiences.filter(
                          (_, i) => i !== index
                        );
                        setCharacter({
                          ...character,
                          experiences: newExperiences,
                        });
                      }}
                      title="Remove experience"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="add-experience"
                onClick={() => {
                  setCharacter({
                    ...character,
                    experiences: [
                      ...character.experiences,
                      { description: "", modifier: 2 },
                    ],
                  });
                }}
                disabled={character.experiences.length >= 6} // Optional limit
              >
                + Add Experience
              </button>
            </div>
          </SwiperSlide>
          {/* Damage Thresholds Section + Health & Stress Bars */}
          <SwiperSlide>
            <h2>Combat & Armor</h2>
            <section className="damage-thresholds box-container">
              <div className="header">
                <h3>Damage Thresholds</h3>
                <button
                  className={`lock-btn ${
                    character.damageThresholds.locked ? "locked" : ""
                  }`}
                  onClick={toggleThresholdsLock}
                >
                  {character.damageThresholds.locked ? (
                    <img className="icon" src="/i-locked.svg" alt="Locked" />
                  ) : (
                    <img
                      className="icon"
                      src="/i-unlocked.svg"
                      alt="Unlocked"
                    />
                  )}
                </button>
              </div>

              <div className="threshold-grid">
                <div className="threshold-cell">
                  <div className="threshold-info">
                    <p className="threshold-label">Minor</p>
                    <p className="threshold-description">Mark 1 HP</p>
                  </div>
                  <input
                    type="number"
                    value={character.damageThresholds.minor}
                    onChange={(e) =>
                      updateThresholdInput("minor", parseInt(e.target.value))
                    }
                    min="0"
                    max="30"
                    disabled={character.damageThresholds.locked}
                    className="threshold-input-field"
                  />
                  {/*
                    <button 
                      onClick={() => updateThreshold('minor', -1)}
                      disabled={character.damageThresholds.locked}
                    >-</button>
                    <span>{character.damageThresholds.minor}</span>
                    <button 
                      onClick={() => updateThreshold('minor', 1)}
                      disabled={character.damageThresholds.locked}
                    >+</button>
                    */}
                </div>
                <div className="threshold-cell">
                  <div className="threshold-info">
                    <p className="threshold-label">Major</p>
                    <p className="threshold-description">Mark 2 HP</p>
                  </div>
                  <input
                    type="number"
                    value={character.damageThresholds.major}
                    onChange={(e) =>
                      updateThresholdInput("major", parseInt(e.target.value))
                    }
                    min="0"
                    max="30"
                    disabled={character.damageThresholds.locked}
                    className="threshold-input-field"
                  />
                  {/* 
                  <button 
                    onClick={() => updateThreshold('major', -1)}
                    disabled={character.damageThresholds.locked}
                  >-</button>
                  <span>{character.damageThresholds.major}</span>
                  <button 
                    onClick={() => updateThreshold('major', 1)}
                    disabled={character.damageThresholds.locked}
                  >+</button>
                  */}
                </div>
                <div className="threshold-cell">
                  <div className="threshold-info">
                    <p className="threshold-label">Severe</p>
                    <p className="threshold-description">Mark 3 HP</p>
                  </div>
                </div>
                {/*
                <div className="threshold-cell">
                  <div className="threshold-input">
                    <button 
                      onClick={() => updateThreshold('severe', -1)}
                      disabled={character.damageThresholds.locked}
                    >-</button>
                    <span>{character.damageThresholds.severe}</span>
                    <button 
                      onClick={() => updateThreshold('severe', 1)}
                      disabled={character.damageThresholds.locked}
                    >+</button>
                  </div>
                  <p>Severe (3 HP)</p>
                </div>
                */}
              </div>
            </section>
            <div className="resource-bars">
              {/* Health Bar */}
              <div className="resource-bar hp">
                <div className="resource-header header">
                  <h3>HP: {character.health.max}</h3>
                  <button
                    className={`lock-btn ${
                      character.health.locked ? "locked" : ""
                    }`}
                    onClick={() =>
                      setCharacter((prev) => ({
                        ...prev,
                        health: {
                          ...prev.health,
                          locked: !prev.health.locked,
                        },
                      }))
                    }
                    title={
                      character.health.locked
                        ? "Unlock HP maximum"
                        : "Lock HP maximum"
                    }
                  >
                    {character.health.locked ? (
                      <img className="icon" src="/i-locked.svg" alt="Locked" />
                    ) : (
                      <img
                        className="icon"
                        src="/i-unlocked.svg"
                        alt="Unlocked"
                      />
                    )}
                  </button>
                </div>
                <div className="slots-grid">
                  {character.health.slots
                    .slice(0, character.health.max)
                    .map((slot, i) => (
                      <ResourceSlot
                        key={`health-${i}`}
                        used={slot.used}
                        hp={true}
                        onToggle={() =>
                          !character.health.locked &&
                          toggleResourceSlot("health", i)
                        }
                      />
                    ))}
                </div>
                <div className="resource-controls">
                  <button
                    onClick={() => updateResourceMax("health", -1)}
                    disabled={character.health.locked}
                  >
                    -
                  </button>
                  <span>Max HP</span>
                  <button
                    onClick={() => updateResourceMax("health", 1)}
                    disabled={character.health.locked}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Stress Bar */}
              <div className="resource-bar stress">
                <div className="resource-header header">
                  <h3>Stress: {character.stress.max}</h3>
                  <button
                    className={`lock-btn ${
                      character.stress.locked ? "locked" : ""
                    }`}
                    onClick={() =>
                      setCharacter((prev) => ({
                        ...prev,
                        stress: {
                          ...prev.stress,
                          locked: !prev.stress.locked,
                        },
                      }))
                    }
                    title={
                      character.stress.locked
                        ? "Unlock all stress slots"
                        : "Lock all stress slots"
                    }
                  >
                    {character.stress.locked ? (
                      <img className="icon" src="/i-locked.svg" alt="Locked" />
                    ) : (
                      <img
                        className="icon"
                        src="/i-unlocked.svg"
                        alt="Unlocked"
                      />
                    )}
                  </button>
                </div>
                <div className="slots-grid">
                  {character.stress.slots
                    .slice(0, character.stress.max)
                    .map((slot, i) => (
                      <ResourceSlot
                        key={`stress-${i}`}
                        used={slot.used}
                        hp={false}
                        onToggle={() =>
                          !character.stress.locked &&
                          toggleResourceSlot("stress", i)
                        }
                      />
                    ))}
                </div>
                <div className="resource-controls">
                  <button
                    onClick={() => updateResourceMax("stress", -1)}
                    disabled={character.stress.locked}
                  >
                    -
                  </button>
                  <span>Max Stress</span>
                  <button
                    onClick={() => updateResourceMax("stress", 1)}
                    disabled={character.stress.locked}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="defense-section">
              <div className="resource-header header">
                <h3>Defense</h3>
              </div>

              <div className="defense-row">
                <div className="defense-stat">
                  <div className="header">
                    <span>Evasion</span>
                    <button
                      className={`lock-btn ${
                        character.evasion.locked ? "locked" : ""
                      }`}
                      onClick={toggleEvasionLock}
                      title={
                        character.evasion.locked
                          ? "Unlock evasion"
                          : "Lock evasion"
                      }
                    >
                      {character.evasion.locked ? (
                        <img
                          className="icon"
                          src="/i-locked.svg"
                          alt="Locked"
                        />
                      ) : (
                        <img
                          className="icon"
                          src="/i-unlocked.svg"
                          alt="Unlocked"
                        />
                      )}
                    </button>
                  </div>
                  <div className="stat-value">
                    <button
                      onClick={() =>
                        handleEvasionChange(character.evasion.value - 1)
                      }
                      disabled={
                        character.evasion.value <= 0 || character.evasion.locked
                      }
                    >
                      -
                    </button>
                    <span>{character.evasion.value}</span>
                    <button
                      onClick={() =>
                        handleEvasionChange(character.evasion.value + 1)
                      }
                      disabled={
                        character.evasion.value >= 10 ||
                        character.evasion.locked
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="defense-stat">
                  <div className="header">
                    <span>Armor Max</span>
                    <button
                      className={`lock-btn ${
                        character.armor.locked ? "locked" : ""
                      }`}
                      onClick={toggleArmorMaxLock}
                      title={
                        character.armor.locked ? "Unlock armor" : "Lock armor"
                      }
                    >
                      {character.armor.locked ? (
                        <img
                          className="icon"
                          src="/i-locked.svg"
                          alt="Locked"
                        />
                      ) : (
                        <img
                          className="icon"
                          src="/i-unlocked.svg"
                          alt="Unlocked"
                        />
                      )}
                    </button>
                  </div>
                  <div className="stat-value">
                    <button
                      onClick={() =>
                        handleArmorMaxChange(character.armor.max - 1)
                      }
                      disabled={
                        character.armor.max <= 0 || character.armor.locked
                      }
                    >
                      -
                    </button>
                    <span>{character.armor.max}</span>
                    <button
                      onClick={() =>
                        handleArmorMaxChange(character.armor.max + 1)
                      }
                      disabled={
                        character.armor.max >= 12 || character.armor.locked
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="armor-slots">
                <div className="resource-header header">
                  <h3>Armor Slots</h3>
                </div>
                <div className="slots-grid">
                  {character.armor.slots
                    .slice(0, character.armor.max)
                    .map((slot, index) => (
                      <button
                        key={index}
                        className={`armor-slot ${slot.used ? "used" : ""}`}
                        onClick={() => !slot.locked && toggleArmorSlot(index)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          toggleArmorSlotLock(index);
                        }}
                        title={
                          slot.locked
                            ? "Right-click to unlock"
                            : `Left-click to ${
                                slot.used ? "repair" : "use"
                              } armor\nRight-click to lock`
                        }
                      >
                        {slot.used ? (
                          <img
                            className="i-armorSlot"
                            src="/i-shield_broken.svg"
                            alt="Used Armor"
                          />
                        ) : (
                          <img
                            className="i-armorSlot"
                            src="/i-shield_available.svg"
                            alt="Available Armor"
                          />
                        )}
                        {slot.locked && <span className="slot-lock">🔒</span>}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
          {/* Experiences + Class Features */}
          <SwiperSlide>
            <h2>Notes</h2>
            <div className="class-feature-section">
              <div className="section-header">
                <h3>Character Notes</h3>
                <button
                  onClick={() => setShowClassFeatureEdit(!showClassFeatureEdit)}
                  className="toggle-edit-btn"
                >
                  {showClassFeatureEdit ? "Done" : "Edit"}
                </button>
              </div>
              <p className="markdown-hint">
                Supports: **bold**, _italics_, - bullets
              </p>
              {showClassFeatureEdit ? (
                <>
                  <div className="markdown-toolbar">
                    <button onClick={() => formatText("**", "**")} title="Bold">
                      B
                    </button>
                    <button onClick={() => formatText("_", "_")} title="Italic">
                      I
                    </button>
                    <button
                      onClick={() => formatText("\n- ", "")}
                      title="Bullet"
                    >
                      •
                    </button>
                  </div>
                  <textarea
                    value={character.classFeature}
                    onChange={(e) =>
                      setCharacter({
                        ...character,
                        classFeature: e.target.value,
                      })
                    }
                    placeholder="Enter your class features with markdown formatting..."
                    className="class-feature-input"
                  />
                </>
              ) : (
                <div
                  className="class-feature-display"
                  onClick={() => setShowClassFeatureEdit(true)}
                >
                  {character.classFeature ? (
                    <div className="markdown-preview">
                      {renderMarkdownPreview(character.classFeature)}
                    </div>
                  ) : (
                    <div className="empty-placeholder">
                      Click "Edit" to add class features
                    </div>
                  )}
                </div>
              )}
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="items-sheet">
        <div className="">
          <details className="collapsible-section">
            <summary>
              <span>Active Weapons</span>
              <img
                className="chevron-icon"
                src="/i-cheveron_down-alt.svg"
                alt="▼"
              />
            </summary>
            <div className="weapons-section">
              <div className="weapon-card primary box-container">
                <div className="headerSection header">
                  <h3>Primary Weapon</h3>
                  <label className="toggle-weapon">
                    {character.uiState.showPrimaryWeapon? 'Hide' : 'Show'}
                    <input
                      type="checkbox"
                      checked={character.uiState.showPrimaryWeapon}
                      onChange={showPrimaryWeapon}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {character.uiState.showPrimaryWeapon && (
                  <>
                    <div className="form-group name">
                      <label>Name</label>
                      <input
                        type="text"
                        name="pWeaponName"
                        value={character.weapons.primary.name}
                        onChange={(e) =>
                          handleWeaponChange("primary", "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="trait-range-row">
                      <Tooltip content={tooltips[character.weapons.primary.trait]}>
                        <TraitsSelect 
                          value={character.weapons.primary.trait}
                          onChange={(value) => handleWeaponChange('primary', 'trait', value)}
                        />
                      </Tooltip>
                      <RangesSelect 
                        value={character.weapons.primary.range}
                        onChange={(value) => handleWeaponChange('primary', 'range', value)}
                      />
                    </div>
                    <div className="damage-row DmgBonusType">
                      <div className="form-group">
                        <label>Die</label>
                        <select
                          name="pDamageDie"
                          value={character.weapons.primary.damageDie}
                          onChange={(e) =>
                            handleWeaponChange(
                              "primary",
                              "damageDie",
                              e.target.value as DamageDie
                            )
                          }
                        >
                          {["d2","d4", "d6", "d8", "d10", "d12", "d20"].map((die) => (
                            <option key={die} value={die}>
                              {die}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Bonus</label>
                        <input
                          name="pWeaponBonus"
                          type="number"
                          value={character.weapons.primary.damageBonus}
                          onChange={(e) =>
                            handleWeaponChange(
                              "primary",
                              "damageBonus",
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Dmg Type</label>
                        <select
                          value={character.weapons.primary.damageType}
                          onChange={(e) =>
                            handleWeaponChange(
                              "primary",
                              "damageType",
                              e.target.value
                            )
                          }
                        >
                          <option value="Physical">Physical</option>
                          <option value="Magical">Magical</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group feature">
                      <WeaponFeatureSelector 
                        features={character.weapons.primary.features}
                        onChange={(features) => handleWeaponChange('primary', 'features', features)}
                      />
                    </div>
                    <div className="form-group desc">
                      <label>Description</label>
                      <textarea 
                        value={character.weapons.primary.description}
                        onChange={(e) => handleWeaponChange('primary', 'description', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="weapon-card secondary box-container">
                <div className="headerSection header">
                  <h3>Secondary Weapon</h3>
                  <label className="toggle-weapon">
                    {character.weapons.secondary.enabled? 'Enabled' : 'Disabled'}
                    <input
                      type="checkbox"
                      checked={character.weapons.secondary.enabled}
                      onChange={toggleSecondaryWeapon}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>       
                {character.weapons.secondary.enabled && (
                  <>
                    <div className="form-group name">
                      <label>Name</label>
                      <input 
                        type="text" 
                        name="sWeaponName"
                        value={character.weapons.secondary.name}
                        onChange={(e) => 
                          handleWeaponChange('secondary', 'name', e.target.value)
                        }
                      />
                    </div>
                    <div className="trait-range-row">
                      <TraitsSelect 
                        value={character.weapons.secondary.trait}
                        onChange={(value) => handleWeaponChange('secondary', 'trait', value)}
                      />
                      <RangesSelect 
                        value={character.weapons.secondary.range}
                        onChange={(value) => handleWeaponChange('secondary', 'range', value)}
                      />
                    </div>
                    <div className="damage-row DmgBonusType">
                      <div className="form-group">
                        <label>Die</label>
                        <select
                          name="sDamageDie"
                          value={character.weapons.secondary.damageDie}
                          onChange={(e) => 
                            handleWeaponChange(
                              'secondary', 
                              'damageDie', 
                              e.target.value as DamageDie
                            )
                          }
                        >
                          {['d4', 'd6', 'd8', 'd12', 'd20'].map(die => (
                            <option key={die} value={die}>
                              {die}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Bonus</label>
                        <input 
                          name="sWeaponBonus"
                          type="number" 
                          value={character.weapons.secondary.damageBonus}
                          onChange={(e) => 
                            handleWeaponChange(
                              'secondary', 
                              'damageBonus', 
                              parseInt(e.target.value)
                            )
                          }
                          min="0"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Dmg Type</label>
                        <select
                          value={character.weapons.secondary.damageType}
                          onChange={(e) => 
                            handleWeaponChange(
                              'secondary', 
                              'damageType',
                              e.target.value
                            )
                          }
                        >
                          <option value="Physical">Physical</option>
                          <option value="Magical">Magical</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group feature">
                      <WeaponFeatureSelector 
                        features={character.weapons.secondary.features}
                        onChange={(features) => handleWeaponChange('secondary', 'features', features)}
                      />
                    </div>
                    <div className="form-group desc">
                      <label>Description</label>
                      <textarea 
                        value={character.weapons.secondary.description}
                        onChange={(e) => handleWeaponChange('secondary', 'description', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </details>
          <details className="collapsible-section">
            <summary>
              <span>Active Armor</span>
              <img
                className="chevron-icon"
                src="/i-cheveron_down-alt.svg"
                alt="▼"
              />
            </summary>
            <section className="armor-section">
              <div className="armor-card">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={character.activeArmor.name}
                    onChange={(e) => handleArmorChange("name", e.target.value)}
                  />
                </div>

                <div className="thresholds-row">
                  <div className="form-group">
                    <label>Minor</label>
                    <input
                      type="number"
                      value={character.activeArmor.minorThreshold}
                      onChange={(e) =>
                        handleArmorChange(
                          "minorThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Major</label>
                    <input
                      type="number"
                      value={character.activeArmor.majorThreshold}
                      onChange={(e) =>
                        handleArmorChange(
                          "majorThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Base Score</label>
                    <input
                      type="number"
                      value={character.activeArmor.baseScore}
                      onChange={(e) =>
                        handleArmorChange(
                          "baseScore",
                          parseInt(e.target.value)
                        )
                      }
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group feature">
                  <ArmorFeatureSelector 
                    features={character.activeArmor.features}
                    onChange={(features) => handleArmorChange("features", features)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={character.activeArmor.description}
                    onChange={(e) =>
                      handleArmorChange("description", e.target.value)
                    }
                  />
                </div>
              </div>
            </section>
          </details>
        </div>
      </div>
      <Tabber />
      <SaveToast />
    </div>
  );
}
