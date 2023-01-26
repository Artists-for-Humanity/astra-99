const difficulties = ['light', 'hyper', 'extreme'] as const;

interface Song {
  id: string,
  title: string,
  artist: string,
  album?: string,
  source?: string,
  bpm: number,
  difficulties: {
    total: typeof difficulties[number][],
    light?: {
      level: number,
    },
    hyper?: {
      level: number,
    },
    extreme?: {
      level: number,
    }
  }
}

const Tracks: Song[] = [
  {
    id: '001',
    title: 'Illness LiLin',
    artist: 'Kaneko Chiharu',
    source: 'SDVX Heavenly Haven',
    bpm: 280,
    difficulties: {
      total: ['light', 'hyper', 'extreme'],
      light: {
        level: 9,
      },
      hyper: {
        level: 12,
      },
      extreme: {
        level: 16,
      },
    },
  },
  {
    id: '002',
    title: 'Bangin\' Burst',
    artist: 'Camellia',
    source: 'SOUND VOLTEX II -infinite infection-',
    bpm: 171,
    difficulties: {
      total: ['light', 'hyper', 'extreme'],
      light: {
        level: 9,
      },
      hyper: {
        level: 12,
      },
      extreme: {
        level: 16,
      },
    },
  },
  {
    id: '003',
    title: 'Angellic Jelly',
    artist: 't+pazolite',
    source: 'SOUND VOLTEX III GRAVITY WARS',
    bpm: 180,
    difficulties: {
      total: ['light', 'hyper', 'extreme'],
      light: {
        level: 9,
      },
      hyper: {
        level: 12,
      },
      extreme: {
        level: 16,
      },
    },
  },
  {
    id: '004',
    title: 'Go Beyond!!',
    artist: 'Ryu* Vs. Sota',
    source: 'beatmania IIDX 13 DistorteD CS',
    bpm: 200,
    difficulties: {
      total: ['light', 'hyper', 'extreme'],
      light: {
        level: 9,
      },
      hyper: {
        level: 12,
      },
      extreme: {
        level: 16,
      },
    },
  },
  {
    id: '005',
    title: 'C18H27NO3',
    artist: 'Team Grimoire',
    bpm: 0,
    source: 'SOUND VOLTEX II -infinite infection-',
    difficulties: {
      total: ['light', 'hyper', 'extreme'],
      light: {
        level: 9,
      },
      hyper: {
        level: 12,
      },
      extreme: {
        level: 16,
      },
    },
  },
  {
    id: '006',
    title: 'BLACK or WHITE?',
    artist: 'BlackYooh vs. siromaru',
    source: 'SOUND VOLTEX II -infinite infection-',
    bpm: 0,
    difficulties: {
      total: ['light', 'hyper', 'extreme'],
      light: {
        level: 9,
      },
      hyper: {
        level: 12,
      },
      extreme: {
        level: 16,
      },
    },
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