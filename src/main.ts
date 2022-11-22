import { AUTO, Game, Types } from 'phaser';
// import MenuScene from './scenes/MenuScene';
import GameplayScene from './scenes/GameplayScene';

const config: Types.Core.GameConfig = {
  type: AUTO,
  backgroundColor: '#1c0d36',
  scale: {
    parent: 'game',
    width: 1600,
    height: 1000,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  audio: {
    disableWebAudio: false,
  },
  scene: [GameplayScene],
};

new Game(config);
