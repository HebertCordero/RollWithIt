import { useState } from 'react';
import { Link } from 'react-router-dom';
import './DiceRoller.css';

type DiceType = 'd12' | 'd20';
type RollMode = 'normal' | 'advantage';
type D20Mode = 'none' | 'hope' | 'fear' | 'both';

export default function DiceRoller() {
  const [hopeDie, setHopeDie] = useState<number>(1);
  const [fearDie, setFearDie] = useState<number>(1);
  const [advantageDie, setAdvantageDie] = useState<number>(0);
  const [d20Mode, setD20Mode] = useState<D20Mode>('none');
  const [rollMode, setRollMode] = useState<RollMode>('normal');
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<Array<[number, number, number]>>([]);

  const rollDice = (sides: number) => Math.floor(Math.random() * sides) + 1;

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);

    // Determine dice types
    const hopeSides = d20Mode === 'hope' || d20Mode === 'both' ? 20 : 12;
    const fearSides = d20Mode === 'fear' || d20Mode === 'both' ? 20 : 12;

    // Roll Hope & Fear
    const hopeResult = rollDice(hopeSides);
    const fearResult = rollDice(fearSides);
    const advantageResult = rollMode === 'advantage' ? rollDice(6) : 0;

    setHopeDie(hopeResult);
    setFearDie(fearResult);
    setAdvantageDie(advantageResult);

    // Save to history (max 3 entries)
    setRollHistory(prev => [[hopeResult, fearResult, advantageResult], ...prev.slice(0, 2)]);

    setTimeout(() => setIsRolling(false), 1000);
  };

  const totalResult = hopeDie + fearDie + (rollMode === 'advantage' ? advantageDie : 0);

  return (
    <div className="dice-roller">
      <h1>DaggerHeart Dice</h1>

      {/* D20 Mode Selector */}
      <div className="d20-mode-selector">
        <h3>D20 Mode</h3>
        <div className="mode-buttons">
          {(['none', 'hope', 'fear', 'both'] as D20Mode[]).map((mode) => (
            <button
              key={mode}
              className={`mode-btn ${d20Mode === mode ? 'active' : ''}`}
              onClick={() => setD20Mode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Roll Mode (Normal/Advantage) */}
      <div className="roll-mode-selector">
        <h3>Roll Mode</h3>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${rollMode === 'normal' ? 'active' : ''}`}
            onClick={() => setRollMode('normal')}
          >
            Normal
          </button>
          <button
            className={`mode-btn ${rollMode === 'advantage' ? 'active' : ''}`}
            onClick={() => setRollMode('advantage')}
          >
            Advantage (+d6)
          </button>
        </div>
      </div>

      {/* Dice Display */}
      <div className="dice-container">
        {/* Hope Die */}
        <div className={`die hope-die ${isRolling ? 'rolling' : ''} ${d20Mode === 'hope' || d20Mode === 'both' ? 'd20' : 'd12'}`}>
          <div className="die-value">{hopeDie}</div>
        </div>

        {/* Fear Die */}
        <div className={`die fear-die ${isRolling ? 'rolling' : ''} ${d20Mode === 'fear' || d20Mode === 'both' ? 'd20' : 'd12'}`}>
          <div className="die-value">{fearDie}</div>
        </div>

        {/* Advantage Die (only shown in Advantage mode) */}
        {rollMode === 'advantage' && (
          <div className={`die advantage-die ${isRolling ? 'rolling' : ''} d6`}>
            <div className="die-value">+{advantageDie}</div>
          </div>
        )}
      </div>

      {/* Total Result (always shown) */}
      <div className="total-result">
        Total: <span className="highlight">{totalResult}</span>
        {rollMode === 'advantage' && (
          <span className="breakdown"> ({hopeDie} + {fearDie} + {advantageDie})</span>
        )}
      </div>

      {/* Roll Button */}
      <button
        className="roll-btn"
        onClick={handleRoll}
        disabled={isRolling}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>

      {/* Roll History */}
      {rollHistory.length > 0 && (
        <div className="roll-history">
          <h3>Last Rolls</h3>
          {rollHistory.map(([hope, fear, advantage], i) => (
            <div key={i} className="history-entry">
              <span className="hope-result">{hope}+</span>
              <span className="fear-result">{fear}</span>
              {rollMode === 'advantage' && (
                <span className="advantage-result">+{advantage}</span>
              )}
              <span className="history-total">
                = {hope + fear + (rollMode === 'advantage' ? advantage : 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link to="/" className="home-link">Back to Character Sheet</Link>
    </div>
  );
}