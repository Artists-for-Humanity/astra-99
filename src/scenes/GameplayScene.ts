import { Scene, GameObjects, Types } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import Beatmap from '../managers/BeatmapManager';

const directories = new DirectoryManager();

const utils = {
    center: {
        x: (window.innerWidth / 2),
        y: (window.innerHeight / 2),
    },
}

type BeatmapObj = {
    type: string;
    startTime: number;
    column: number;
    endTime: number;
}[]

export default class GameplayScene extends Scene {
    [x: string]: any;
    keybinds: unknown
    components?: GameObjects.Container
    beatmap?: BeatmapObj
    map?: Phaser.Physics.Arcade.Group
    receptorBody?: Phaser.Physics.Arcade.StaticGroup
  constructor() {
    super({ key: 'GameplayScene' });
    this.keybinds;
    this.components;
    this.beatmap;
    this.map;
    this.receptorBody;
  }
  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    directories.getImages('gameplay').forEach(image => {
        try {
            this.load.image(image.name, new URL(`http://192.168.4.133:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href);
        } catch (err) {
            console.log(err);
        }
    });
    directories.getImages('menu').forEach(image => {
        try {
            this.load.image(image.name, new URL(`http://192.168.4.133:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href);
        } catch (err) {
            console.log(err);
        }
    });
    this.load.plugin('rexcontainerliteplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcontainerliteplugin.min.js', true);
    // const beatmap = new Beatmap()
    this.load.text('beatmap', new URL('http://192.168.4.133:8080/assets/beatmaps/beatmap.osu').href);
    new AudioContext().resume();
    this.load.audio('beatmap-audio', new URL('http://192.168.4.133:8080/assets/beatmaps/001/audio.mp3').href)
    
}
  create() {
    
    this.sound.add('beatmap-audio');
    this.beatmap = Beatmap(this.cache.text.get('beatmap'));
    this.keybinds = this.input.keyboard.addKeys('Q,W,O,P');
    // this.add.image((window.innerWidth / 2), (window.innerHeight - (999 / 2)), 'track');
    // this.add.sprite()

    // building the rhythm game track and the chutes for the notes
    const Track = this.add.sprite((window.innerWidth / 2), (window.innerHeight - (999 / 2)), 'track');
    Track.setState('unpressed')
    const chuteMapping = [Track.x - 199, Track.x - 66, Track.x + 66, Track.x + 199]
    const Chute = [this.add.sprite((Track.x - 200), utils.center.y, 'chute')];
    const Chutes = this.add.container(0, 0, [0, 1, 2, 3].map(column => {
        // each chute within the columns is referred to as its own chute ex. chute-0
        const NextChute = this.add.sprite((chuteMapping[column]), utils.center.y, 'chute');
        NextChute.setName('chute-' + column.toString());
        return NextChute;
    }));
    const Receptors = this.physics.add.staticGroup([0, 1, 2, 3].map(column => {
        const receptor = this.physics.add.sprite(chuteMapping[column], innerHeight - 150, 'note-receptor');
        receptor.setName('receptor-' + column.toString());
        return receptor;
    }));
    
    Chutes.setName('chutes')
    const FullTrack = this.add.container(0, 0, [Chutes, Track]);

    FullTrack.moveBelow(Chutes, Track);
    this.components = FullTrack

    // BUILDING BEATMAPS
    const noteSet = this.beatmap.map(note => {
        const col = (this.components!.getByName('chutes') as GameObjects.Container).getByName('chute-'+ note.column.toString()) as GameObjects.Sprite;
        const res = this.add.sprite(col.x, (note.startTime * -1), 'note');
        res.setName(`note-${note.startTime}`);
        return res;
    });
    this.map = this.physics.add.group(noteSet, {name: 'beatmapNotes'});

    Receptors.setDepth(2);
    this.map.setDepth(1);
    FullTrack.setDepth(0);

    this.map!.children.iterate(note => {
        this.physics.overlap(note, Receptors, () => {
            console.log('hit');
        })
    })
    this.receptorBody = Receptors;
    
}
  update() {
    this.map!.incY(10.41);
    const referenceKeys = ['Q', "W", "O", "P"]


    for (const key of referenceKeys) {
        this.input.keyboard.on('keydown-' + key, () => {
            const column = referenceKeys.indexOf(key);
            (this.components!.getByName('chutes') as GameObjects.Container).getByName('chute-' + column.toString()).setState(1);

            // // this.receptorBody?.getChildren().find(c => c.name === `receptor-${column}`)!.state == 1
            // const hitNote = this.map!.getChildren().find(n => n.state === 1);
            // this.pressNote(this.receptorBody?.getChildren().find(c => c.name === `receptor-${column}`)!.state == 1, hitNote)

        });
        this.input.keyboard.on('keyup-' + key, () => {
            const column = referenceKeys.indexOf(key);
            (this.components!.getByName('chutes') as GameObjects.Container).getByName('chute-' + column.toString()).setState(0);
        })
    }
    (this.components!.getByName('chutes') as GameObjects.Container).iterate((chute: GameObjects.Sprite) => { // animate each chute on press
        if (chute.state === 1) {
            chute.setTexture('chute-enabled');
        } else {
            chute.setTexture('chute');
        }
    });
    this.sound.play('beatmap-audio');
  }

  trackAndDeleteNote(note: any) {

  }
  judgeNote(note: number, baseline: number) {
    // in this function, judge the note and add score based on the placement of the note as well as the user press
  }

  pressNote(column: boolean, note: any) {
    if(column) {
        const hitNote = note;
        console.log(hitNote);

        // const result = {
        //     noteY: hitNote.body.position.y
        // }
        // this.map!.killAndHide(hitNote!);

        // console.log(result);
    }                
}
}