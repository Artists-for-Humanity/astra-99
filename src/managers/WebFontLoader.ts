import Phaser from 'phaser';

import WebFontLoader from 'webfontloader';

export default class WebFontFile extends Phaser.Loader.File {
	/**
	 * @param {Phaser.Loader.LoaderPlugin} loader
	 * @param {string | string[]} fontNames
	 * @param {string} [service]
	 */
  fontNames: any[];
  service: any;
	constructor(loader: any, fontNames: string[], service = 'google') {
		super(loader, {
			type: 'webfont',
			key: fontNames.toString(),
		});

		this.fontNames = Array.isArray(fontNames) ? fontNames : [fontNames];
		this.service = service;
	}

	load() {
		const config: {
      active: () => void,
      google?: {
        families: any[],
      }
    } = {
			active: () => {
				this.loader.nextFile(this, true);
			},
		};

		switch (this.service) {
			case 'google':
				config['google'] = {
					families: this.fontNames,
				};
				break;

			default:
				throw new Error('Unsupported font service');
		}
		
		WebFontLoader.load(config);
	}
}