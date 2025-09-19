import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

// Тетромино фигуры
const TETROMINOES = {
  I: [
    ['....', 'IIII', '....', '....'],
    ['..I.', '..I.', '..I.', '..I.'],
  ],
  O: [
    ['....', '.OO.', '.OO.', '....'],
  ],
  T: [
    ['....', '.TTT', '..T.', '....'],
    ['....', '..T.', '.TT.', '..T.'],
    ['....', '..T.', '.TTT', '....'],
    ['....', '.T..', '.TT.', '.T..'],
  ],
  S: [
    ['....', '..SS', '.SS.', '....'],
    ['....', '..S.', '..SS', '...S'],
  ],
  Z: [
    ['....', '.ZZ.', '..ZZ', '....'],
    ['....', '...Z', '..ZZ', '..Z.'],
  ],
  J: [
    ['....', '.JJJ', '...J', '....'],
    ['....', '..J.', '..J.', '.JJ.'],
    ['....', '.J..', '.JJJ', '....'],
    ['....', '.JJ.', '.J..', '.J..'],
  ],
  L: [
    ['....', '.LLL', '.L..', '....'],
    ['....', '.LL.', '..L.', '..L.'],
    ['....', '...L', '.LLL', '....'],
    ['....', '.L..', '.L..', '.LL.'],
  ],
};

const COLORS = {
  I: '#00f5ff',
  O: '#ffff00', 
  T: '#a000ff',
  S: '#00ff00',
  Z: '#ff0000',
  J: '#0000ff',
  L: '#ff8000',
  empty: 'transparent',
  ghost: 'rgba(255, 255, 255, 0.2)'
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

interface Position {
  x: number;
  y: number;
}

interface Piece {
  type: keyof typeof TETROMINOES;
  rotation: number;
  position: Position;
}

interface TetrisGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number, lines: number) => void;
}

export default function TetrisGame({ onGameOver, onScoreUpdate }: TetrisGameProps) {
  const [board, setBoard] = useState<string[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('empty'))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameRunning, setIsGameRunning] = useState(true);
  const [dropTime, setDropTime] = useState(1000);

  // Создание новой фигуры
  const createPiece = useCallback((): Piece => {
    const types = Object.keys(TETROMINOES) as (keyof typeof TETROMINOES)[];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      type,
      rotation: 0,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 }
    };
  }, []);

  // Получение матрицы фигуры
  const getPieceMatrix = useCallback((piece: Piece) => {
    return TETROMINOES[piece.type][piece.rotation % TETROMINOES[piece.type].length];
  }, []);

  // Проверка коллизий
  const isValidMove = useCallback((piece: Piece, newBoard?: string[][]) => {
    const matrix = getPieceMatrix(piece);
    const boardToCheck = newBoard || board;
    
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] !== '.') {
          const x = piece.position.x + col;
          const y = piece.position.y + row;
          
          if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false;
          if (y >= 0 && boardToCheck[y][x] !== 'empty') return false;
        }
      }
    }
    return true;
  }, [board, getPieceMatrix]);

  // Размещение фигуры на доске
  const placePiece = useCallback((piece: Piece, targetBoard: string[][]) => {
    const matrix = getPieceMatrix(piece);
    const newBoard = targetBoard.map(row => [...row]);
    
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] !== '.') {
          const x = piece.position.x + col;
          const y = piece.position.y + row;
          if (y >= 0) {
            newBoard[y][x] = piece.type;
          }
        }
      }
    }
    return newBoard;
  }, [getPieceMatrix]);

  // Очистка заполненных линий
  const clearLines = useCallback((gameBoard: string[][]) => {
    const newBoard = gameBoard.filter(row => row.some(cell => cell === 'empty'));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill('empty'));
    }
    
    return { newBoard, clearedLines };
  }, []);

  // Движение фигуры вниз
  const dropPiece = useCallback(() => {
    if (!currentPiece || !isGameRunning) return;

    const newPiece = {
      ...currentPiece,
      position: { ...currentPiece.position, y: currentPiece.position.y + 1 }
    };

    if (isValidMove(newPiece)) {
      setCurrentPiece(newPiece);
    } else {
      // Фигура приземлилась
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      
      if (clearedLines > 0) {
        const newLines = lines + clearedLines;
        const newScore = score + clearedLines * 100 * level;
        const newLevel = Math.floor(newLines / 10) + 1;
        
        setLines(newLines);
        setScore(newScore);
        setLevel(newLevel);
        setDropTime(Math.max(100, 1000 - (newLevel - 1) * 100));
        onScoreUpdate(newScore, newLines);
      }

      // Проверка Game Over
      if (!nextPiece || !isValidMove(nextPiece)) {
        setIsGameRunning(false);
        onGameOver(score);
        return;
      }

      setCurrentPiece(nextPiece);
      setNextPiece(createPiece());
    }
  }, [currentPiece, isGameRunning, isValidMove, placePiece, board, clearLines, lines, score, level, onScoreUpdate, onGameOver, nextPiece, createPiece]);

  // Движение влево/вправо
  const movePiece = useCallback((direction: 'left' | 'right') => {
    if (!currentPiece || !isGameRunning) return;

    const newPiece = {
      ...currentPiece,
      position: {
        ...currentPiece.position,
        x: currentPiece.position.x + (direction === 'left' ? -1 : 1)
      }
    };

    if (isValidMove(newPiece)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, isGameRunning, isValidMove]);

  // Поворот фигуры
  const rotatePiece = useCallback(() => {
    if (!currentPiece || !isGameRunning) return;

    const newPiece = {
      ...currentPiece,
      rotation: currentPiece.rotation + 1
    };

    if (isValidMove(newPiece)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, isGameRunning, isValidMove]);

  // Быстрое падение
  const hardDrop = useCallback(() => {
    if (!currentPiece || !isGameRunning) return;

    let testPiece = { ...currentPiece };
    while (isValidMove({ ...testPiece, position: { ...testPiece.position, y: testPiece.position.y + 1 } })) {
      testPiece.position.y++;
    }
    setCurrentPiece(testPiece);
    setTimeout(dropPiece, 50);
  }, [currentPiece, isGameRunning, isValidMove, dropPiece]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isGameRunning) return;

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          event.preventDefault();
          dropPiece();
          break;
        case 'ArrowUp':
          event.preventDefault();
          rotatePiece();
          break;
        case 'Space':
          event.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameRunning, movePiece, dropPiece, rotatePiece, hardDrop]);

  // Автоматическое падение
  useEffect(() => {
    const interval = setInterval(dropPiece, dropTime);
    return () => clearInterval(interval);
  }, [dropPiece, dropTime]);

  // Инициализация игры
  useEffect(() => {
    if (!currentPiece && !nextPiece) {
      setCurrentPiece(createPiece());
      setNextPiece(createPiece());
    }
  }, [currentPiece, nextPiece, createPiece]);

  // Рендер доски с фигурой
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Отображение текущей фигуры
    if (currentPiece) {
      const matrix = getPieceMatrix(currentPiece);
      for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
          if (matrix[row][col] !== '.') {
            const x = currentPiece.position.x + col;
            const y = currentPiece.position.y + row;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = currentPiece.type;
            }
          }
        }
      }
    }

    return displayBoard.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            className="w-6 h-6 border border-gray-700"
            style={{
              backgroundColor: cell === 'empty' ? 'transparent' : COLORS[cell as keyof typeof COLORS],
            }}
          />
        ))}
      </div>
    ));
  };

  // Рендер следующей фигуры
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const matrix = getPieceMatrix(nextPiece);
    return matrix.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.split('').map((cell, colIndex) => (
          <div
            key={colIndex}
            className="w-4 h-4 border border-gray-600"
            style={{
              backgroundColor: cell === '.' ? 'transparent' : COLORS[nextPiece.type],
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="flex gap-8 items-start justify-center min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-8">
      {/* Игровое поле */}
      <Card className="p-6 bg-black/90 border-none">
        <div className="border-2 border-gray-600 bg-black">
          {renderBoard()}
        </div>
      </Card>

      {/* Боковая панель */}
      <div className="space-y-6">
        {/* Счет */}
        <Card className="p-4">
          <div className="space-y-2 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Счет</div>
              <div className="text-xl font-bold">{score.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Линии</div>
              <div className="text-lg font-semibold">{lines}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Уровень</div>
              <div className="text-lg font-semibold">{level}</div>
            </div>
          </div>
        </Card>

        {/* Следующая фигура */}
        <Card className="p-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Следующая</div>
            <div className="bg-black p-2 rounded">
              {renderNextPiece()}
            </div>
          </div>
        </Card>

        {/* Управление */}
        <Card className="p-4">
          <div className="text-center space-y-3">
            <h3 className="font-semibold">Управление</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="ArrowLeft" size={16} />
                <Icon name="ArrowRight" size={16} />
                <span>Движение</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="ArrowUp" size={16} />
                <span>Поворот</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="ArrowDown" size={16} />
                <span>Ускорение</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs border px-1 rounded">SPACE</span>
                <span>Сброс</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Мобильное управление */}
        <Card className="p-4 md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => movePiece('left')}>
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={rotatePiece}>
              <Icon name="RotateCw" size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => movePiece('right')}>
              <Icon name="ArrowRight" size={16} />
            </Button>
            <div></div>
            <Button variant="outline" size="sm" onClick={dropPiece}>
              <Icon name="ArrowDown" size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={hardDrop}>
              <Icon name="ChevronsDown" size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}