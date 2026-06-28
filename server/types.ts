export interface Character {
  id: number;
  name: string;
  level: number;
  experience: number;
  experience_to_next: number;
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
  day_number?: number;
  created_at: string;
}

export interface QuestInput {
  title: string;
  description: string;
  reward_exp: number;
  reward_hp?: number;
  reward_attack?: number;
  reward_defense?: number;
  day_number?: number;
}

export interface DbRow {
  [key: string]: unknown;
}

/**
 * 30-day Chef Daily Quest Leveling:
 * Every 30 EXP levels up the character.
 */
export function getExpForLevel(level: number): number {
  return 30;
}

/**
 * 4 growth stages of a Chef:
 * Stage 1 (Lv. 1-5): 요리 초보
 * Stage 2 (Lv. 6-10): 견습 요리사
 * Stage 3 (Lv. 11-15): 전문 요리사
 * Stage 4 (Lv. 16+): 마스터 셰프
 */
export function getStage(level: number): number {
  if (level >= 16) return 4;
  if (level >= 11) return 3;
  if (level >= 6) return 2;
  return 1;
}

/**
 * 스탯 증가 보너스
 */
export function getLevelUpStats(level: number): { max_hp: number; attack: number; defense: number } {
  return {
    max_hp: 10,
    attack: 2,
    defense: 1,
  };
}
