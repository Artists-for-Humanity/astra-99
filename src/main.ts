import { AUTO, Game, Scale, Types } from 'phaser';
// import Menu from './scenes/Menu';
import GameplayResults from './scenes/GameplayResults';
import Gameplay from './scenes/Gameplay';
import SongSelect from './scenes/SongSelect';
import ButtonPlugin from 'phaser3-rex-plugins/plugins/button-plugin.js';

const config: Types.Core.GameConfig = {
  type: AUTO,
  backgroundColor: '#1c1c1c',
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
  plugins: {
    global: [{
      key: 'rexButton',
      plugin: ButtonPlugin,
      start: true,
    }],
  },
  audio: {
    disableWebAudio: false,
  },
  scene: [SongSelect, Gameplay, GameplayResults],
};

new Game(config);
