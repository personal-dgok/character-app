import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

export const CHEF_QUESTS = [
  { day: 1, title: '손을 올바르게 씻기' },
  { day: 1, title: '채소 이름 10가지 말하기' },
  { day: 2, title: '물 8잔 마시기' },
  { day: 2, title: '좋아하는 음식의 재료 알아보기' },
  { day: 3, title: '과일 1개 먹기' },
  { day: 3, title: '요리 관련 책 20분 읽기' },
  { day: 4, title: '계란 요리 종류 5가지 찾아보기' },
  { day: 4, title: '식사 후 식탁 정리하기' },
  { day: 5, title: '가족 요리 돕기 10분' },
  { day: 5, title: '계량컵과 계량스푼 알아보기' },
  { day: 6, title: '채소 2가지 먹기' },
  { day: 6, title: '주방 안전수칙 5가지 배우기' },
  { day: 7, title: '과일 껍질 벗기기 연습(보호자와 함께)' },
  { day: 7, title: '요리사에 대해 조사하기' },
  { day: 8, title: '샌드위치 만들기 돕기' },
  { day: 8, title: '음식 재료 원산지 알아보기' },
  { day: 9, title: '우유나 유제품 먹기' },
  { day: 9, title: '냉장고 정리 돕기' },
  { day: 10, title: '달걀 삶기 보기(보호자와 함께)' },
  { day: 10, title: '좋아하는 요리 레시피 읽기' },
  { day: 11, title: '편식하지 않기' },
  { day: 11, title: '음식 예쁘게 담는 방법 배우기' },
  { day: 12, title: '채소 씻기 돕기' },
  { day: 12, title: '제철 음식 알아보기' },
  { day: 13, title: '요리 프로그램 20분 보기' },
  { day: 13, title: '오늘 먹은 음식 기록하기' },
  { day: 14, title: '김밥 재료 이름 말하기' },
  { day: 14, title: '설거지 돕기' },
  { day: 15, title: '과일 샐러드 만들기 돕기' },
  { day: 15, title: '식품 영양표 읽어보기' },
  { day: 16, title: '국이나 찌개 종류 5가지 알아보기' },
  { day: 16, title: '가족에게 음식 평가 듣기' },
  { day: 17, title: '손질한 채소 이름 맞히기' },
  { day: 17, title: '음식물 쓰레기 줄이기 실천' },
  { day: 18, title: '간단한 간식 만들기(보호자와 함께)' },
  { day: 18, title: '세계 음식 3가지 알아보기' },
  { day: 19, title: '밥상 차리기 돕기' },
  { day: 19, title: '음식 예절 지키기' },
  { day: 20, title: '계량 연습하기(컵·스푼 사용)' },
  { day: 20, title: '요리 도구 이름 10가지 외우기' },
  { day: 21, title: '채소 썰기 배우기(보호자와 함께)' },
  { day: 21, title: '향신료 5가지 알아보기' },
  { day: 22, title: '물 끓이는 과정 배우기' },
  { day: 22, title: '건강한 식단 만들기' },
  { day: 23, title: '냉장·냉동 보관법 알아보기' },
  { day: 23, title: '요리 일기 쓰기' },
  { day: 24, title: '가족과 함께 요리하기' },
  { day: 24, title: '음식 색깔 맞추기 놀이' },
  { day: 25, title: '빵이나 쿠키 만들기 돕기' },
  { day: 25, title: '위생복과 앞치마 착용하기' },
  { day: 26, title: '음식 냄새와 맛 표현하기' },
  { day: 26, title: '새로운 음식 한 가지 먹어보기' },
  { day: 27, title: '좋아하는 요리 직접 계획하기' },
  { day: 27, title: '레시피 순서대로 읽기' },
  { day: 28, title: '간단한 아침 메뉴 준비하기(보호자와 함께)' },
  { day: 28, title: '음식 사진 찍어 기록하기' },
  { day: 29, title: '가족에게 만든 음식 대접하기' },
  { day: 29, title: '요리하면서 안전수칙 지키기' },
  { day: 30, title: '한 달 동안 가장 잘한 요리 활동 돌아보기' },
  { day: 30, title: '앞으로 배우고 싶은 요리 적기' },
];

export async function seedChefQuests(client: any, characterId: number): Promise<void> {
  await client.query('DELETE FROM quests WHERE character_id = $1', [characterId]);
  for (const q of CHEF_QUESTS) {
    await client.query(`
      INSERT INTO quests (character_id, title, description, reward_exp, day_number, is_daily)
      VALUES ($1, $2, $3, 10, $4, false)
    `, [characterId, q.title, `요리사 ${q.day}일차 일일 체크리스트`, q.day]);
  }
}

export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS characters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL DEFAULT '꼬마 요리사',
        level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        hp INTEGER NOT NULL DEFAULT 100,
        max_hp INTEGER NOT NULL DEFAULT 100,
        attack INTEGER NOT NULL DEFAULT 10,
        defense INTEGER NOT NULL DEFAULT 5,
        stage INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quests (
        id SERIAL PRIMARY KEY,
        character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        reward_exp INTEGER NOT NULL DEFAULT 10,
        reward_hp INTEGER NOT NULL DEFAULT 0,
        reward_attack INTEGER NOT NULL DEFAULT 0,
        reward_defense INTEGER NOT NULL DEFAULT 0,
        is_daily BOOLEAN NOT NULL DEFAULT false,
        completed BOOLEAN NOT NULL DEFAULT false,
        quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE quests ADD COLUMN IF NOT EXISTS day_number INTEGER
    `);

    let charId: number;
    const { rows: charRows } = await client.query('SELECT id, name FROM characters ORDER BY id LIMIT 1');
    if (charRows.length === 0) {
      const { rows } = await client.query(`
        INSERT INTO characters (name) VALUES ('꼬마 요리사') RETURNING id
      `);
      charId = rows[0].id;
      await seedChefQuests(client, charId);
    } else {
      charId = charRows[0].id;
      if (charRows[0].name === '꿈돌이') {
        await client.query(`UPDATE characters SET name = '꼬마 요리사' WHERE id = $1`, [charId]);
      }
      
      const { rowCount } = await client.query('SELECT 1 FROM quests WHERE character_id = $1 LIMIT 1', [charId]);
      if (rowCount === 0) {
        await seedChefQuests(client, charId);
      }
    }

    await client.query('COMMIT');
    console.log('Database initialized and seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
