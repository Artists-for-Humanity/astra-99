interface Images {
  menu: string[];
  gameplay: string[];
  gameplayResults: string[];
  songSelect: string[];
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

  constructor() {
    this.scenes = ['GameplayScene', 'Menu'];
    this.images = {
      menu: ['menu-option', 'menu-option-selected'],
      gameplay: [
        'baseline-calibrator',
        'chute',
        'hp-bar',
        'hp-drain',
        'note-hold',
        'note-receptor',
        'note',
        'track',
        'chute-enabled',
      ],
      gameplayResults: ['results-ceres', 'ranking-X', 'ranking-S', 'ranking-A', 'ranking-B', 'ranking-C', 'ranking-D' ],
      songSelect: ['songlist-item', 'songlist-stats', 'play-song'],
    };
    this.beatmaps = ['001', '002', '003'];
  }

  getImages(category: ImageCategory): ImageItem[] {
    // relative to the /scenes directory
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
}
