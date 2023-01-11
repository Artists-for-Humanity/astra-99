import { Scene } from 'phaser';

export default class MainMenu extends Scene {
  constructor() {
    super({ key: 'Menu' });
  }
  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    this.load.image('menu', new URL('../assets/images/menu-option.png', import.meta.url).href);
    this.load.image('menu-selected', new URL('../assets/images/menu-option-selected.png', import.meta.url).href);
  }
  create() {
    console.log('create');
  }
  update() {
    // gonna update this with button code and things like that
  }
}
