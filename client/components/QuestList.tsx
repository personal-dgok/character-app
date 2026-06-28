import { CheckCircle2, Circle, Star, Heart, Sword, Shield } from 'lucide-react';
import type { Quest } from '../types';

interface QuestListProps {
  quests: Quest[];
  onToggle: (id: number, completed: boolean) => void;
}

function rewardIcon(reward: string): React.ReactNode {
  switch (reward) {
    case 'exp': return <Star size={12} className="r-exp" />;
    case 'hp': return <Heart size={12} className="r-hp" />;
    case 'attack': return <Sword size={12} className="r-atk" />;
    case 'defense': return <Shield size={12} className="r-def" />;
    default: return null;
  }
}

function rewardLabel(key: string, value: number): string {
  switch (key) {
    case 'exp': return `${value} EXP`;
    case 'hp': return `HP +${value}`;
    case 'attack': return `ATK +${value}`;
    case 'defense': return `DEF +${value}`;
    default: return '';
  }
}

export default function QuestList({ quests, onToggle }: QuestListProps) {
  if (quests.length === 0) {
    return (
      <div className="card quest-list">
        <h3>📋 오늘의 퀘스트</h3>
        <p className="empty-quests">아직 퀘스트가 없어요.<br />새 퀘스트를 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="card quest-list">
      <h3>📋 오늘의 퀘스트</h3>
      <ul className="quest-items">
        {quests.map((q) => (
          <li key={q.id} className={`quest-item ${q.completed ? 'completed' : ''}`}>
            <button
              className="quest-check"
              onClick={() => onToggle(q.id, !q.completed)}
              title={q.completed ? '취소' : '완료'}
            >
              {q.completed ? <CheckCircle2 size={22} className="icon-checked" /> : <Circle size={22} className="icon-unchecked" />}
            </button>
            <div className="quest-body">
              <span className="quest-title">{q.title}</span>
              {q.description && <span className="quest-desc">{q.description}</span>}
              <div className="quest-rewards">
                {q.reward_exp > 0 && (
                  <span className="reward-tag">{rewardIcon('exp')} {rewardLabel('exp', q.reward_exp)}</span>
                )}
                {q.reward_hp > 0 && (
                  <span className="reward-tag">{rewardIcon('hp')} {rewardLabel('hp', q.reward_hp)}</span>
                )}
                {q.reward_attack > 0 && (
                  <span className="reward-tag">{rewardIcon('attack')} {rewardLabel('attack', q.reward_attack)}</span>
                )}
                {q.reward_defense > 0 && (
                  <span className="reward-tag">{rewardIcon('defense')} {rewardLabel('defense', q.reward_defense)}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
