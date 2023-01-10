import { Scene } from 'phaser';\

export default class Menu extends Scene {
  constructor() {
    super({ key: 'Menu' });
  }
  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    this.load.image('menu', new URL('../assets/images/menu-option.png', import.meta.url).href);
    this.load.image('menu-selected', new URL('../assets/images/menu-option-selected.png', import.meta.url).href);
  }
  create() {
    this.add.image(window.innerWidth - 250, 225, 'menu').scaleX = 2;
  }
  update() {
    console.log('blah blah update');
  }
}
