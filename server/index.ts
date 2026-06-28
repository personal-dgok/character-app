import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db';
import apiRouter from './routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';
const PORT = parseInt(process.env.PORT || '5000', 10);

async function main() {
  // DB 초기화 (테이블 생성)
  await initDb();

  const app = express();

  // Body parser
  app.use(express.json());

  // API 라우트
  app.use('/api', apiRouter);

  if (isDev) {
    // ── 개발 모드: Vite 미들웨어 (HMR 지원) ──
    console.log('Starting in development mode with Vite HMR...');

    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '..', 'client'),
    });

    // Vite 미들웨어 등록
    app.use(vite.middlewares);

    console.log('Vite dev server middleware attached');
  } else {
    // ── 프로덕션 모드: 정적 파일 서빙 ──
    const distPath = path.resolve(__dirname, '..', 'dist', 'client');
    app.use(express.static(distPath));

    // SPA fallback: 모든 미지원 경로는 index.html로
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Dream Character server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${isDev ? 'development' : 'production'}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
