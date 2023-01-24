import { Scene, Types } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import WebFontFile from '../managers/WebFontLoader';
const directories = new DirectoryManager();

export default class GameplayResults extends Scene {
  resultsData: any;
  cursors?: Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameplayResults' });
    this.resultsData;
    // constructing stuff
  }
  preload() {
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
    this.load.addFile(new WebFontFile(this.load, 'Orbitron', 'google'));
  }
  init(data: any) {
    this.resultsData = data;
    // if (!this.resultsData.accuracy) {
    //   this.resultsData = {
    //     accuracy: 100,
    //     maxCombo: 202,
    //     n300: 202,
    //     n200: 0,
    //     n100: 0,
    //     n50: 0,
    //     n0: 0,
    //   };
    // }
    this.sound.stopAll();
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.add.image(1600 / 4, 1000 / 2, 'character-ranking').setScale(1.25);

    const ranking = () => {
      if (this.resultsData.accuracy === 100) {
        return 'X';
      } else if (this.resultsData.accuracy >= 95) {
        return 'S';
      } else if (this.resultsData.accuracy >= 90) {
        return 'A';
      } else if (this.resultsData.accuracy >= 80) {
        return 'B';
      } else if (this.resultsData.accuracy >= 70) {
        return 'C';
      } else {
        return 'D';
      }
    };
    this.add.image(1600 * (1 / 4), 1000 * (3.8 / 5), `ranking-${ranking().toUpperCase()}`).setScale(1.5);
    // ACCURACY
    this.add.text(1223 - 50, 185, `${this.resultsData.accuracy.toFixed(2)}%`, {
      color: 'white',
      fontSize: '78px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'right',
    }).setPadding(16);

    // MAX COMBO
    this.add.text(1350 - 50, 291, `${this.resultsData.maxCombo}x`, {
      color: 'white',
      fontFamily: 'Orbitron',
      fontSize: '74px',
      fontStyle: 'bold',
      align: 'right',
    }).setPadding(16);

    // EXCELLENTS
    this.add.text(983 - 50, 383, 'EXCELLENT', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02 - 50, 383, `${this.resultsData.n300}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'right',
    }).setPadding(16);

    // GREATS
    this.add.text(983 - 50, 458, 'GREAT', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02 - 50, 458, `${this.resultsData.n200}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'right',
    }).setPadding(16);

    // GOODS
    this.add.text(983 - 50, 535, 'GOOD', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02 - 50, 535, `${this.resultsData.n100}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'right',
    }).setPadding(16);

    // OKS
    this.add.text(983 - 50, 612, 'OK', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02 - 50, 612, `${this.resultsData.n50}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'right',
    }).setPadding(16);

    // MISSES
    this.add.text(983 - 50, 689, 'MISS', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02 - 50, 689, `${this.resultsData.n0}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Orbitron',
      fontStyle: 'bold',
      align: 'right',
    }).setPadding(16);
  }
  update() {
    if (this.input.keyboard.checkDown(this.cursors!.shift, 10)) {
      this.scene.start('SongSelect');
    }
  }
}