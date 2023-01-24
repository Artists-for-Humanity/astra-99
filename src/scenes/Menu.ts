import { GameObjects, Scene, Types } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import WebFontFile from '../managers/WebFontLoader';

const directories = new DirectoryManager();
export default class MainMenu extends Scene {
  menuOptions: {
    object: GameObjects.Text,
    sceneName: string,
    selectorY: number,
    active: boolean
  }[];
  cursors?: Types.Input.Keyboard.CursorKeys;
  optionSelector?: GameObjects.Image;
  constructor() {
    super({ key: 'Menu' });
    this.menuOptions = [];
    this.optionSelector;
    this.cursors;
  }
  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    directories.getImages('menu').forEach((image) => {
      try {
        this.load.image(
          image.name,
          new URL(`http://127.0.0.1:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href,
        );
      } catch (err) {
        console.log(err);
      }
    });

    directories.getSoundEffects().forEach((sound) => {
      try {
        this.load.audio(`${sound.split('.')[0]}`, new URL(`http://127.0.0.1:8080/assets/fx/${sound}`, import.meta.url).href);
      } catch (err) {
        console.log(err);
      }
    });

    this.load.addFile(new WebFontFile(this.load, ['Audiowide', 'Share Tech'], 'google'));
  }
  create() {
    this.add.image(800, 500, 'menu-gradient').setDepth(0);
    this.add.image(800, 500, 'menu-bg').setDepth(1);
    this.add.image(800, (1000 - 650), 'title').setName('title').setDepth(2);
    const songSelectText = this.add.text(800 - (391 / 2), 463, 'SONG SELECT', {
      fontFamily: 'Audiowide',
      fontSize: '48px',
    }).setDepth(2);
    const optionsText = this.add.text(800 - (248 / 2), 519, 'OPTIONS', {
      fontFamily: 'Audiowide',
      fontSize: '48px',
    }).setDepth(2);
    this.menuOptions = [{
      object: songSelectText,
      selectorY: songSelectText.getCenter().y,
      sceneName: 'SongSelect',
      active: true,
    }, {
      object: optionsText,
      selectorY: optionsText.getCenter().y,
      sceneName: 'Settings',
      active: false,
    }];

    this.optionSelector = this.add.image(800, this.menuOptions[0].selectorY, 'mode-selector').setName('mode-selector').setDepth(1.5);
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    const current = this.menuOptions.findIndex(opt => opt.active === true);
    const previous = { index: current - 1, gameObject: this.menuOptions[current - 1] };
    const next = { index: current + 1, gameObject: this.menuOptions[current + 1] };
    if (this.input.keyboard.checkDown(this.cursors!.down, 1000)) {
      // keypress down (next option)
      if (this.menuOptions[next.index] && (next.gameObject !== undefined)) {
        this.menuOptions[current].active = false;
        next.gameObject.active = true;
        this.optionSelector!.setY(next.gameObject.selectorY);
      } else {
        this.menuOptions[current].active = false;
        this.menuOptions[0].active = true;
        this.optionSelector!.setY(this.menuOptions[0].selectorY);
      }
    } else if (this.input.keyboard.checkDown(this.cursors!.up, 100)) {
        // keypress up (previous option)
        if (this.menuOptions[previous.index] && (previous.gameObject !== undefined)) {
          this.menuOptions[current].active = false;
          previous.gameObject.active = true;
          this.optionSelector!.setY(previous.gameObject.selectorY);
        } else {
          this.menuOptions[current].active = false;
          this.menuOptions[this.menuOptions.length - 1].active = true;
          this.optionSelector!.setY(this.menuOptions[this.menuOptions.length - 1].selectorY);
        }
    } else if (this.input.keyboard.checkDown(this.cursors!.space, 100)) {
      this.sound.play('scene-switch');
      this.time.delayedCall(750, () => {
        this.scene.start(this.menuOptions[current].sceneName);
      });
    }
  }
}
