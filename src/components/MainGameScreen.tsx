import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GameScreen from './GameScreen';
import TicTacToeGameScreen from './TicTacToeGameScreen';
import Icon from '@/components/ui/icon';

type GameType = 'menu' | 'tetris' | 'tictactoe';

export default function MainGameScreen() {
  const [selectedGame, setSelectedGame] = useState<GameType>('menu');

  // Главное меню
  if (selectedGame === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-lg w-full">
          {/* Заголовок */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              АРКАДА
            </h1>
            <p className="text-xl text-muted-foreground">
              Создатель German
            </p>
            <p className="text-lg text-muted-foreground">
              Выберите игру
            </p>
          </div>

          {/* Кнопки игр */}
          <div className="space-y-4">
            {/* Тетрис */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 cursor-pointer group hover:scale-105" 
                  onClick={() => setSelectedGame('tetris')}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name="Grid3X3" size={32} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-gray-800">Тетрис</h3>
                  <p className="text-muted-foreground">Классическая головоломка с падающими блоками</p>
                </div>
                <Icon name="ChevronRight" size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>

            {/* Крестики-нолики */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 cursor-pointer group hover:scale-105" 
                  onClick={() => setSelectedGame('tictactoe')}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="flex items-center gap-1">
                    <Icon name="X" size={14} className="text-white" />
                    <Icon name="Circle" size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-gray-800">Крестики-нолики</h3>
                  <p className="text-muted-foreground">Логическая игра для двух игроков</p>
                </div>
                <Icon name="ChevronRight" size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          </div>

          {/* Кнопка напрямую */}
          <div className="space-y-3">
            <Button 
              onClick={() => setSelectedGame('tetris')}
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              <Icon name="Zap" size={24} className="mr-2" />
              Быстрый старт - Тетрис
            </Button>
          </div>

          {/* Информация */}
          <Card className="p-4 bg-white/60 backdrop-blur-sm">
            <h3 className="font-semibold mb-2 text-center">Игровая аркада</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Две классические игры в одном месте</p>
              <p>• Сохранение результатов и статистики</p>
              <p>• Современный дизайн и удобное управление</p>
              <p>• Поддержка мобильных устройств</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Выбранная игра Тетрис
  if (selectedGame === 'tetris') {
    return <GameScreen />;
  }

  // Выбранная игра Крестики-нолики
  if (selectedGame === 'tictactoe') {
    return <TicTacToeGameScreen onBackToGameSelection={() => setSelectedGame('menu')} />;
  }

  return null;
}