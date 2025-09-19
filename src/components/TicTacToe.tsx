import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type Player = 'X' | 'O' | null;
type Board = Player[];

interface TicTacToeProps {
  onGameOver: (winner: Player, isDraw: boolean) => void;
  onBackToMenu: () => void;
}

export default function TicTacToe({ onGameOver, onBackToMenu }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [isGameActive, setIsGameActive] = useState(true);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  // Проверка победы
  const checkWinner = (gameBoard: Board): { winner: Player; line: number[] } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтальные
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикальные  
      [0, 4, 8], [2, 4, 6]             // диагональные
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
        return { winner: gameBoard[a], line };
      }
    }

    return { winner: null, line: [] };
  };

  // Ход игрока
  const makeMove = (index: number) => {
    if (board[index] || !isGameActive) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const { winner, line } = checkWinner(newBoard);
    
    if (winner) {
      setWinningLine(line);
      setIsGameActive(false);
      setTimeout(() => onGameOver(winner, false), 1500);
      return;
    }

    // Проверка ничьей
    if (newBoard.every(cell => cell !== null)) {
      setIsGameActive(false);
      setTimeout(() => onGameOver(null, true), 1500);
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  // Рендер клетки
  const renderCell = (index: number) => {
    const value = board[index];
    const isWinning = winningLine.includes(index);
    
    return (
      <Button
        key={index}
        variant="outline"
        className={`w-20 h-20 text-4xl font-bold border-2 transition-all duration-300 ${
          isWinning 
            ? 'bg-green-100 border-green-500 scale-110' 
            : 'hover:bg-gray-50 hover:scale-105'
        } ${
          value === 'X' ? 'text-blue-600' : 'text-red-500'
        }`}
        onClick={() => makeMove(index)}
        disabled={!isGameActive || value !== null}
      >
        {value === 'X' && <Icon name="X" size={32} />}
        {value === 'O' && <Icon name="Circle" size={32} />}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
            Крестики-нолики
          </h1>
          <p className="text-lg text-muted-foreground">
            Создатель German
          </p>
        </div>

        {/* Информация о ходе */}
        <Card className="p-4">
          <div className="text-center">
            {isGameActive ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">Ходит:</span>
                <div className={`flex items-center gap-2 ${currentPlayer === 'X' ? 'text-blue-600' : 'text-red-500'}`}>
                  {currentPlayer === 'X' ? <Icon name="X" size={24} /> : <Icon name="Circle" size={24} />}
                  <span className="text-xl font-bold">{currentPlayer === 'X' ? 'Крестики' : 'Нолики'}</span>
                </div>
              </div>
            ) : (
              <div className="text-lg font-semibold text-green-600">
                Игра завершена!
              </div>
            )}
          </div>
        </Card>

        {/* Игровое поле */}
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-2 mx-auto w-fit">
            {Array.from({ length: 9 }, (_, index) => renderCell(index))}
          </div>
        </Card>

        {/* Кнопки управления */}
        <div className="space-y-3">
          <Button 
            onClick={() => {
              setBoard(Array(9).fill(null));
              setCurrentPlayer('X');
              setIsGameActive(true);
              setWinningLine([]);
            }}
            className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Icon name="RotateCcw" size={20} className="mr-2" />
            Новая игра
          </Button>
          
          <Button 
            onClick={onBackToMenu}
            variant="outline"
            className="w-full h-12 text-lg"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Выбор игры
          </Button>
        </div>

        {/* Правила */}
        <Card className="p-4 bg-white/60 backdrop-blur-sm">
          <h3 className="font-semibold mb-2 text-center">Правила</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Цель: собрать 3 своих символа в ряд</p>
            <p>• Ряд может быть горизонтальным, вертикальным или диагональным</p>
            <p>• Крестики ходят первыми</p>
            <p>• Если все клетки заполнены и никто не выиграл - ничья</p>
          </div>
        </Card>
      </div>
    </div>
  );
}