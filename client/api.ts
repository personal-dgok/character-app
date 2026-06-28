import type { Character, Quest, QuestInput } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'API error');
  }
  return res.json();
}

export function getCharacter(): Promise<Character> {
  return request<Character>('/character');
}

export function resetCharacter(): Promise<Character> {
  return request<Character>('/character/reset', { method: 'POST' });
}

export function getQuests(): Promise<Quest[]> {
  return request<Quest[]>('/quests');
}

export function createQuest(input: QuestInput): Promise<Quest> {
  return request<Quest>('/quests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function completeQuest(id: number, completed: boolean): Promise<Quest> {
  return request<Quest>(`/quests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}
