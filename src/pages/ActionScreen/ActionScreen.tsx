import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ActionScreen.css';

type ActionType = 
  | 'action-roll'
  | 'trait-roll'
  | 'spellcast-roll'
  | 'reaction-roll'
  | 'group-action'
  | 'tag-team'
  | 'attack'
  | 'move'
  | 'short-rest'
  | 'long-rest';

const actionRules: Record<ActionType, { title: string; description: string }> = {
  'action-roll': {
    title: "Action Roll",
    description: `When you attempt something difficult or risky:\n\n• Roll 2d12 (Hope + Fear dice)\n• Add appropriate trait bonus\n• GM sets Difficulty based on circumstances\n• Hope > Fear: You gain Hope token\n• Fear > Hope: GM gains Fear token\n• Equal dice: Critical success!\n\nNo roll is ever "nothing happens" - the story always evolves based on the outcome.`
  },
  'trait-roll': {
    title: "Trait Roll",
    description: `When a feature specifies a trait to use:\n\n• Format: "[Trait] Roll (Difficulty)"\n• Examples: "Agility Roll (12)", "Knowledge Roll (10)"\n• Uses the same mechanics as action rolls\n• Affected by features that modify the specified trait\n\nIf no Difficulty is specified, GM sets it based on circumstances.`
  },
  'spellcast-roll': {
    title: "Spellcast Roll",
    description: `When casting spells or using magical features:\n\n• Use your Spellcast trait (determined by subclass)\n• Successful roll activates the spell effect\n• Spellcast rolls that damage targets are also attack rolls\n• You can maintain multiple spells simultaneously\n• GM can spend Fear to end temporary effects\n\nSpells end when specified, when you choose, or at natural story moments.`
  },
  'reaction-roll': {
    title: "Reaction Roll",
    description: `When responding to attacks or hazards:\n\n• Made in response to imminent effects\n• Uses same mechanics but no Hope/Fear generation\n• No additional GM moves triggered\n• Others can't aid with Help an Ally\n• Critical success: Ignore all effects completely\n\nPerfect for dodging, blocking, or resisting dangerous situations.`
  },
  'group-action': {
    title: "Group Action",
    description: `When multiple PCs work together:\n\n• Choose one leader to make action roll\n• Others make reaction rolls describing collaboration\n• Leader gets +1 per successful helper, -1 per failure\n• All rolls use appropriate traits for the situation\n• Great for complex tasks requiring teamwork\n\nExample: Forcing open a heavy door while under attack.`
  },
  'tag-team': {
    title: "Tag Team",
    description: `Special combo move (once per session per player):\n\n• Spend 3 Hope to initiate\n• Describe unique combined action with another PC\n• Both make action rolls, choose one result for both\n• Hope result: All involved gain Hope\n• Fear result: GM gains Fear per PC involved\n• Combined attacks: Total damage as single source\n\nEpic moments that change the course of battle!`
  },
  'attack': {
    title: "Attack",
    description: `When making weapon or damaging attacks:\n\n• Roll weapon damage dice + bonuses\n• Compare to target's armor thresholds:\n  - Below Minor: No effect\n  - Minor+: Mark 1 stress\n  - Major+: Mark 2 stress  \n  - Severe+: Mark 3 stress\n• Apply weapon traits and special effects\n\nSome attacks may require action rolls to hit first.`
  },
  'move': {
    title: "Movement & Positioning",
    description: `When changing position in combat:\n\n• Basic movement within close range is free\n• Longer moves may require Agility rolls\n• Difficult terrain increases Difficulty\n• Failure may trigger opportunity attacks or hazards\n• Positioning affects line of sight, cover, and tactics\n\nStrategic movement can create advantages in battle.`
  },
  'short-rest': {
    title: "Short Rest",
    description: `Brief respite (10-15 minutes):\n\n• Recover 1d6 HP\n• Remove 1 stress marker\n• Refresh 1 domain card\n• Limited to 2 times per day\n• Remain vulnerable to interruption\n\nUse during moments of relative safety to catch your breath.`
  },
  'long-rest': {
    title: "Long Rest",
    description: `Full recovery (overnight):\n\n• Fully heal all HP\n• Remove all stress markers\n• Refresh all domain cards\n• Regain spent special abilities\n• Requires truly safe location\n• GM may interrupt with story events\n\nComplete reset for the next day's adventures.`
  }
};

const actionCategories = {
  'basic': ['action-roll', 'trait-roll', 'spellcast-roll'],
  'reactions': ['reaction-roll', 'group-action', 'tag-team'],
  'combat': ['attack', 'move'],
  'recovery': ['short-rest', 'long-rest']
};

export default function ActionScreen() {
  const [activeModal, setActiveModal] = useState<ActionType | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  return (
    <div className="action-screen">
      <div className="action-header">
        <h1>DaggerHeart Actions</h1>
        <p className="subtitle">How to resolve different types of actions</p>
      </div>

      {/* Quick Reference */}
      <div className="quick-reference">
        <h2>Core Mechanics</h2>
        <div className="reference-grid">
          <div className="reference-item">
            <h3>Hope & Fear Dice</h3>
            <p>Roll 2d12 - one Hope (positive), one Fear (negative)</p>
          </div>
          <div className="reference-item">
            <h3>Critical Success</h3>
            <p>When Hope & Fear dice show equal numbers</p>
          </div>
          <div className="reference-item">
            <h3>Difficulty</h3>
            <p>Set by GM based on circumstances (typically 8-14)</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="action-categories">
        <button 
          className={activeCategory === 'all' ? 'active' : ''}
          onClick={() => setActiveCategory('all')}
        >
          All Actions
        </button>
        {Object.entries(actionCategories).map(([category]) => (
          <button
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Action Grid */}
      <div className="action-grid">
        {Object.entries(actionRules)
          .filter(([actionType]) => 
            activeCategory === 'all' || 
            actionCategories[activeCategory as keyof typeof actionCategories]?.includes(actionType as ActionType)
          )
          .map(([actionType, { title }]) => (
            <button
              key={actionType}
              className={`action-btn ${actionType}`}
              onClick={() => setActiveModal(actionType as ActionType)}
            >
              {title}
            </button>
          ))}
      </div>

      {/* Action Modal */}
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
              Understand
            </button>
          </div>
        </div>
      )}

      <Link to="/" className="back-link">Back to Character Sheet</Link>
    </div>
  );
}