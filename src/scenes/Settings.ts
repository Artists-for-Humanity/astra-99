import { GameObjects, Scene, Types } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import WebFontFile from '../managers/WebFontLoader';

const directories = new DirectoryManager();

interface Setting {
  name: string,
  id: string,
  value: number,
  default: number,
  gameObject?: GameObjects.Group;
}

export default class Settings extends Scene {
  controls?: Types.Input.Keyboard.CursorKeys;
  settings: Setting[];
  constructor() {
    super({ key: 'Settings' });
    this.controls;
    this.settings = [
      {
        name: 'OFFSET',
        id: 'OFFSET',
        value: 0,
        default: 0,
        gameObject: undefined,
      },
      {
        name: 'SCROLL\nSPEED',
        id: 'SCROLLSPEED',
        value: 20,
        default: 20,
        gameObject: undefined,
      },
      {
        name: 'VOLUME',
        id: 'VOLUME',
        value: 100,
        default: 100,
        gameObject: undefined,
      },
    ];
  }

  preload() {
    directories.getImages('settings').forEach(image => {
      this.load.image(image.name, new URL(`http://127.0.0.1:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href);
    });
    this.load.addFile(new WebFontFile(this.load, 'Audiowide', 'google'));
  }

  create() {
    this.controls = this.input.keyboard.createCursorKeys();
    // settings: offset, scroll speed
    if (!localStorage.getItem('offset')) {
      localStorage.setItem('offset', `${0}`);
    }

    this.add.text(800 - (495 / 2), 2, 'OPTIONS', {
      fontFamily: 'Audiowide',
      fontSize: '96px',
    });

    this.add.image(800 - (350 * 1.5), 500, 'setting-inactive-bg');

    this.add.image(800, 500, 'setting-active-bg');
  
    this.add.image(800 + (350 * 1.5), 500, 'setting-inactive-bg');

    this.add.image(800, 500, 'shadow').setDepth(4);

    for (let i = 0; i < this.settings.length; i++) {
      const j = i - 1;
      const setting = this.settings[i];
      setting.gameObject = this.add.group();

      this.add.text(800 + (525 * j) - (350 / (1.05 * 2)), 200, setting.name, {
        fixedWidth: 325,
        align: 'center',
        fontFamily: 'Audiowide',
        fontSize: '64px',
      });
    }
    // this.add.text(number, number, 'OFFSET', {
    //   fontFamily: 'Audiowide',

    // });
  }
  getWidget(settingName: string) {
    // todo: make a switch statement that loads a different widget (settings container) for each setting (that way it's extra customized and stuff)
  }
}
