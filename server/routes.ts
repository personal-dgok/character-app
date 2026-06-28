import { Router, type Request, type Response } from 'express';
import pool, { seedChefQuests } from './db';
import { getExpForLevel, getStage } from './types';
import type { DbRow } from './types';

const router = Router();

function toCamelCase(row: DbRow): DbRow {
  const result: DbRow = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

/** 캐릭터 스탯 동적 재계산 함수 */
async function recalculateCharacterStats(client: any, characterId: number): Promise<any> {
  // 1. 완료된 퀘스트 개수 계산
  const { rows: countRows } = await client.query(
    'SELECT count(*) as completed_count FROM quests WHERE character_id = $1 AND completed = true',
    [characterId]
  );
  const completedCount = parseInt(countRows[0].completed_count, 10);
  const totalExp = completedCount * 10;

  // 2. 레벨 및 레벨 내 경험치 계산
  const level = Math.floor(totalExp / 30) + 1;
  const experience = totalExp % 30;
  const stage = getStage(level);

  // 3. 레벨에 따른 스탯 계산
  const max_hp = 100 + (level - 1) * 10;
  const attack = 10 + (level - 1) * 2;
  const defense = 5 + (level - 1) * 1;

  // 캐릭터의 현재 HP를 가져와서 max_hp보다 크지 않게 조정
  const { rows: charRows } = await client.query('SELECT hp FROM characters WHERE id = $1', [characterId]);
  const currentHp = charRows[0]?.hp ?? 100;
  // 레벨업 시 HP도 증가하므로, 만약 이전 HP가 이전 max_hp와 같았다면 완전히 회복시켜주거나 비례해서 조절할 수 있습니다.
  // 여기서는 레벨업 시 최대 체력으로 충전되거나 현재 체력을 max_hp로 제한합니다.
  const hp = Math.min(currentHp + 10, max_hp); // 완료할 때 마다 약간의 hp 회복 또는 최대체력 제한

  // 4. 캐릭터 DB 업데이트
  const { rows: updatedRows } = await client.query(`
    UPDATE characters SET
      level = $1,
      experience = $2,
      stage = $3,
      max_hp = $4,
      hp = $5,
      attack = $6,
      defense = $7,
      updated_at = NOW()
    WHERE id = $8
    RETURNING *
  `, [level, experience, stage, max_hp, hp, attack, defense, characterId]);

  return updatedRows[0];
}

// ─── Character ─────────────────────────────────────────────

/** 단일 캐릭터 조회 (첫 번째 캐릭터) */
router.get('/character', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM characters ORDER BY id LIMIT 1');
    if (rows.length === 0) {
      res.status(404).json({ message: '캐릭터가 없습니다' });
      return;
    }
    const ch = toCamelCase(rows[0]);
    ch.experienceToNext = getExpForLevel(ch.level as number);
    res.json(ch);
  } catch (err) {
    console.error('GET /character error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/** 캐릭터 초기화 */
router.post('/character/reset', async (_req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 기존 퀘스트 및 캐릭터 삭제
    await client.query('DELETE FROM quests');
    await client.query('DELETE FROM characters');

    // 새 캐릭터 생성
    const { rows } = await client.query(`
      INSERT INTO characters (name) VALUES ('꼬마 요리사') RETURNING *
    `);

    const chId = rows[0].id;
    // 30일치 요리사 퀘스트 재생성
    await seedChefQuests(client, chId);

    await client.query('COMMIT');

    const ch = toCamelCase(rows[0]);
    ch.experienceToNext = getExpForLevel(ch.level as number);
    res.json(ch);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /character/reset error:', err);
    res.status(500).json({ message: '초기화 실패' });
  } finally {
    client.release();
  }
});

// ─── Quests ─────────────────────────────────────────────

/** 30일 전체 퀘스트 목록 */
router.get('/quests', async (_req: Request, res: Response) => {
  try {
    // 30일치 퀘스트 전체를 day_number 순서로 조회
    const { rows } = await pool.query(`
      SELECT * FROM quests
      ORDER BY day_number, id
    `);
    res.json(rows.map((r: DbRow) => toCamelCase(r)));
  } catch (err) {
    console.error('GET /quests error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/** 새 퀘스트 추가 (동적 추가를 위한 API 유지) */
router.post('/quests', async (req: Request, res: Response) => {
  try {
    const { title, description, reward_exp = 10, reward_hp = 0, reward_attack = 0, reward_defense = 0, day_number = 1 } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: '퀘스트 제목은 필수입니다' });
      return;
    }

    const { rows: chars } = await pool.query('SELECT id FROM characters ORDER BY id LIMIT 1');
    if (chars.length === 0) {
      res.status(404).json({ message: '캐릭터가 없습니다' });
      return;
    }

    const { rows } = await pool.query(`
      INSERT INTO quests (character_id, title, description, reward_exp, reward_hp, reward_attack, reward_defense, day_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [chars[0].id, title.trim(), (description || '').trim(), reward_exp, reward_hp, reward_attack, reward_defense, day_number]);

    res.status(201).json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('POST /quests error:', err);
    res.status(500).json({ message: '퀘스트 추가 실패' });
  }
});

/** 퀘스트 완료/취소 토글 */
router.patch('/quests/:id', async (req: Request, res: Response) => {
  const questId = parseInt(req.params.id, 10);
  if (isNaN(questId)) {
    res.status(400).json({ message: '잘못된 퀘스트 ID' });
    return;
  }

  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    res.status(400).json({ message: 'completed 값은 boolean이어야 합니다' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 퀘스트 상태 변경 및 해당 캐릭터의 스탯 재조정
    const { rows: questRows } = await client.query('SELECT * FROM quests WHERE id = $1 FOR UPDATE', [questId]);
    if (questRows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: '퀘스트를 찾을 수 없습니다' });
      return;
    }

    const quest = questRows[0];

    // 퀘스트 완료 상태 업데이트
    const { rows: updatedRows } = await client.query(`
      UPDATE quests SET completed = $1 WHERE id = $2 RETURNING *
    `, [completed, questId]);

    // 캐릭터 스탯 동적 재계산
    await recalculateCharacterStats(client, quest.character_id);

    await client.query('COMMIT');

    res.json(toCamelCase(updatedRows[0]));
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('PATCH /quests/:id error:', err);
    res.status(500).json({ message: '퀘스트 업데이트 실패' });
  } finally {
    client.release();
  }
});

export default router;
