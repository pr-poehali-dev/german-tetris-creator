import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TetrisGame from './TetrisGame';
import Icon from '@/components/ui/icon';

interface HighScore {
  score: number;
  lines: number;
  date: string;
}

export default function GameScreen() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [currentScore, setCurrentScore] = useState(0);
  const [currentLines, setCurrentLines] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Загрузка рекордов из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tetris-highscores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Сохранение рекорда
  const saveHighScore = (score: number, lines: number) => {
    const newScore: HighScore = {
      score,
      lines,
      date: new Date().toLocaleDateString('ru-RU')
    };

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Топ 10 результатов

    setHighScores(updatedScores);
    localStorage.setItem('tetris-highscores', JSON.stringify(updatedScores));
  };

  const handleGameStart = () => {
    setGameState('playing');
    setCurrentScore(0);
    setCurrentLines(0);
  };

  const handleGameOver = (finalScore: number) => {
    saveHighScore(finalScore, currentLines);
    setGameState('gameOver');
  };

  const handleScoreUpdate = (score: number, lines: number) => {
    setCurrentScore(score);
    setCurrentLines(lines);
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  // Экран меню
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-md w-full">
          {/* Заголовок */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              TETRIS
            </h1>
            <p className="text-lg text-muted-foreground">
              Создатель German
            </p>
          </div>

          {/* Кнопка начать */}
          <Button 
            onClick={handleGameStart}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 transform hover:scale-105"
          >
            <Icon name="Play" size={24} className="mr-2" />
            Начать игру
          </Button>

          {/* Рекорды */}
          {highScores.length > 0 && (
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
                <Icon name="Trophy" size={20} className="text-yellow-500" />
                Лучшие результаты
              </h2>
              <div className="space-y-2">
                {highScores.slice(0, 5).map((score, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-50 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{score.score.toLocaleString()}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {score.lines} линий • {score.date}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Инструкции */}
          <Card className="p-4 bg-white/60 backdrop-blur-sm">
            <h3 className="font-semibold mb-2 text-center">Как играть</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Icon name="ArrowLeft" size={14} />
                <Icon name="ArrowRight" size={14} />
                <span>Движение влево/вправо</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="ArrowUp" size={14} />
                <span>Поворот фигуры</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="ArrowDown" size={14} />
                <span>Ускорение падения</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs border px-1 rounded">SPACE</span>
                <span>Мгновенный сброс</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Игра
  if (gameState === 'playing') {
    return (
      <TetrisGame 
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
      />
    );
  }

  // Game Over
  if (gameState === 'gameOver') {
    const isNewRecord = highScores.length === 0 || currentScore > Math.min(...highScores.map(s => s.score));
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-md w-full">
          {/* Game Over */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-red-600 animate-pulse">
              СДУЛСЯ ЛОХ
            </h1>
            <div className="space-y-2">
              <p className="text-2xl font-semibold">
                Счет: {currentScore.toLocaleString()}
              </p>
              <p className="text-lg text-muted-foreground">
                Линий очищено: {currentLines}
              </p>
              {isNewRecord && (
                <p className="text-lg text-yellow-600 font-semibold flex items-center justify-center gap-2">
                  <Icon name="Trophy" size={20} />
                  Новый рекорд!
                </p>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="space-y-3">
            <Button 
              onClick={handleGameStart}
              size="lg"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Играть снова
            </Button>
            <Button 
              onClick={handleBackToMenu}
              variant="outline"
              size="lg"
              className="w-full h-12 text-lg"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              В главное меню
            </Button>
          </div>

          {/* Статистика */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-3 text-center">Статистика игры</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{currentScore.toLocaleString()}</div>
                <div className="text-muted-foreground">Очков</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentLines}</div>
                <div className="text-muted-foreground">Линий</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}