import { Scene } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import WebFontFile from '../managers/WebFontLoader';
const directories = new DirectoryManager();

export default class GameplayResults extends Scene {
  resultsData: any;

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
    this.load.addFile(new WebFontFile(this.load, 'Lato', 'google'));
  }
  init(data: any) {
    this.resultsData = data;
    this.sound.stopAll();
  }

  create() {
    this.add.image(1600 / 5, 1000 / 2, 'results-ceres');

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
    this.add.image(1600 * (2 / 5), 1000 * (1 / 5), `ranking-${ranking().toUpperCase()}`).setScale(0.75);
    // ACCURACY
    this.add.text(1223, 185, `${this.resultsData.accuracy.toFixed(2)}%`, {
      color: 'white',
      fontSize: '78px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'right',
    }).setPadding(16);

    // MAX COMBO
    this.add.text(1350, 291, `${this.resultsData.maxCombo}x`, {
      color: 'white',
      fontFamily: 'Lato',
      fontSize: '74px',
      fontStyle: 'italic',
      align: 'right',
    }).setPadding(16);

    // EXCELLENTS
    this.add.text(983, 383, 'EXCELLENT', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02, 383, `${this.resultsData.n300}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'right',
    }).setPadding(16);

    // GREATS
    this.add.text(983, 458, 'GREAT', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02, 458, `${this.resultsData.n200}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'right',
    }).setPadding(16);

    // GOODS
    this.add.text(983, 535, 'GOOD', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02, 535, `${this.resultsData.n100}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'right',
    }).setPadding(16);

    // OKS
    this.add.text(983, 612, 'OK', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02, 612, `${this.resultsData.n50}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'right',
    }).setPadding(16);

    // MISSES
    this.add.text(983, 689, 'MISS', {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'left',
    }).setPadding(16);
    this.add.text(1408.02, 689, `${this.resultsData.n0}`, {
      color: 'white',
      fontSize: '50px',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      align: 'right',
    }).setPadding(16);
  }
  update() {
    // updating stuff
  }
}