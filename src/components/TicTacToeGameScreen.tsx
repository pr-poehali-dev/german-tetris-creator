import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TicTacToe from './TicTacToe';
import Icon from '@/components/ui/icon';

type Player = 'X' | 'O' | null;

interface TicTacToeRecord {
  winner: string;
  date: string;
  moves: number;
}

interface TicTacToeGameScreenProps {
  onBackToGameSelection: () => void;
}

export default function TicTacToeGameScreen({ onBackToGameSelection }: TicTacToeGameScreenProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [gameResult, setGameResult] = useState<{ winner: Player; isDraw: boolean } | null>(null);
  const [records, setRecords] = useState<TicTacToeRecord[]>([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  // Загрузка статистики из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tictactoe-records');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
    const played = localStorage.getItem('tictactoe-games-played');
    if (played) {
      setGamesPlayed(parseInt(played));
    }
  }, []);

  // Сохранение результата
  const saveGameResult = (winner: Player, isDraw: boolean) => {
    const newRecord: TicTacToeRecord = {
      winner: isDraw ? 'Ничья' : winner === 'X' ? 'Крестики' : 'Нолики',
      date: new Date().toLocaleDateString('ru-RU'),
      moves: gamesPlayed + 1
    };

    const updatedRecords = [...records, newRecord].slice(-20); // Последние 20 игр
    const newGamesPlayed = gamesPlayed + 1;

    setRecords(updatedRecords);
    setGamesPlayed(newGamesPlayed);
    localStorage.setItem('tictactoe-records', JSON.stringify(updatedRecords));
    localStorage.setItem('tictactoe-games-played', newGamesPlayed.toString());
  };

  const handleGameStart = () => {
    setGameState('playing');
    setGameResult(null);
  };

  const handleGameOver = (winner: Player, isDraw: boolean) => {
    setGameResult({ winner, isDraw });
    saveGameResult(winner, isDraw);
    setGameState('gameOver');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  // Подсчет статистики
  const stats = {
    total: records.length,
    xWins: records.filter(r => r.winner === 'Крестики').length,
    oWins: records.filter(r => r.winner === 'Нолики').length,
    draws: records.filter(r => r.winner === 'Ничья').length
  };

  // Экран меню
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-md w-full">
          {/* Заголовок */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
              Крестики-нолики
            </h1>
            <p className="text-lg text-muted-foreground">
              Создатель German
            </p>
          </div>

          {/* Кнопка начать */}
          <Button 
            onClick={handleGameStart}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
          >
            <Icon name="Play" size={24} className="mr-2" />
            Начать игру
          </Button>

          {/* Статистика */}
          {stats.total > 0 && (
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
                <Icon name="BarChart3" size={20} className="text-blue-500" />
                Статистика
              </h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.xWins}</div>
                  <div className="text-sm text-muted-foreground">Побед крестиков</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{stats.oWins}</div>
                  <div className="text-sm text-muted-foreground">Побед ноликов</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{stats.draws}</div>
                  <div className="text-sm text-muted-foreground">Ничьих</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Всего игр</div>
                </div>
              </div>
            </Card>
          )}

          {/* Последние результаты */}
          {records.length > 0 && (
            <Card className="p-4 bg-white/60 backdrop-blur-sm">
              <h3 className="font-semibold mb-3 text-center">Последние игры</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {records.slice(-5).reverse().map((record, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${
                      record.winner === 'Крестики' ? 'text-blue-600' :
                      record.winner === 'Нолики' ? 'text-red-500' : 'text-gray-600'
                    }`}>
                      {record.winner === 'Ничья' ? '🤝 Ничья' : 
                       record.winner === 'Крестики' ? '❌ Крестики' : '⭕ Нолики'}
                    </span>
                    <span className="text-muted-foreground text-xs">{record.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Кнопка назад */}
          <Button 
            onClick={onBackToGameSelection}
            variant="outline"
            size="lg"
            className="w-full h-12 text-lg"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Выбор игры
          </Button>
        </div>
      </div>
    );
  }

  // Игра
  if (gameState === 'playing') {
    return (
      <TicTacToe 
        onGameOver={handleGameOver}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Game Over
  if (gameState === 'gameOver' && gameResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-md w-full">
          {/* Результат */}
          <div className="space-y-4">
            {gameResult.isDraw ? (
              <>
                <h1 className="text-6xl">🤝</h1>
                <h2 className="text-4xl font-bold text-gray-600">Ничья!</h2>
                <p className="text-lg text-muted-foreground">Хорошая игра!</p>
              </>
            ) : (
              <>
                <h1 className="text-6xl">
                  {gameResult.winner === 'X' ? '❌' : '⭕'}
                </h1>
                <h2 className={`text-4xl font-bold ${
                  gameResult.winner === 'X' ? 'text-blue-600' : 'text-red-500'
                }`}>
                  {gameResult.winner === 'X' ? 'Крестики' : 'Нолики'} побеждают!
                </h2>
                <p className="text-lg text-muted-foreground">
                  {gameResult.winner === 'O' ? 'Сдулся ЛОХ' : 'Отличная игра!'}
                </p>
              </>
            )}
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
              В меню
            </Button>
          </div>

          {/* Обновленная статистика */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-3 text-center">Общая статистика</h3>
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div>
                <div className="text-xl font-bold text-blue-600">{stats.xWins}</div>
                <div className="text-muted-foreground">Крестики</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-500">{stats.oWins}</div>
                <div className="text-muted-foreground">Нолики</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-center">
              <div className="text-lg font-bold text-gray-600">{stats.draws} ничьих</div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}