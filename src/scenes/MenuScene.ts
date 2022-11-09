import { Scene, GameObjects } from 'phaser';
import * as WebFont from 'webfontloader';

export default class MenuScene extends Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    this.load.image('menu', new URL('../assets/images/menu-option.png', import.meta.url).href);
    this.load.image('menu-selected', new URL('../assets/images/menu-option-selected.png', import.meta.url).href);
  }
  create() {
    WebFont.load({
      google: {
        families: ['Lato']
      },
      active: () => {
        this.add.text((window.innerWidth - 600), 16, 'ASTRA 99', {
          fontFamily: 'Lato',
          fontSize: '128px',
        })
      },
      inactive: () => {
        console.log('something happened...')
      },
    });
    this.add.image((window.innerWidth - 250), 225, 'menu').scaleX = 2;
  }
  update() {

  }
}