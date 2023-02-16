import { GameObjects, Scene, Types } from 'phaser';
import WebFontFile from '../managers/WebFontLoader';
import DirectoryManager from '../managers/DirectoryManager';
import SongList from '../managers/SongListManager';

const directories = new DirectoryManager();
const songlist = new SongList();

export default class SongSelect extends Scene {
  gameStart?: Types.Input.Keyboard.CursorKeys;
  songs?: GameObjects.Group;
  activeSong?: GameObjects.Container;
  constructor() {
    super({ key: 'SongSelect' });
    this.songs;
    this.activeSong;
  }
  preload() {
    this.load.addFile(new WebFontFile(this.load, ['Audiowide', 'Share Tech'], 'google'));
    directories.getImages('songSelect').forEach((image) => {
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

  init() {
    console.log('starting:');
  }

  create() {
    console.log('creating');
    this.gameStart = this.input.keyboard.createCursorKeys();
    this.add.image(330, 500, 'songlist-stats');
    this.add.text(779, 36, 'SONG SELECT', {
      fontFamily: 'Audiowide',
      fontSize: '96px',
      color: '#fff',
      align: 'right',
    });
    // this is the region in which song cards are able to be viewed (and are clipped when they exceed the bounds of this region)
    const songScrollRegion = this.make.graphics({ x: 0, y: 0 })
      .beginPath()
      .fillStyle(0xffffff, 1)
      .fillRect(1193 - 350, 1000 - (850), 750, 800)
      .createGeometryMask();

    this.songs = this.add.group();

    this.add.image(821, 505, 'song-selector').setDepth(2);

    for (let i = 0; i < songlist.list.length; i++) {
      const bg = this.add.image(0, 0, 'songlist-item');
      const songTitle = this.add.text(-300, -50, songlist.list[i].title.toUpperCase(), {
        fontFamily: 'Share Tech',
        fontSize: '48px',
        color: '#fff',
        align: 'left',
      }).setName('song-title');
      const songArtist = this.add.text(-300, 0, songlist.list[i].artist.toUpperCase(), {
        fontFamily: 'Share Tech',
        fontSize: '40px',
        color: '#fff',
        align: 'left',
      }).setName('song-artist');
      const songId = this.add.text((569 / 2) - 60, (157 / 4) - 3, songlist.list[i].id, {
        fontFamily: 'Audiowide',
        fontSize: '32px',
        color: '#bcd6ec',
        align: 'center',
      }).setName('song-id');
      const item = this.add.container(1193, 500 + (200 * i), [bg, songId, songTitle, songArtist]).setMask(songScrollRegion);
      this.songs.add(item);
    }
  }

  update() {
    if (!this.activeSong) {
      this.activeSong = (this.songs?.getChildren() as GameObjects.Container[]).find(song => song.y == 500);
    }
    if (this.input.keyboard.checkDown(this.gameStart!.up, 200) && (this.songs?.getChildren()[0] as GameObjects.Container).y !== 500) {
      this.songs!.incY(200);
      this.activeSong = (this.songs?.getChildren() as GameObjects.Container[]).find(song => song.y == 500);
    }

    if (this.input.keyboard.checkDown(this.gameStart!.down, 200) && (this.songs?.getChildren()[this.songs!.getChildren().length - 1] as GameObjects.Container).y !== 500) {
      this.songs!.incY(-200);
      this.activeSong = (this.songs?.getChildren() as GameObjects.Container[]).find(song => song.y == 500);
    }

    if (this.input.keyboard.checkDown(this.gameStart!.space, 100)) {
      this.sound.play('enter-game');
      const songSelected = (() => {
        try {
          return songlist.getSongById(
            (this.activeSong?.getByName('song-id') as GameObjects.Text).text,
          );
        } catch {
          console.log(songlist.getSongById('001'));
          return songlist.getSongById('001');
        }
      })();
      console.log(songSelected);
      this.scene.stop();
      this.scene.start('DifficultySelect', {
        songId: songSelected!.id,
        songArtist: songSelected!.artist,
        songTitle: songSelected!.title,
        bpm: songSelected!.bpm,
      });
    }

    if (this.input.keyboard.checkDown(this.gameStart!.shift, 100)) {
      this.scene.stop();
      this.scene.start('Menu');
    }
  }
}