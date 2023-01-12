import { GameObjects, Scene, Types } from 'phaser';
import WebFontFile from '../managers/WebFontLoader';
import DirectoryManager from '../managers/DirectoryManager';
import SongList from '../managers/SongListManager';

const directories = new DirectoryManager();
const songlist = new SongList();

export default class SongSelect extends Scene {
  gameStart?: Types.Input.Keyboard.CursorKeys;
  songs?: GameObjects.Group;
  scrollLimit: number[];
  constructor() {
    super({ key: 'SongSelect' });
    this.songs;
    this.scrollLimit = [0, 1];
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
  }
  create() {
    this.gameStart = this.input.keyboard.createCursorKeys();
    console.log('create');
    this.add.image(330, 500, 'songlist-stats');
    this.add.text(779, 36, 'SONG SELECT', {
      fontFamily: 'Audiowide',
      fontSize: '96px',
      color: '#fff',
      align: 'right',
    });
    const currentId = this.add.text(569 - 42, 788, '???', {
      fontFamily: 'Audiowide',
      fontSize: '64px',
      color: '#D73159',
      align: 'center',
    }).setState(0);
    // this.add.rectangle(1193, 1000 - (850 / 2), 750, 850).setFillStyle(0xffffff).setVisible(true)
    const songScrollRegion = this.make.graphics({ x: 0, y: 0 })
      .beginPath()
      .fillStyle(0xffffff, 1)
      .fillRect(1193 - 350, 1000 - (850), 750, 800)
      .createGeometryMask();
    // songGraphics.setMask();
    this.songs = this.add.group();
    for (let i = 0; i < songlist.list.length; i++) {
      const bg = this.add.image(0, 0, 'songlist-item').setName('song-card'); // FORMERLY 288
      const songTitle = this.add.text(-300, -50, songlist.list[i].title.toUpperCase(), { // FORMERLY 232
        fontFamily: 'Share Tech',
        fontSize: '48px',
        color: '#fff',
        align: 'left',
      });
      const songArtist = this.add.text(-300, 0, songlist.list[i].artist.toUpperCase(), { // FORMERLY 291
        fontFamily: 'Share Tech',
        fontSize: '40px',
        color: '#fff',
        align: 'left',
      });
      const songId = this.add.text((569 / 2) - 60, (157 / 4) - 3, songlist.list[i].id, { // FORMERLY 1412, 324
        fontFamily: 'Audiowide',
        fontSize: '32px',
        color: '#bcd6ec',
        align: 'center',
      });
      const item = this.add.container(1193, 288 + (250 * i), [bg, songId, songTitle, songArtist]).setMask(songScrollRegion);
      this.songs.add(item);

      // each item in the song list has a hitarea they can interact with
      this.add.rectangle(1193, 288 + (250 * i), bg.width, bg.height).setInteractive().addListener('pointerup', () => {
        currentId.setText(songlist.list[i].id);
        if (currentId.style.color !== '#BBD4EB') {
          currentId.setColor('#BBD4EB');
        }
      });
    }

    this.add.image(1376, 920, 'play-song').setInteractive().addListener('pointerup', () => {
      if (currentId.text === '???' || currentId.state !== 0) {
        return;
      } else {
        currentId.state = 1;
        this.scene.start('Gameplay', {
          songId: currentId.text,
          songArtist: songlist.getSongById(currentId.text)!.artist,
          songTitle: songlist.getSongById(currentId.text)!.title,
        });
      }
    });
  }

  update() {
    const limit = 538;
    if (this.input.keyboard.checkDown(this.gameStart!.down, 250)) {
      console.log((this.songs?.getChildren()[0] as GameObjects.Container).getByName('song-card'));
      // if ()
      this.songs!.incY(250);
    }

    if (this.input.keyboard.checkDown(this.gameStart!.up, 250)) {
      this.songs!.incY(-250);
    }

    // if (this.input.keyboard.checkDown(this.gameStart!.space, 750)) {
    //   if (currentId.text === '???' || currentId.state !== 0) {
    //     return;
    //   } else {
    //     currentId.state = 1;
    //     this.scene.start('Gameplay', {
    //       songId: currentId.text,
    //       songArtist: songlist.getSongById(currentId!.text)!.artist,
    //       songTitle: songlist.getSongById(currentId!.text)!.title,
    //       bpm: songlist.getSongById(currentId.text)!.bpm,
    //     });
    //   }
    // }
  }
}