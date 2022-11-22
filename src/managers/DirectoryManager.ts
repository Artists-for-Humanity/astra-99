interface Images {
  menu: string[];
  gameplay: string[];
}

interface Beatmap {
  id: number;
  fileName: string;
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
  beatmaps: number[];

  constructor() {
    this.scenes = ['GameplayScene', 'MenuScene'];
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
    };
    this.beatmaps = [1];
  }

  getImages(category: ImageCategory): ImageItem[] {
    // relative to the /scenes directory
    return this.images[category].map((item) => {
      return {
        name: item,
        category: category,
        link: new URL(`http://192.168.4.133:8080/assets/images/${category}/${item}.png`, import.meta.url).href,
      };
    });
  }

  getScenes(): string[] {
    return this.scenes.map(
      (scene) => new URL(`http://192.168.4.133:8080/assets/images/${scene}.ts`, import.meta.url).href,
    );
  }

  getBeatmaps(): Beatmap[] {
    return this.beatmaps.map((beatmapId: number) => {
      return {
        fileName: 'beatmap.osu',
        id: beatmapId,
      };
    });
  }
}
