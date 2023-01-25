import { Scene, Types, Math as PhaserMath } from 'phaser';
import WebFontFile from '../managers/WebFontLoader';
import DirectoryManager from '../managers/DirectoryManager';
import SongList from '../managers/SongListManager';

const directories = new DirectoryManager();
const difficulties = ['light', 'hyper', 'extreme'] as const;
const diffLocationMap: { vector: PhaserMath.Vector2, color: string}[] = [
  { vector: new PhaserMath.Vector2(51, 95), color: '' },
  { vector: new PhaserMath.Vector2(335, 328), color: '' },
  { vector: new PhaserMath.Vector2(51, 555), color: '' },
];
const songlist = new SongList();

interface SongData {
  songId: string,
  songArtist: string,
  songTitle: string,
  bpm: number,
}
export default class DifficultySelect extends Scene {
  controls?: Types.Input.Keyboard.CursorKeys;
  songData?: SongData;
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
    const song = songlist.getSongById(this.songData!.songId);
    this.controls = this.input.keyboard.createCursorKeys();
    // const lightDifficulty = this.add.container(51, 95);
    for (const diff of difficulties) {
      const difficulty = diffLocationMap[difficulties.indexOf(diff)];
      if (song!.difficulties.total.includes(diff)) {
        const background = this.add.image(difficulty.vector.x, difficulty.vector.y, `${diff}-bg`).setOrigin(0);
        this.add.text(background.getCenter().x, background.getCenter().y, song!.difficulties[diff]!.level.toString());
      } else {
        const background = this.add.image(difficulty.vector.x, difficulty.vector.y, `${diff}-bg`).setOrigin(0).setAlpha(0.6);
        this.add.text(background.getCenter().x, background.getCenter().y, '0', {

        }).setOrigin(0.5, 0.3);
      }
    }
    const light = this.add.image(51, 95, 'light-bg').setOrigin(0);
    this.add.text(light.getCenter().x, light.getCenter().y, '12', {
      color: '#FFFFFF',
      font: '96px Audiowide',
      stroke: '#35cf72',
      strokeThickness: 10,
    }).setOrigin(0.5, 0.3);
    const hyper = this.add.image(335, 328, 'hyper-bg').setOrigin(0);
    const extreme = this.add.image(51, 555, 'extreme-bg').setOrigin(0);
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
    if (this.input.keyboard.checkDown(this.controls!.up, 200)) {
      console.log('up');
    }

    if (this.input.keyboard.checkDown(this.controls!.down, 200)) {
      console.log('down');
    }

    if (this.input.keyboard.checkDown(this.controls!.space, 100)) {
      this.scene.start('Gameplay', {
        songId: this.songData!.songId,
        songArtist: this.songData!.songArtist,
        songTitle: this.songData!.songTitle,
        bpm: this.songData!.bpm,
        difficulty: this.difficulty,
      });
    }

    if (this.input.keyboard.checkDown(this.controls!.shift, 100)) {
      this.scene.start('SongSelect');
    }
  }
}