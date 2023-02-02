import { GameObjects, Scene, Types, Math } from 'phaser';
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

interface OptionWidget {
  name: string,
  widget: GameObjects.Group,
  active: boolean,
  onUp: () => void,
  onDown: () => void,
}

const settingIds = ['OFFSET', 'SCROLLSPEED', 'VOLUME'] as const;

export default class Settings extends Scene {
  controls?: Types.Input.Keyboard.CursorKeys;
  settings: Setting[];
  allOptions: OptionWidget[];
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
    this.allOptions = [];
  }

  preload() {
    directories.getImages('settings').forEach(image => {
      this.load.image(image.name, new URL(`http://127.0.0.1:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href);
    });
    this.load.addFile(new WebFontFile(this.load, ['Audiowide', 'Orbitron'], 'google'));
  }

  create() {
    this.controls = this.input.keyboard.createCursorKeys();
    // settings: offset, scroll speed
    if (!localStorage.getItem('offset')) {
      localStorage.setItem('offset', `${0}`);
    }
    if (!localStorage.getItem('scrollspeed')) {
      localStorage.setItem('scrollspeed', `${20}`);
    }
    if (!localStorage.getItem('volume')) {
      localStorage.setItem('volume', `${1}`);
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
      // setting.gameObject = this.add.group();

      const title = this.add.text(800 + (525 * j) - (350 / (1.05 * 2)), 200, setting.name, {
        fixedWidth: 325,
        align: 'center',
        fontFamily: 'Audiowide',
        fontSize: '64px',
      });

      const widget = this.getWidget((setting.id as typeof settingIds[number]), new Math.Vector2(title.getCenter().x, 500), title);
      this.allOptions.push(widget);
    }
    // this.add.text(number, number, 'OFFSET', {
    //   fontFamily: 'Audiowide',

    // });
  }

  update() {
    // CONTROLS
    if (this.input.keyboard.checkDown(this.controls!.up, 300)) {
      this.allOptions.find(option => option.active)!.onUp();
    } else if (this.input.keyboard.checkDown(this.controls!.down, 300)) {
      this.allOptions.find(option => option.active)!.onDown();
    } else if (this.input.keyboard.checkDown(this.controls!.right, 100)) {
      const current = this.allOptions.find(option => option.active);
      const behind = this.allOptions.findIndex(option => option.active) - 1;
      if (current && this.allOptions[behind]) {
        current!.active = false;
        if (this.allOptions[behind] !== undefined) {
          this.allOptions[behind].active = true;
          for (const option of this.allOptions) {
            option.widget.incX(525);
          }
        }
      }
    } else if (this.input.keyboard.checkDown(this.controls!.left, 100)) {
      const current = this.allOptions.find(option => option.active);
      const front = this.allOptions.findIndex(option => option.active) + 1;
      if (current && this.allOptions[front]) {
        current.active = false;
        if (this.allOptions[front] !== undefined) {
          this.allOptions[front].active = true;
          for (const option of this.allOptions) {
            option.widget.incX(-525);
          }
        }
      }
    }
  }

  getWidget(settingName: typeof settingIds[number], location: Math.Vector2, title: GameObjects.Text): OptionWidget {
    // creates a custom widget for each property
    switch (settingName) {
      case 'OFFSET': {
        const propertyText = this.add.text(location.x, 500, (localStorage.getItem('offset') || '0'), {
          fontSize: '64px',
          align: 'center',
          fontStyle: '600',
          fontFamily: 'Orbitron',
        }).setOrigin(0.5);
        
        return {
          name: 'offset',
          widget: this.add.group([title, propertyText]),
          active: false,
          onUp: () => {
            const offset = this.settings.find(property => property.id === settingName);
            offset!.value++;
            localStorage.setItem('offset', `${offset!.value}`);
            propertyText.setText(`${offset!.value}`);
          },
          onDown: () => {
            const offset = this.settings.find(property => property.id === settingName);
            offset!.value--;
            localStorage.setItem('offset', `${offset!.value}`);
            propertyText.setText(`${offset!.value}`);
          },
        };
      }
      case 'SCROLLSPEED': {
        const propertyText = this.add.text(location.x, 500, (localStorage.getItem('scrollspeed') || '20'), {
          fontSize: '64px',
          align: 'center',
          fontStyle: '600',
          fontFamily: 'Orbitron',
        }).setOrigin(0.5);

        return {
          name: 'scrollspeed',
          widget: this.add.group([title, propertyText]),
          active: true,
          onUp: () => {
            const scrollSpeed = this.settings.find(property => property.id === settingName);
            if (this.input.keyboard.checkDown(this.controls!.shift)) {
              scrollSpeed!.value += 0.5;
            } else {
              scrollSpeed!.value++;
            }
            localStorage.setItem('scrollspeed', `${scrollSpeed!.value}`);
            propertyText.setText(`${scrollSpeed!.value}`);
          },
          onDown: () => {
            const scrollSpeed = this.settings.find(property => property.id === settingName);
            if (this.input.keyboard.checkDown(this.controls!.shift)) {
              scrollSpeed!.value -= 0.5;
            } else {
              scrollSpeed!.value--;
            }
            localStorage.setItem('scrollspeed', `${scrollSpeed!.value}`);
            propertyText.setText(`${scrollSpeed!.value}`);
          },
        };
      }
      case 'VOLUME': {
        const propertyText = this.add.text(location.x, 500, ((parseFloat(localStorage.getItem('volume')!) * 100).toString() || this.settings[2].default.toString()), {
          fontSize: '64px',
          align: 'center',
          fontStyle: '600',
          fontFamily: 'Orbitron',
        }).setOrigin(0.5);

        return {
          name: 'volume',
          widget: this.add.group([title, propertyText]),
          active: false,
          onUp: () => {
            const volume = this.settings.find(property => property.id === settingName);
            if (volume!.value < 100) {
              if (this.input.keyboard.checkDown(this.controls!.shift)) {
                volume!.value += 0.5;
              } else {
                volume!.value++;
              }
              if (volume!.value + 1 >= 100) {
                volume!.value = 100;
              }
            }
            localStorage.setItem('volume', `${volume!.value / 100}`);
            propertyText.setText(`${volume!.value}`);
            this.sound.volume = parseFloat(localStorage.getItem('volume')!);
          },
          onDown: () => {
            const volume = this.settings.find(property => property.id === settingName);
            if (volume!.value > 0) {
              if (this.input.keyboard.checkDown(this.controls!.shift)) {
                volume!.value -= 0.5;
              } else {
                volume!.value--;
              }
              if (volume!.value - 1 <= 0) {
                volume!.value = 0;
              }
            }
            localStorage.setItem('volume', `${volume!.value / 100}`);
            this.sound.volume = parseFloat(localStorage.getItem('volume')!);
            propertyText.setText(`${volume!.value}`);
          },
        };
      }
      }
    }
}