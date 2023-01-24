import { Scene, Types } from 'phaser';
import WebFontFile from '../managers/WebFontLoader';
import DirectoryManager from '../managers/DirectoryManager';

const directories = new DirectoryManager();
const difficulties = ['light', 'hyper', 'extreme'] as const;

interface SongData {
  songId: string,
  songArtist: string,
  songTitle: string,
  bpm: number,
}
export default class DifficultySelect extends Scene {
  controls?: Types.Input.Keyboard.CursorKeys;
  songData?: any;
  difficulty?: typeof difficulties[number];
  constructor() {
    super({ key: 'DifficultySelect' });
  }
  preload() {
    this.load.addFile(new WebFontFile(this.load, ['Audiowide', 'Share Tech'], 'google'));
    directories.getImages('difficultySelect').forEach((image) => {
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
  }

  init(data: SongData) {
    console.log(data);
    this.songData = data;
  }

  create() {
    this.controls = this.input.keyboard.createCursorKeys();
    // const lightDifficulty = this.add.container(51, 95);
    this.add.image(51, 95, 'light-bg').setOrigin(0);
    this.add.image(335, 328, 'hyper-bg').setOrigin(0);
    this.add.image(51, 555, 'extreme-bg').setOrigin(0);
    this.add.image(1600, 1000 - 65, 'trigger-prompt').setOrigin(1, 1);

    this.add.text(1600, 0, 'DIFFICULTY SELECT', {
      align: 'right',
      color: '#fff',
      fontFamily: 'Audiowide',
      fontSize: '96px',
    }).setOrigin(1, 0);
    this.add.text(1600, 112, this.songData!.songTitle.toUpperCase(), {
      align: 'right',
      color: '#fff',
      fontFamily: 'Audiowide',
      fontSize: '64px',
    }).setOrigin(1, 0);
    this.add.text(1600, 184, this.songData!.songArtist.toUpperCase(), {
      align: 'right',
      color: '#fff',
      fontFamily: 'Audiowide',
      fontSize: '64px',
    }).setOrigin(1, 0);
  }

  update() {
    if (this.input.keyboard.checkDown(this.controls!.left, 200)) {
      console.log('left');
    }

    if (this.input.keyboard.checkDown(this.controls!.right, 200)) {
      console.log('right');
    }

    if (this.input.keyboard.checkDown(this.controls!.space, 100)) {
      this.scene.start('Gameplay', {
        songId: this.songData!.id,
        songArtist: this.songData!.artist,
        songTitle: this.songData!.title,
        bpm: this.songData!.bpm,
        difficulty: this.difficulty,
      });
    }

    if (this.input.keyboard.checkDown(this.controls!.shift, 100)) {
      this.scene.start('SongSelect');
    }
  }
}