import { Scene } from 'phaser';
import WebFontFile from '../managers/WebFontLoader';
import DirectoryManager from '../managers/DirectoryManager';
import SongList from '../managers/SongListManager';

const directories = new DirectoryManager();
const songlist = new SongList();

export default class SongSelect extends Scene {
  gameStart: object;

  constructor() {
    super({ key: 'SongSelect' });
    this.gameStart = {};
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
    this.gameStart = this.input.keyboard.addKeys('ENTER,SPACE');
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
    // const songs = [];
    for (let i = 0; i < songlist.list.length; i++) {
      const bg = this.add.image(0, 0, 'songlist-item'); // FORMERLY 288
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
      this.add.container(1193, 288 + (250 * i), [bg, songId, songTitle, songArtist]);

      // each item in the song list has a hitarea they can interact with
      this.add.rectangle(1193, 288 + (250 * i), bg.width, bg.height).setInteractive().addListener('pointerup', () => {
        currentId.setText(songlist.list[i].id);
        console.log(currentId.text);
        if (currentId.style.color !== '#BBD4EB') {
          currentId.setColor('#BBD4EB');
        }
      });

      for (const key of ['ENTER', 'SPACE']) {
        this.input.keyboard.on('keydown-' + key, () => {
          if (currentId.text === '???' || currentId.state !== 0) {
            return;
          } else {
            currentId.state = 1;
            this.scene.start('Gameplay', {
              songId: currentId.text,
              songArtist: songlist.getSongById(currentId.text)!.artist,
              songTitle: songlist.getSongById(currentId.text)!.title,
              bpm: songlist.getSongById(currentId.text)!.bpm,
            });
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
  }
}