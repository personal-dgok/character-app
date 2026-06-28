import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from './api';
import type { Character, Quest } from './types';
import { getStageInfo } from './types';
import { RefreshCw, AlertCircle, Sparkles, Star, ClipboardList, CalendarDays, Check, X } from 'lucide-react';

type Status = 'loading' | 'ready' | 'error';

export default function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [character, setCharacter] = useState<Character | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string>('');
  const [activeScreen, setActiveScreen] = useState<'main' | 'note'>('main');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // References for scrolling to specific day notes
  const dayRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const loadData = useCallback(async () => {
    try {
      setStatus('loading');
      setError('');
      const [ch, qs] = await Promise.all([
        api.getCharacter(),
        api.getQuests(),
      ]);
      setCharacter(ch);
      setQuests(qs);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReset = async () => {
    if (!window.confirm('정말 30일 도전 기록을 초기화하시겠습니까?')) return;
    try {
      await api.resetCharacter();
      await loadData();
      setSelectedDay(1);
      setActiveScreen('main');
    } catch (err) {
      setError(err instanceof Error ? err.message : '초기화에 실패했습니다');
    }
  };

  const handleToggleQuest = async (id: number, completed: boolean) => {
    try {
      // 낙관적 업데이트: 해당 퀘스트만 즉시 반영 (다른 퀘스트는 건드리지 않음)
      setQuests(prev => prev.map(q => q.id === id ? { ...q, completed } : q));

      // 서버에 저장 후, 해당 퀘스트만 서버 응답으로 업데이트 (전체 재조회 X → race condition 방지)
      const updatedQuest = await api.completeQuest(id, completed);
      setQuests(prev => prev.map(q => q.id === id ? { ...q, ...updatedQuest } : q));

      // 캐릭터 스탯(레벨/경험치)만 서버에서 새로 불러옴
      const ch = await api.getCharacter();
      setCharacter(ch);
    } catch (err) {
      setError(err instanceof Error ? err.message : '퀘스트 업데이트 실패');
      // 오류 시 해당 퀘스트만 원래 상태로 복구
      setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: !completed } : q));
    }
  };

  const handleDayClick = (dayNum: number) => {
    setSelectedDay(dayNum);
    setActiveScreen('note');

    // Scroll to the selected day in note panel on desktop
    setTimeout(() => {
      const targetElement = dayRefs.current[dayNum];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (status === 'loading') {
    return (
      <div className="app">
        <div className="loading-screen">
          <RefreshCw size={40} className="spin" />
          <p>맛있는 모험을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="app">
        <div className="error-screen">
          <AlertCircle size={48} />
          <h2>연결 오류</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            <RefreshCw size={16} />
            <span>다시 시도</span>
          </button>
        </div>
      </div>
    );
  }

  // Group quests by day (1 to 30)
  const questsByDay: { [key: number]: Quest[] } = {};
  for (let d = 1; d <= 30; d++) {
    questsByDay[d] = [];
  }
  quests.forEach(q => {
    if (q.dayNumber >= 1 && q.dayNumber <= 30) {
      questsByDay[q.dayNumber].push(q);
    }
  });

  // Calculate progress
  const totalQuests = quests.length || 60;
  const completedQuests = quests.filter(q => q.completed).length;
  const progressPercent = Math.min((completedQuests / totalQuests) * 100, 100);

  // Character info
  const stageInfo = character ? getStageInfo(character.stage) : { name: '', description: '' };
  const getCharacterImage = (stage: number) => {
    switch (stage) {
      case 2: return '/assets/chef_stage_2.jpg';
      case 3: return '/assets/chef_stage_3.jpg';
      case 4: return '/assets/chef_stage_4.jpg';
      default: return '/assets/chef_stage_1.jpg';
    }
  };

  return (
    <div className="app container-theme">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-left">
          <Sparkles className="icon-sparkle" size={20} />
          <h1>요리사 30일 도전 체크리스트</h1>
        </div>
        <button className="btn-reset" onClick={handleReset}>
          도전 초기화
        </button>
      </header>

      {error && (
        <div className="toast error-toast">
          <span>{error}</span>
          <button className="close-toast" onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {/* Main Layout containing Grid & Character (Left Panel) + Notes (Right Panel) */}
      <main className="quest-layout">
        
        {/* Left Board Panel */}
        <section className={`board-panel ${activeScreen === 'main' ? 'active-mobile' : 'hidden-mobile'}`}>
          <div className="board-card">
            
            {/* Grid Area */}
            <div className="grid-area">
              <h2 className="panel-title"><Star size={20} className="title-star" /> 꿈을 위한 일일 퀘스트 <Star size={20} className="title-star" /></h2>
              <div className="days-grid">
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNum = i + 1;
                  const dayQuests = questsByDay[dayNum] || [];
                  const isCompleted = dayQuests.length > 0 && dayQuests.every(q => q.completed);
                  const isSelected = selectedDay === dayNum;

                  return (
                    <button
                      key={dayNum}
                      className={`day-card ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDayClick(dayNum)}
                    >
                      <Star size={11} className="star-icon" />
                      <span className="day-number">{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dotted Divider (Desktop only) */}
            <div className="panel-divider" />

            {/* Character Area */}
            <div className="character-area">
              {character && (
                <>
                  <div className="character-header">
                    <h3>꿈 캐릭터 (LV.{character.level})</h3>
                  </div>
                  <div className="character-avatar-container">
                    <img
                      src={getCharacterImage(character.stage)}
                      alt={`Stage ${character.stage} Chef`}
                      className="character-avatar"
                    />
                  </div>
                  <div className="character-title">
                    <strong>[{stageInfo.name}]</strong>
                    <p className="stage-desc-text">{stageInfo.description}</p>
                  </div>
                  <div className="exp-info">
                    <p>누적 경험치: {character.level * 30 - 30 + character.experience}</p>
                    <p className="exp-sub">
                      (다음 성장까지: {30 - character.experience}점)
                    </p>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Progress Bar Footer Area */}
          <div className="progress-footer">
            <div className="runner-track">
              <div
                className="runner-icon-wrapper"
                style={{ left: `calc(${progressPercent}% - 22px)` }}
              >
                <img
                  src="/assets/chef_running.jpg"
                  alt="Running Chef"
                  className="runner-icon"
                />
              </div>
            </div>
            <div className="progress-track-custom">
              <div className="progress-fill-custom" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="progress-stats">
              <span>전체 달성도: {completedQuests} / {totalQuests} ({Math.round(progressPercent)}%)</span>
            </div>
          </div>
        </section>

        {/* Right Note Panel */}
        <section className={`note-panel ${activeScreen === 'note' ? 'active-mobile' : 'hidden-mobile'}`}>
          <div className="note-card">
            <h2 className="note-title"><ClipboardList size={22} className="note-title-icon" /> 꿈을 위한 노트</h2>
            
            <div className="note-scroll-list">
              {Array.from({ length: 30 }, (_, i) => {
                const dayNum = i + 1;
                const dayQuests = questsByDay[dayNum] || [];
                const isSelected = selectedDay === dayNum;

                return (
                  <div
                    key={dayNum}
                    ref={el => (dayRefs.current[dayNum] = el)}
                    className={`day-note-block ${isSelected ? 'highlighted' : ''}`}
                    id={`day-note-${dayNum}`}
                  >
                    <h3 className="day-note-header"><CalendarDays size={15} className="day-icon" /> {dayNum}일차</h3>
                    <ul className="day-checklist">
                      {dayQuests.map((q) => (
                        <li
                          key={q.id}
                          className={`checklist-item ${q.completed ? 'checked' : ''}`}
                          onClick={() => handleToggleQuest(q.id, !q.completed)}
                        >
                          <span className="checkbox-custom">
                            {q.completed ? <Check size={13} strokeWidth={3} /> : ''}
                          </span>
                          <span className="checklist-text">
                            {q.title} {q.completed ? <span className="completed-badge">(완료)</span> : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Switch to Main Board button (Visible on mobile/tablet layout) */}
            <button className="btn-back-main" onClick={() => setActiveScreen('main')}>
              메인보드로 이동
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
