interface Song {
  id: string,
  title: string,
  artist: string,
  album?: string,
  source?: string,
  bpm: number,
}

const Tracks: Song[] = [
  {
    id: '001',
    title: 'Illness LiLin',
    artist: 'Kaneko Chiharu',
    source: 'SDVX Heavenly Haven',
    bpm: 280,
  },
  {
    id: '002',
    title: 'Let\'s All Love Lain',
    artist: 'TOKYOPILL',
    album: 'Abandon the Flesh!',
    bpm: 171,
  },
  {
    id: '003',
    title: 'DESTROY The Wired',
    artist: 'TOKYOPILL',
    album: 'Welcome To The Wired!',
    bpm: 180,
  },
];

export default class SongList {
  public list: Song[];
  constructor(songs?: Song[]) {
    this.list = songs || Tracks;
  }

  addSong(songData: Song) {
    this.list.push(songData);
    return this;
  }

  addSongs(songData: Song[]) {
    this.list.push(...songData);
  }

  getSongById(id: string) {
    return this.list.find((item) => item.id === id);
  }

  getSongs(): Song[] {
    return this.list;
  }
}