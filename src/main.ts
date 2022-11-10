import { AUTO, Game, Types, Scale } from 'phaser';
import MenuScene from './scenes/MenuScene';
import GameplayScene from './scenes/GameplayScene';

const config: Types.Core.GameConfig = {
  type: AUTO,
  backgroundColor: '#1c0d36',
  scale: {
    mode: Scale.CENTER_BOTH,
    parent: 'game',
    width: window.innerWidth,
    height: window.innerHeight,
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
