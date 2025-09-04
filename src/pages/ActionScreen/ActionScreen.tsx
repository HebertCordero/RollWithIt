import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ActionScreen.css';

type ActionType = 
  | 'attack' 
  | 'act' 
  | 'spell' 
  | 'domain-card' 
  | 'group-attack' 
  | 'tag-team' 
  | 'move' 
  | 'short-rest' 
  | 'long-rest'
  | 'defend'
  | 'aid'
  | 'improvise'
  | 'recall'
  | 'social'
  | 'environment';

type RollResult = {
  hopeDie: number;
  fearDie: number;
  total: number;
  outcome: 'critical-success' | 'success-hope' | 'success-fear' | 'failure-hope' | 'failure-fear';
  hopeTokens: number;
  fearTokens: number;
};

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
  },
  'defend': {
    title: "Defend",
    description: "When you focus on protection:\n\n• Grant +2 evasion to yourself or adjacent ally\n• Lasts until your next turn\n• You can't make attacks while defending\n• Can be maintained as an ongoing action\n\nPerfect for protecting wounded allies or holding a position."
  },
  'aid': {
    title: "Aid Ally",
    description: "When you help another character:\n\n• Grant +1d6 to their next roll\n• Must be in close range and able to assist\n• Describe how you're helping\n• Can't aid the same roll multiple times\n\nExamples: providing cover, shouting advice, physical assistance."
  },
  'improvise': {
    title: "Improvise",
    description: "When you try something creative or unexpected:\n\n• GM sets difficulty based on creativity\n• Roll appropriate stat +d12\n• Success creates advantage or solves problem\n• Failure may have humorous or dramatic consequences\n\nEncouraged! DaggerHeart rewards creative thinking."
  },
  'recall': {
    title: "Recall Knowledge",
    description: "When seeking information:\n\n• Roll Knowledge +d12\n• Difficulty based on obscurity (1-3)\n• On success: gain useful information\n• On partial: limited or vague information\n• On failure: misinformation or no recall\n\nCan identify creature weaknesses, history, or magic properties."
  },
  'social': {
    title: "Social Interaction",
    description: "When persuading, deceiving, or intimidating:\n\n• Roll Presence +d12\n• Difficulty based on target's disposition\n• Consider using Hope for important social rolls\n• Outcomes range from full cooperation to hostility\n\nRemember: NPCs have motivations and limits."
  },
  'environment': {
    title: "Environment Interaction",
    description: "When interacting with the world:\n\n• Push objects, pull levers, create distractions\n• Roll appropriate stat (often Strength or Agility)\n• Difficulty based on environmental factors\n• Success can create advantages or bypass obstacles\n\nThink creatively about your surroundings!"
  }
};

const actionCategories = {
  combat: ['attack', 'defend', 'group-attack', 'move', 'tag-team'],
  magic: ['spell', 'domain-card'],
  support: ['aid', 'recall', 'social'],
  recovery: ['short-rest', 'long-rest'],
  creative: ['improvise', 'environment', 'act']
};

const quickReference = {
  difficulty: [
    { level: "Simple", value: 1, description: "Routine tasks, no opposition" },
    { level: "Standard", value: 2, description: "Challenging but achievable" },
    { level: "Hard", value: 3, description: "Requires effort and luck" },
    { level: "Extreme", value: 4, description: "Nearly impossible feats" }
  ],
  outcomes: [
    { roll: "12+", result: "Critical Success", effect: "Exceptional result, may gain bonus" },
    { roll: "10-11", result: "Full Success", effect: "Achieve intended goal" },
    { roll: "7-9", result: "Partial Success", effect: "Success with cost or complication" },
    { roll: "6 or less", result: "Failure", effect: "Fail with additional consequence" }
  ]
};

export default function ActionScreen() {
  const [activeModal, setActiveModal] = useState<ActionType | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [rollResult, setRollResult] = useState<RollResult | null>(null);
  const [difficulty, setDifficulty] = useState<number>(2);
  const [statBonus, setStatBonus] = useState<number>(0);

  const rollDaggerHeartDice = () => {
    const hopeDie = Math.floor(Math.random() * 12) + 1;
    const fearDie = Math.floor(Math.random() * 12) + 1;
    const total = hopeDie + fearDie + statBonus;
    
    let outcome: RollResult['outcome'];
    let hopeTokens = 0;
    let fearTokens = 0;

    if (hopeDie === fearDie) {
      // Critical Success - regardless of total
      outcome = 'critical-success';
      hopeTokens = 1;
    } else if (total >= difficulty) {
      // Success
      if (hopeDie > fearDie) {
        outcome = 'success-hope';
        hopeTokens = 1;
      } else {
        outcome = 'success-fear';
        fearTokens = 1;
      }
    } else {
      // Failure
      if (hopeDie > fearDie) {
        outcome = 'failure-hope';
      } else {
        outcome = 'failure-fear';
        fearTokens = 1;
      }
    }

    setRollResult({
      hopeDie,
      fearDie,
      total,
      outcome,
      hopeTokens,
      fearTokens
    });
  };

  const getOutcomeDescription = (outcome: RollResult['outcome']) => {
    switch (outcome) {
      case 'critical-success':
        return "CRITICAL SUCCESS! Amazing result with bonus benefits!";
      case 'success-hope':
        return "SUCCESS with HOPE! You gain a Hope token.";
      case 'success-fear':
        return "SUCCESS with FEAR! The GM gains a Fear token.";
      case 'failure-hope':
        return "FAILURE with HOPE! No tokens gained, but no additional complications.";
      case 'failure-fear':
        return "FAILURE with FEAR! The GM gains a Fear token and complications arise.";
    }
  };

  const resetRoll = () => {
    setRollResult(null);
  };

  return (
    <div className="action-screen">
      <h1>Action Screen</h1>
      
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
              onClick={() => {
                setActiveModal(actionType as ActionType);
                resetAction();
              }}
            >
              {title}
            </button>
          ))}
      </div>

      {/* Action Modal */}
      {/* Action Modal */}
      {activeModal && (
        <div className="action-modal">
          <div className="modal-content">
            <h2>{actionRules[activeModal].title}</h2>
            
            {/* Difficulty Selector */}
            <div className="difficulty-selector">
              <label>Difficulty: </label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(Number(e.target.value))}
              >
                <option value={1}>Simple (1)</option>
                <option value={2}>Standard (2)</option>
                <option value={3}>Hard (3)</option>
                <option value={4}>Extreme (4)</option>
              </select>
            </div>

            {/* Stat Bonus Selector */}
            <div className="stat-bonus-selector">
              <label>Stat Bonus: </label>
              <select 
                value={statBonus} 
                onChange={(e) => setStatBonus(Number(e.target.value))}
              >
                <option value={-3}>-3</option>
                <option value={-2}>-2</option>
                <option value={-1}>-1</option>
                <option value={0}>0</option>
                <option value={1}>+1</option>
                <option value={2}>+2</option>
                <option value={3}>+3</option>
              </select>
            </div>

            {/* Roll Button */}
            <button 
              className="roll-button"
              onClick={rollDaggerHeartDice}
            >
              Roll 2d12 (Hope + Fear) + Stat
            </button>

            {/* Roll Results */}
            {rollResult && (
              <div className={`dice-result ${rollResult.outcome}`}>
                <div className="dice-rolls">
                  <div className="die hope-die">
                    <span className="die-label">Hope</span>
                    <span className="die-value">{rollResult.hopeDie}</span>
                  </div>
                  <div className="die fear-die">
                    <span className="die-label">Fear</span>
                    <span className="die-value">{rollResult.fearDie}</span>
                  </div>
                  <div className="die total">
                    <span className="die-label">Total</span>
                    <span className="die-value">{rollResult.total}</span>
                  </div>
                </div>
                
                <div className="outcome-result">
                  <h3>{getOutcomeDescription(rollResult.outcome)}</h3>
                  <div className="tokens-gained">
                    {rollResult.hopeTokens > 0 && (
                      <span className="hope-token">+{rollResult.hopeTokens} Hope</span>
                    )}
                    {rollResult.fearTokens > 0 && (
                      <span className="fear-token">+{rollResult.fearTokens} Fear</span>
                    )}
                  </div>
                </div>

                <button onClick={resetRoll} className="reroll-button">
                  Roll Again
                </button>
              </div>
            )}

            {/* Rules Description */}
            <div className="modal-rules">
              {actionRules[activeModal].description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <button 
              className="modal-close"
              onClick={() => {
                setActiveModal(null);
                resetRoll();
                setDifficulty(2);
                setStatBonus(0);
              }}
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* ... (keep your quick reference section) ... */}

      <Link to="/" className="back-link">Back to Character Sheet</Link>
    </div>
  );
}