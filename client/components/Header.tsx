import { Sparkles, RotateCcw, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ onReset, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <Sparkles className="icon-sparkle" size={28} />
        <h1>꿈 캐릭터 키우기</h1>
      </div>
      <div className="header-right">
        <button className="btn btn-icon" onClick={onToggleTheme} title={theme === 'dark' ? '라이트모드' : '다크모드'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn btn-ghost" onClick={onReset} title="초기화">
          <RotateCcw size={18} />
          <span>리셋</span>
        </button>
      </div>
    </header>
  );
}
