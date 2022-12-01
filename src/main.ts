import { AUTO, Game, Scale, Types } from 'phaser';
// import Menu from './scenes/Menu';
import GameplayResults from './scenes/GameplayResults';
import Gameplay from './scenes/Gameplay';

const config: Types.Core.GameConfig = {
  type: AUTO,
  backgroundColor: '#1c0d36',
  scale: {
    parent: 'game',
    mode: Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
  scene: [Gameplay, GameplayResults],
};

new Game(config);
