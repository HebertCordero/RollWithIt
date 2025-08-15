import { useState, useEffect } from 'react';
import { saveCharacterData, loadCharacterData } from '../../utils/storage';
import type { Character } from '../../types/character';
import './Home.css';

const statDescriptions = {
  AGILITY: 'Sprint, Leap, Maneuver',
  STRENGTH: 'Lift, Smash, Grapple',
  FINESSE: 'Control, Hide, Tinker',
  INSTINCT: 'Perceive, Sense, Navigate',
  PRESENCE: 'Charm, Perform, Deceive',
  KNOWLEDGE: 'Recall, Analyze, Comprehend',
};

const initialCharacter: Character = {
  name: '',
  class: '',
  level: 1,
  origin: '',
  domain: '',
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
      locked: false
    }))
  }
};

interface SaveStatus {
  loading: boolean;
  success: boolean;
  error?: string;
}

export default function CharacterSheet() {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    loading: false,
    success: false,
    error: undefined
  });

  useEffect(() => {
    const savedData = loadCharacterData();
    if (savedData) {
      console.log('Loaded saved data:', savedData);
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
                ? savedData.armor.slots.map((slot: any) => ({
                    ...initialCharacter.armor.slots[0],
                    ...slot
                  }))
                : initialCharacter.armor.slots
            }
          : initialCharacter.armor
      });
    }
  }, []);
  
  /*
    useEffect(() => {
      console.log('Loaded character:', character);
    }, [character]);
  */

  const handleSave = async () => {
    setSaveStatus({ loading: true, success: false });
    const result = saveCharacterData(character);
    
    setSaveStatus({
      loading: false,
      success: result.success,
      error: result.error
    });

    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, success: false, error: undefined }));
    }, 3000);
  };

  const SaveToast = () => {
    if (saveStatus.loading) return (
      <div className="toast loading">Saving...</div>
    );
    if (saveStatus.success) return (
      <div className="toast success">Character saved successfully!</div>
    );
    if (saveStatus.error) return (
      <div className="toast error">Error: {saveStatus.error}</div>
    );
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCharacter(prev => ({
      ...prev,
      level: Math.max(1, Math.min(10, value)),
    }));
  };
  const handleStatChange = (stat: keyof Character['stats'], value: number) => {
    setCharacter(prev => ({
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
  const toggleStatMark = (stat: keyof Character['stats']) => {
    setCharacter(prev => ({
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
    setCharacter(prev => ({
      ...prev,
      evasion: {
        ...prev.evasion,
        value: Math.max(0, Math.min(10,value))
      }
    }));
  };
  const handleArmorMaxChange = (value: number) => {
    setCharacter(prev => ({
      ...prev,
      armor: {
        ...prev.armor,
        max: Math.max(0, Math.min(12, value))
      }
    }));
  };
  const toggleArmorSlot = (index: number) => {
    setCharacter(prev => {
      const newSlots = [...prev.armor.slots];
      newSlots[index] = {
        ...newSlots[index],
        used: !newSlots[index].used
      };
      return {
        ...prev,
        armor: {
          ...prev.armor,
          slots: newSlots
        }
      };
    });
  };
  const toggleArmorSlotLock = (index: number) => {
    setCharacter(prev => {
      const newSlots = [...prev.armor.slots];
      newSlots[index] = {
        ...newSlots[index],
        locked: !newSlots[index].locked
      };
      return {
        ...prev,
        armor: {
          ...prev.armor,
          slots: newSlots
        }
      };
    });
  };
  const toggleEvasionLock = () => {
    setCharacter(prev => ({
      ...prev,
      evasion: {
        ...prev.evasion,
        locked: !prev.evasion.locked
      }
    }));
  };
  const toggleArmorMaxLock = () => {
    setCharacter(prev => ({
      ...prev,
      armor: {
        ...prev.armor,
        locked: !prev.armor.locked
      }
    }));
  };


  return (
    <div>
      <div className="character-sheet">
        <div className='title'>
          <h1>RollWithIt</h1>
          <p>DaggerHeart Companion App</p>
        </div>    
        <div className="character-info">
          <div className="info-grid">
            <div className='info-col'>
              <div className="info-cell name">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={character.name}
                  onChange={handleInputChange}
                  placeholder="Lyra the Smith"
                />
              </div>
              <div className="info-cell origin">
                <label>Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={character.origin}
                  onChange={handleInputChange}
                  placeholder="Elf Highborn"
                />
              </div>
            </div>
            
            <div className='info-col'>
              <div className="info-cell class">
                <label>Class</label>
                <input
                  type="text"
                  name="class"
                  value={character.class}
                  onChange={handleInputChange}
                  placeholder="Bard: Wordsmith"
                />
              </div>
              <div className="info-cell domain">
                <label>Domain</label>
                <input
                  type="text"
                  name="domain"
                  value={character.domain}
                  onChange={handleInputChange}
                  placeholder="Grace Codex"
                />
              </div>
            </div>
            
            <div className='info-col'>
              <div className="info-cell level">
                <label>Level</label>
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
        <div className="stats-section">
          <h2>Character Stats</h2>
          <div className="stats-grid">
            {Object.entries(character.stats).map(([statKey, statValue]) => (
              <div key={statKey} className="stat-cell">
                <div className="stat-header">
                  <span 
                    className="stat-name"
                    title={statDescriptions[statKey as keyof typeof statDescriptions]}
                  >
                    {statKey}
                  </span>
                  <button 
                    className={`mark-btn ${statValue.locked ? 'locked' : ''}`}
                    onClick={() => toggleStatMark(statKey as keyof Character['stats'])}
                    title={statValue.locked ? "Locked" : "Click to mark for +1 bonus"}
                  >
                    {statValue.locked ? <img className="icon" src="/i-locked.svg" alt="Locked" /> : <img className="icon" src="/i-unlocked.svg" alt="Unlocked" />}
                  </button>
                </div>
                <div className="stat-value">
                  <button 
                    onClick={() => handleStatChange(statKey as keyof Character['stats'], statValue.value - 1)}
                    disabled={statValue.value <= -3 || statValue.locked}
                  >
                    -
                  </button>
                  <span>{statValue.value}</span>
                  <button 
                    onClick={() => handleStatChange(statKey as keyof Character['stats'], statValue.value + 1)}
                    disabled={statValue.value >= 3 || statValue.locked}
                  >
                    +
                  </button>
                </div>
                <div className="stat-description">
                  {statDescriptions[statKey as keyof typeof statDescriptions]}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="defense-section">
          <h3>Defense</h3>
          <div className="defense-row">
            <div className="defense-stat">
              <div className="stat-header">
                <span>Evasion</span>
                <button 
                  className={`lock-btn ${character.evasion.locked ? 'locked' : ''}`}
                  onClick={toggleEvasionLock}
                  title={character.evasion.locked ? "Unlock evasion" : "Lock evasion"}
                >
                  {character.evasion.locked ? 
                    <img className="icon" src="/i-locked.svg" alt="Locked" /> : 
                    <img className="icon" src="/i-unlocked.svg" alt="Unlocked" />}
                </button>
              </div>
              <div className="stat-value">
                <button 
                  onClick={() => handleEvasionChange(character.evasion.value - 1)}
                  disabled={character.evasion.value <= 0 || character.evasion.locked}
                >
                  -
                </button>
                <span>{character.evasion.value}</span>
                <button 
                  onClick={() => handleEvasionChange(character.evasion.value + 1)}
                  disabled={character.evasion.value >= 10 || character.evasion.locked}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="defense-stat">
              <div className="stat-header">
                <span>Armor Max</span>
                <button 
                  className={`lock-btn ${character.armor.locked ? 'locked' : ''}`}
                  onClick={toggleArmorMaxLock}
                  title={character.armor.locked ? "Unlock armor" : "Lock armor"}
                >
                  {character.armor.locked ? 
                    <img className="icon" src="/i-locked.svg" alt="Locked" /> : 
                    <img className="icon" src="/i-unlocked.svg" alt="Unlocked" />}
                </button>
              </div>
              <div className="stat-value">
                <button 
                  onClick={() => handleArmorMaxChange(character.armor.max - 1)}
                  disabled={character.armor.max <= 0 || character.armor.locked}
                >
                  -
                </button>
                <span>{character.armor.max}</span>
                <button 
                  onClick={() => handleArmorMaxChange(character.armor.max + 1)}
                  disabled={character.armor.max >= 12 || character.armor.locked}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="armor-slots">
            <h3>Armor Slots</h3>
            <div className="slots-grid">
              {character.armor.slots.slice(0, character.armor.max).map((slot, index) => (
                <button
                  key={index}
                  className={`armor-slot ${slot.used ? 'used' : ''}`}
                  onClick={() => !slot.locked && toggleArmorSlot(index)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleArmorSlotLock(index);
                  }}
                  title={slot.locked ? 
                    "Right-click to unlock" : 
                    `Left-click to ${slot.used ? 'repair' : 'use'} armor\nRight-click to lock`}
                >
                  {slot.used ? 
                    <img className="i-armorSlot" src="/i-shield_broken.svg" alt="Used Armor" /> : 
                    <img className="i-armorSlot" src="/i-shield_available.svg" alt="Available Armor" />}
                  {slot.locked && <span className="slot-lock">🔒</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="save-section">
        <button 
          className="save-btn"
          onClick={handleSave}
          disabled={saveStatus.loading}
          aria-label="Save all changes"
        >
          {saveStatus.loading ? 'Saving...' : 'Save'}
        </button>
      </div>  
      <SaveToast />
    </div>
  );
}