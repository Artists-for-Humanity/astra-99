interface Images {
  menu: string[];
  gameplay: string[];
  gameplayResults: string[];
  songSelect: string[];
  settings: string[];
  difficultySelect: string[];
}

interface ImageItem {
  name: string;
  category: string;
  link: string;
}

type ImageCategory = keyof Images;

export default class DirectoryManager {
  scenes: string[];
  images: Images;
  beatmaps: string[];
  fx: string[];

  constructor() {
    this.scenes = ['GameplayScene', 'Menu'];
    this.images = {
      menu: ['menu-option', 'menu-option-selected', 'menu-gradient', 'title', 'mode-selector', 'title', 'menu-bg'],
      gameplay: [
        'baseline-calibrator',
        'chute',
        'hp-bar',
        'hp-drain',
        'note-hold',
        'note-receptor',
        'note-end',
        'note',
        'track',
        'chute-enabled',
      ],
      gameplayResults: ['character-ranking', 'ranking-X', 'ranking-S', 'ranking-A', 'ranking-B', 'ranking-C', 'ranking-D' ],
      songSelect: ['songlist-item', 'songlist-stats', 'play-song', 'song-selector'],
      difficultySelect: ['light-bg', 'hyper-bg', 'extreme-bg', 'trigger-prompt'],
      settings: ['setting-active-bg', 'setting-inactive-bg', 'shadow'],
    };
    this.beatmaps = ['001', '002', '003', '004', '005', '006'];
    this.fx = ['scene-switch.wav', 'enter-game.wav'];
  }

  getImages(category: ImageCategory): ImageItem[] {
    return this.images[category].map((item) => {
      return {
        name: item,
        category: category,
        link: new URL(`http://127.0.0.1:8080/assets/images/${category}/${item}.png`, import.meta.url).href,
      };
    });
  }

  getScenes(): string[] {
    return this.scenes.map(
      (scene) => new URL(`http://127.0.0.1:8080/assets/images/${scene}.ts`, import.meta.url).href,
    );
  }

  getBeatmaps(): string[] {
    return this.beatmaps;
  }

  getSoundEffects(): string[] {
    return this.fx;
  }
}
