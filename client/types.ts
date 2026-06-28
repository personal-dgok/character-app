export interface Character {
  id: number;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  hp: number;
  max_hp: number;
  attack: number;
  defense: number;
  stage: number;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: number;
  character_id: number;
  title: string;
  description: string;
  reward_exp: number;
  reward_hp: number;
  reward_attack: number;
  reward_defense: number;
  is_daily: boolean;
  completed: boolean;
  quest_date: string;
  dayNumber: number;
  created_at: string;
}

export interface QuestInput {
  title: string;
  description: string;
  reward_exp: number;
  reward_hp?: number;
  reward_attack?: number;
  reward_defense?: number;
  dayNumber?: number;
}

export const STAGE_INFO = [
  { name: '요리 초보', description: '맛의 세계에 입문한 요리 꿈나무' },
  { name: '견습 요리사', description: '맛있는 요리를 위해 안전하고 성실히 배우는 중!' },
  { name: '전문 요리사', description: '스스로 레시피를 다루고 음식을 예쁘게 플레이팅하는 셰프' },
  { name: '마스터 셰프', description: '가족과 세상을 감동시키는 최고의 맛을 내는 거장' },
];

export function getStageInfo(stage: number): { name: string; description: string } {
  const idx = Math.max(0, Math.min(stage - 1, STAGE_INFO.length - 1));
  return STAGE_INFO[idx];
}

export function getExpForLevel(level: number): number {
  return 30;
}
