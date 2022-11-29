import { Scene } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
const directories = new DirectoryManager();

export default class GameplayResults extends Scene {
  constructor() {
    super({ key: 'GameplayResults' });
    // constructing stuff
  }
  preload() {
    // preloading stuff
    directories.getImages('gameplayResults').forEach((image) => {
      try {
        this.load.image(
          image.name,
          new URL(`http://127.0.0.1:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href,
        );
      } catch (err) {
        console.log(err);
      }
    });
  }
  create() {
    this.add.image(1600 / 5, 1000 / 2, 'results-ceres');
    this.add.image(1600 * (2 / 5), 1000 * (1 / 5), 'ranking-S').setScale(0.75);
    this.add.text(1223, 185, '95.63%', {
      color: 'white',
      fontSize: '78px',
      fontStyle: 'italic',
      align: 'right',
    });
    this.add.text(1350, 291, '474x', {
      color: 'white',
      fontSize: '74px',
      fontStyle: 'italic',
      align: 'right',
    });
    this.add.text(983, 383, 'EXCELLENT', {
      color: 'white',
      fontSize: '50px',
      fontStyle: 'italic',
      align: 'left',
    });
    // 1350, 291; 74px
    // excellent: 983, 383; 50px
    // creating stuff
  }
  update() {
    // updating stuff
  }
}