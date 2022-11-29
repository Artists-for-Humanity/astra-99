import { AUTO, Game, Scale, Types } from 'phaser';
// import Menu from './scenes/Menu';
import Gameplay from './scenes/Gameplay'; // will bring back after gameplayresults is implemented
// import GameplayResults from './scenes/GameplayResults';

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
  scene: [Gameplay],
};

new Game(config);
