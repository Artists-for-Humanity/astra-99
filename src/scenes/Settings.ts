import { GameObjects, Scene, Types } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import WebFontFile from '../managers/WebFontLoader';

const directories = new DirectoryManager();
export default class Settings extends Scene {
  constructor() {
    super({ key: 'Settings' });
  }

  preload() {
    this.load.addFile(new WebFontFile(this.load, 'Audiowide', 'google'));
  }

  create() {
    // settings: offset, scroll speed
    if (!localStorage.getItem('offset')) {
      localStorage.setItem('offset', `${0}`);
    }

    this.add.text(800 - (495 / 2), 2, 'OPTIONS', {
      fontFamily: 'Audiowide',
      fontSize: '96px',
    });

    // this.add.text(number, number, 'OFFSET', {
    //   fontFamily: 'Audiowide',

    // });
  }
}
