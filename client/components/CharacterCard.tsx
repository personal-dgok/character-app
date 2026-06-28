import { Egg, Sprout, Flower2, Gem, Heart, Sword, Shield, Star } from 'lucide-react';
import type { Character } from '../types';
import { getStageInfo, getExpForLevel } from '../types';

const STAGE_ICONS = [Egg, Sprout, Flower2, Gem];

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const stage = getStageInfo(character.stage);
  const StageIcon = STAGE_ICONS[Math.min(character.stage - 1, STAGE_ICONS.length - 1)];
  const expNeeded = getExpForLevel(character.level);
  const expPercent = Math.min((character.experience / expNeeded) * 100, 100);
  const hpPercent = (character.hp / character.max_hp) * 100;

  return (
    <div className="card character-card">
      <div className="character-visual">
        <div className="stage-icon-wrapper">
          <StageIcon size={72} className={`stage-icon stage-${character.stage}`} />
        </div>
        <div className="stage-badge">Lv.{character.level} {stage.name}</div>
      </div>

      <h2 className="character-name">{character.name}</h2>
      <p className="stage-desc">{stage.description}</p>

      <div className="stat-bar-row">
        <div className="stat-label">
          <Star size={14} />
          <span>경험치</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill bar-exp" style={{ width: `${expPercent}%` }} />
        </div>
        <span className="stat-value">{character.experience} / {expNeeded}</span>
      </div>

      <div className="stat-bar-row">
        <div className="stat-label">
          <Heart size={14} />
          <span>체력</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill bar-hp" style={{ width: `${hpPercent}%` }} />
        </div>
        <span className="stat-value">{character.hp} / {character.max_hp}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <Sword size={16} />
          <span>공격력</span>
          <strong>{character.attack}</strong>
        </div>
        <div className="stat-item">
          <Shield size={16} />
          <span>방어력</span>
          <strong>{character.defense}</strong>
        </div>
      </div>
    </div>
  );
}
