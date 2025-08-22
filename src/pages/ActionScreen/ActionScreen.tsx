import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ActionScreen.css';

type DamageDie = 'd4' | 'd6' | 'd8' | 'd12' | 'd20';
type ActionType = 
  | 'attack' 
  | 'act' 
  | 'spell' 
  | 'domain-card' 
  | 'group-attack' 
  | 'tag-team' 
  | 'move' 
  | 'short-rest' 
  | 'long-rest';

interface Weapon {
  name: string;
  traitRange: string;
  damageDie: DamageDie;
  damageBonus: number;
  damageType: string;
  feature: string;
}
interface Armor {
  name: string;
  minorThreshold: number;
  majorThreshold: number;
  baseScore: number;
  feature: string;
}
const actionRules: Record<ActionType, { title: string; description: string }> = {
  'attack': {
    title: "Basic Attack",
    description: "Roll your weapon's damage dice plus any bonuses. Compare to target's armor thresholds:\n\n• Below Minor: No effect\n• Minor+: Mark 1 stress\n• Major+: Mark 2 stress\n• Severe+: Mark 3 stress\n\nSpecial effects may apply based on weapon traits."
  },
  'act': {
    title: "Take Action",
    description: "When you attempt something risky or challenging:\n\n1. GM sets difficulty (1-3)\n2. Roll appropriate stat +d12\n3. On 10+: Full success\n4. On 7-9: Partial success with cost\n5. On 6-: Failure with consequence\n\nYou may mark stress to improve your result."
  },
  'spell': {
    title: "Cast Spell",
    description: "1. Declare spell effect\n2. Pay required stress cost\n3. Roll appropriate stat +d12\n\n• Arcane spells use Knowledge\n• Divine spells use Presence\n• Primal spells use Instinct\n\nOn failure, you may still expend the stress but the effect is diminished."
  },
  'domain-card': {
    title: "Play Domain Card",
    description: "When you play a domain card from your hand:\n\n• Declare the card's effect\n• Resolve immediately (no roll needed)\n• Discard or exhaust as required\n\nSome cards may require marking stress or have situational bonuses."
  },
  'group-attack': {
    title: "Group Attack",
    description: "When multiple characters attack together:\n\n1. Designate primary attacker\n2. Others provide teamwork bonuses\n3. Roll once with +1d6 per helper\n4. Split stress markers as desired\n\nMaximum 3 helpers. All participants must be able to reach the target."
  },
  'tag-team': {
    title: "Tag Team Roll",
    description: "When swapping positions with an ally:\n\n1. Both must be in close range\n2. Roll Agility +d12 (difficulty 1)\n3. On success, swap positions freely\n4. On failure, GM may impose:\n   - Opportunity attacks\n   - Partial movement\n   - Hazard exposure"
  },
  'move': {
    title: "Reposition",
    description: "If you're not already marking an action roll, or if you want to move farther than your close range you'll need to succeed on an agility roll to safely reposition yourself. The GM sets this difficulty depending on the situation. On a failure you might:\n\n• Move partial distance\n• Face opportunity attacks\n• Trigger hazards\n• Lose your turn"
  },
  'short-rest': {
    title: "Short Rest",
    description: "During a brief respite (10-15 mins):\n\n• Recover 1d6 HP\n• Remove 1 stress marker\n• Refresh 1 domain card\n• Limited to 2/day\n\nYou remain vulnerable to ambush during rests."
  },
  'long-rest': {
    title: "Long Rest",
    description: "After a full night's sleep:\n\n• Fully heal HP\n• Remove all stress\n• Refresh all domain cards\n• Regain special abilities\n\nRequires safe location. GM may interrupt with events."
  }
};

export default function ActionScreen() {
  const [primaryWeapon, setPrimaryWeapon] = useState<Weapon>({
    name: '',
    traitRange: '',
    damageDie: 'd6',
    damageBonus: 0,
    damageType: '',
    feature: ''
  });
  const [secondaryWeapon, setSecondaryWeapon] = useState<Weapon>({
    name: '',
    traitRange: '',
    damageDie: 'd6',
    damageBonus: 0,
    damageType: '',
    feature: ''
  });
  const [activeArmor, setActiveArmor] = useState<Armor>({
    name: '',
    minorThreshold: 6,
    majorThreshold: 12,
    baseScore: 0,
    feature: ''
  });
  const [activeModal, setActiveModal] = useState<ActionType | null>(null);

  const handleWeaponChange = (weaponType: 'primary' | 'secondary', field: keyof Weapon, value: string | number) => {
    if (weaponType === 'primary') {
      setPrimaryWeapon(prev => ({ ...prev, [field]: value }));
    } else {
      setSecondaryWeapon(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArmorChange = (field: keyof Armor, value: string | number) => {
    setActiveArmor(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="action-screen">
      <h1>Action Screen</h1>
      
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
            <div className="weapon-card primary">
            <h3>Primary Weapon</h3>
            <div className="form-group">
                <label>Name</label>
                <input 
                type="text" 
                value={primaryWeapon.name}
                onChange={(e) => handleWeaponChange('primary', 'name', e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Trait & Range</label>
                <input 
                type="text" 
                value={primaryWeapon.traitRange}
                onChange={(e) => handleWeaponChange('primary', 'traitRange', e.target.value)}
                />
            </div>
            <div className="damage-row">
                <div className="form-group">
                <label>Damage Die</label>
                <select
                    value={primaryWeapon.damageDie}
                    onChange={(e) => handleWeaponChange('primary', 'damageDie', e.target.value as DamageDie)}
                >
                    {['d4', 'd6', 'd8', 'd12', 'd20'].map(die => (
                    <option key={die} value={die}>{die}</option>
                    ))}
                </select>
                </div>
                
                <div className="form-group">
                <label>Bonus</label>
                <input 
                    type="number" 
                    value={primaryWeapon.damageBonus}
                    onChange={(e) => handleWeaponChange('primary', 'damageBonus', parseInt(e.target.value) || 0)}
                    min="0"
                />
                </div>
                
                <div className="form-group">
                <label>Damage Type</label>
                <input 
                    type="text" 
                    value={primaryWeapon.damageType}
                    onChange={(e) => handleWeaponChange('primary', 'damageType', e.target.value)}
                />
                </div>
            </div>
            <div className="form-group">
                <label>Special Feature</label>
                <textarea 
                value={primaryWeapon.feature}
                onChange={(e) => handleWeaponChange('primary', 'feature', e.target.value)}
                />
            </div>
            </div>
            <div className="weapon-card secondary">
            <h3>Secondary Weapon</h3>
                        <div className="form-group">
                <label>Name</label>
                <input 
                type="text" 
                value={secondaryWeapon.name}
                onChange={(e) => handleWeaponChange('primary', 'name', e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Trait & Range</label>
                <input 
                type="text" 
                value={secondaryWeapon.traitRange}
                onChange={(e) => handleWeaponChange('primary', 'traitRange', e.target.value)}
                />
            </div>
            <div className="damage-row">
                <div className="form-group">
                <label>Damage Die</label>
                <select
                    value={secondaryWeapon.damageDie}
                    onChange={(e) => handleWeaponChange('primary', 'damageDie', e.target.value as DamageDie)}
                >
                    {['d4', 'd6', 'd8', 'd12', 'd20'].map(die => (
                    <option key={die} value={die}>{die}</option>
                    ))}
                </select>
                </div>
                
                <div className="form-group">
                <label>Bonus</label>
                <input 
                    type="number" 
                    value={secondaryWeapon.damageBonus}
                    onChange={(e) => handleWeaponChange('primary', 'damageBonus', parseInt(e.target.value) || 0)}
                    min="0"
                />
                </div>
                
                <div className="form-group">
                <label>Damage Type</label>
                <input 
                    type="text" 
                    value={secondaryWeapon.damageType}
                    onChange={(e) => handleWeaponChange('primary', 'damageType', e.target.value)}
                />
                </div>
            </div>
            <div className="form-group">
                <label>Special Feature</label>
                <textarea 
                value={secondaryWeapon.feature}
                onChange={(e) => handleWeaponChange('primary', 'feature', e.target.value)}
                />
            </div>
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
            <h2>Active Armor</h2>
            <div className="armor-card">
            <div className="form-group">
                <label>Name</label>
                <input 
                type="text" 
                value={activeArmor.name}
                onChange={(e) => handleArmorChange('name', e.target.value)}
                />
            </div>
            
            <div className="thresholds-row">
                <div className="form-group">
                <label>Minor Threshold</label>
                <input 
                    type="number" 
                    value={activeArmor.minorThreshold}
                    onChange={(e) => handleArmorChange('minorThreshold', parseInt(e.target.value) || 0)}
                    min="0"
                />
                </div>
                
                <div className="form-group">
                <label>Major Threshold</label>
                <input 
                    type="number" 
                    value={activeArmor.majorThreshold}
                    onChange={(e) => handleArmorChange('majorThreshold', parseInt(e.target.value) || 0)}
                    min="0"
                />
                </div>
                
                <div className="form-group">
                <label>Base Score</label>
                <input 
                    type="number" 
                    value={activeArmor.baseScore}
                    onChange={(e) => handleArmorChange('baseScore', parseInt(e.target.value) || 0)}
                    min="0"
                />
                </div>
            </div>
            
            <div className="form-group">
                <label>Special Feature</label>
                <textarea 
                value={activeArmor.feature}
                onChange={(e) => handleArmorChange('feature', e.target.value)}
                />
            </div>
            </div>
        </section>
      </details>
      <div className="action-screen">
        <h1>Actions</h1>
        
        <div className="action-grid">
            {Object.entries(actionRules).map(([actionType, { title }]) => (
            <button
                key={actionType}
                className={`action-btn ${actionType}`}
                onClick={() => setActiveModal(actionType as ActionType)}
            >
                {title}
            </button>
            ))}
        </div>

        {activeModal && (
            <div className="action-modal">
            <div className="modal-content">
                <h2>{actionRules[activeModal].title}</h2>
                <div className="modal-rules">
                {actionRules[activeModal].description.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
                </div>
                <button 
                className="modal-close"
                onClick={() => setActiveModal(null)}
                >
                Got It!
                </button>
            </div>
            </div>
        )}
        </div>
      <Link to="/" className="back-link">Back to Character Sheet</Link>
    </div>
  );
}