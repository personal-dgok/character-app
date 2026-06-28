import { useState } from 'react';
import { Plus, Star, Heart, Sword, Shield, X } from 'lucide-react';
import type { QuestInput } from '../types';

interface QuestFormProps {
  onSubmit: (input: QuestInput) => void;
}

interface RewardField {
  key: string;
  label: string;
  icon: React.ReactNode;
  value: number;
}

const DEFAULT_REWARDS: RewardField[] = [
  { key: 'reward_exp', label: '경험치', icon: <Star size={14} />, value: 30 },
  { key: 'reward_hp', label: '체력', icon: <Heart size={14} />, value: 5 },
  { key: 'reward_attack', label: '공격력', icon: <Sword size={14} />, value: 1 },
  { key: 'reward_defense', label: '방어력', icon: <Shield size={14} />, value: 1 },
];

export default function QuestForm({ onSubmit }: QuestFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewards, setRewards] = useState<RewardField[]>(DEFAULT_REWARDS.map(r => ({ ...r })));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const input: QuestInput = {
      title: title.trim(),
      description: description.trim(),
      reward_exp: rewards.find(r => r.key === 'reward_exp')?.value ?? 30,
      reward_hp: rewards.find(r => r.key === 'reward_hp')?.value ?? 0,
      reward_attack: rewards.find(r => r.key === 'reward_attack')?.value ?? 0,
      reward_defense: rewards.find(r => r.key === 'reward_defense')?.value ?? 0,
    };

    onSubmit(input);
    setTitle('');
    setDescription('');
    setRewards(DEFAULT_REWARDS.map(r => ({ ...r })));
    setOpen(false);
  };

  const updateReward = (key: string, value: string) => {
    setRewards(prev => prev.map(r => r.key === key ? { ...r, value: Math.max(0, parseInt(value) || 0) } : r));
  };

  if (!open) {
    return (
      <button className="btn btn-primary add-quest-btn" onClick={() => setOpen(true)}>
        <Plus size={18} />
        <span>새 퀘스트</span>
      </button>
    );
  }

  return (
    <form className="card quest-form" onSubmit={handleSubmit}>
      <div className="quest-form-header">
        <h3>새 퀘스트</h3>
        <button type="button" className="btn btn-icon" onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <label className="field">
        <span>퀘스트 제목</span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: 30분 운동하기"
          required
        />
      </label>

      <label className="field">
        <span>설명 (선택)</span>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="퀘스트에 대한 설명을 입력하세요"
        />
      </label>

      <div className="rewards-section">
        <span>보상</span>
        <div className="rewards-grid">
          {rewards.map(r => (
            <label key={r.key} className="reward-field">
              {r.icon}
              <input
                type="number"
                value={r.value}
                onChange={e => updateReward(r.key, e.target.value)}
                min={0}
              />
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        <Plus size={16} />
        <span>추가하기</span>
      </button>
    </form>
  );
}
