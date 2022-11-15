import { Scene, GameObjects, Types } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import Beatmap from '../managers/BeatmapManager';
import Parser from 'osu-parser';

const directories = new DirectoryManager();

const utils = {
    center: {
        x: (1600 / 2),
        y: (900 / 2),
    },
}

type BeatmapObj = {
    type: string;
    startTime: number;
    column: number;
    endTime: number;
}[]

type NumberText = {text?: Phaser.GameObjects.Text, value: number}
interface GameData {
  scrollSpeed: number,
  score: NumberText,
  accuracy: NumberText,
  maxCombo: NumberText,
  combo: NumberText,
}
export default class GameplayScene extends Scene {
    [x: string]: any;
    keybinds: unknown
    components?: GameObjects.Container
    beatmap?: BeatmapObj
    map?: Phaser.Physics.Arcade.Group
    receptorBody?: Phaser.Physics.Arcade.StaticGroup
    timingPoints: {time: number, bpm: number}[] // will work on this later to improve syncing capabilities
    gameData: GameData
  constructor() {
    super({ key: 'GameplayScene' });
    this.keybinds;
    this.components;
    this.beatmap;
    this.map;
    this.receptorBody;
    this.timingPoints = []; // to be improved
    this.gameData = {
      scrollSpeed: 10,
      score: {
        value: 0,
      },
      accuracy: {
        value: 100.0,
      },
      maxCombo: {
        value: 0,
      },
      combo: {
        value: 0,
      },
    }
  }
  preload() {

    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    directories.getImages('gameplay').forEach(image => {
        try {
            this.load.image(image.name, new URL(`http://127.0.0.1:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href);
        } catch (err) {
            console.log(err);
        }
    });
    directories.getImages('menu').forEach(image => {
        try {
            this.load.image(image.name, new URL(`http://127.0.0.1:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href);
        } catch (err) {
            console.log(err);
        }
    });
    this.load.plugin('rexcontainerliteplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcontainerliteplugin.min.js', true);
    // const beatmap = new Beatmap()
    this.load.text('beatmap', new URL('http://127.0.0.1:8080/assets/beatmaps/beatmap.osu').href);
    const audioCheck = () => {
      window.AudioContext = window.AudioContext
      if (window.AudioContext){
        return true;
      }
      else {
        return false;
      }
    };

    if (audioCheck()) {
      new window.AudioContext();
    }
    this.load.audio('beatmap-audio', new URL('http://127.0.0.1:8080/assets/beatmaps/001/audio.mp3').href)
    this.sound.volume
}
  create() {
    this.sound.add('beatmap-audio');
    this.beatmap = Beatmap(this.cache.text.get('beatmap'));
    console.log(Parser.parseContent(this.cache.text.get('beatmap')));
    this.keybinds = this.input.keyboard.addKeys('Q,W,O,P');
    // this.add.image((window.this.game.canvas.height / 2), (window.this.game.canvas.height - (999 / 2)), 'track');
    // this.add.sprite()

    // building the rhythm game track and the chutes for the notes
    const Track = this.add.sprite((this.game.canvas.width / 2), (this.game.canvas.height / 2) - (99 / 4), 'track');
    const chuteMapping = [Track.x - 199, Track.x - 66, Track.x + 66, Track.x + 199]
    const Chute = [this.add.sprite((Track.x - 200), utils.center.y, 'chute')];
    const Chutes = this.add.container(0, 0, [0, 1, 2, 3].map(column => {
        // each chute within the columns is referred to as its own chute ex. chute-0
        const NextChute = this.add.sprite((chuteMapping[column]), utils.center.y, 'chute');
        NextChute.setName('chute-' + column.toString());
        return NextChute;
    }));
    const Receptors = this.physics.add.staticGroup([0, 1, 2, 3].map(column => {
        const receptor = this.physics.add.sprite(chuteMapping[column], this.game.canvas.height - 150, 'note-receptor');
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
        const res = this.add.sprite(col.x, (note.startTime * -1.21) - 930, 'note').setScale(0.95);
        res.setName(`note-${note.startTime}`);
        return res;
    });
    this.map = this.physics.add.group(noteSet, {name: 'beatmapNotes'});

    Receptors.setDepth(2);
    this.map.setDepth(1);
    FullTrack.setDepth(0);

    // this.map!.children.iterate(note => {
    //     this.physics.add.overlap(note, Receptors, () => {
    //         console.log('hit');
    //     }, undefined, this)
    // })
    this.receptorBody = Receptors;

    // adding text
    this.gameData.accuracy.text = this.add.text(this.game.canvas.width - 250, 100, '100.0%', {
      fontSize: '64px',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });

    this.gameData.score.text = this.add.text(this.game.canvas.width - 300, 16, '0000000', {
      fontSize: '72px',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });

    this.gameData.combo.text = this.add.text(this.game.canvas.width - 250, this.game.canvas.height - 100, '0x', {
      fontSize: '64px',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });
    this.physics.pause()
    if (window.AudioContext) {
      this.sound.play('beatmap-audio');
      this.physics.resume();
    }

    this.gameData.scrollSpeed = Math.abs(this.receptorBody!.getChildren()[0].body.position.y - this.map!.getChildren()[0].body.position.y) / 750
    console.log(this.gameData.scrollSpeed)
}
  update() {
    this.map!.incY(21);

    const referenceKeys = ['Q', "W", "O", "P"]


    for (const key of referenceKeys) {
        this.input.keyboard.on('keydown-' + key, () => {
            const column = referenceKeys.indexOf(key);
            (this.components!.getByName('chutes') as GameObjects.Container).getByName('chute-' + column.toString()).setState(1);

            if (this.physics.overlap(this.map!, this.receptorBody!.getChildren().find(r => r.name === `receptor-${column}`))) {
                const recCol = this.receptorBody!.getChildren().find(r => r.name === `receptor-${column}`)
                this.trackAndDeleteNote(this.map!, recCol);
            }

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
    
    
  }

  trackAndDeleteNote(notes: Phaser.Physics.Arcade.Group | undefined, receptor: any) {
    const note = notes!.getChildren().find((n: GameObjects.GameObject) => {
        return this.physics.overlap(n, receptor);
    });

    if(note!.state === 3) return; // this only calls the deletion and judgement once
    const noteInput = note!.body.position.y
    const baseline = this.receptorBody!.getChildren()[0].body.position.y
    note?.setState(3);
    this.map!.remove(note!, true, true);
    this.judgeNote(noteInput, baseline)
  }
  judgeNote(noteY: number, baseline: number) {
    const judgement = Math.abs(noteY - baseline);
    if (judgement >= 100) {
      return 50;
    } else if (judgement >= 75) {
      return 100;
    } else if (judgement >= 50) {
      return 200;
    } else if (judgement >= 15) {
      return 300;
    }
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