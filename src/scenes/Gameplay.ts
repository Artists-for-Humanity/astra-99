import { Scene, GameObjects, Sound, Input } from 'phaser';
import DirectoryManager from '../managers/DirectoryManager';
import Beatmap from '../managers/BeatmapManager';
import Conductor from '../managers/Conductor';
import SongList from '../managers/SongListManager';
import MapBuilder from '../managers/MapBuilder';

const directories = new DirectoryManager();

const center = {
    x: 1600 / 2,
    y: 1000 / 2,
  };

interface Note {
  type: string;
  startTime: number;
  column: number;
  endTime: number;
}

type BeatmapObj = Note[];

type NumberText = { text?: Phaser.GameObjects.Text; value: number };
interface GameData {
  baseline: number;
  scrollSpeed: number;
  score: NumberText;
  accuracy: NumberText & { arrayVersion: number[] };
  maxCombo: NumberText;
  combo: NumberText;
}
export default class Gameplay extends Scene {
  // scene members
  track?: GameObjects.Sprite;
  beatmapAudio?: Sound.WebAudioSound;
  keybinds: unknown;
  baseline?: GameObjects.Image;
  menuControls: unknown;
  components?: GameObjects.Container;
  beatmap?: BeatmapObj;
  lastNote?: Note;
  map?: Phaser.Physics.Arcade.Group;
  receptorBody?: Phaser.Physics.Arcade.StaticGroup;
  chutes?: Phaser.Physics.Arcade.StaticGroup;
  timingPoints: { time: number; bpm: number }[]; // todo: improve syncing
  gameData: GameData;
  isActiveGameplay: boolean;
  songIsOver: boolean;
  judgements: {
    n0: number;
    n50: number;
    n100: number;
    n200: number;
    n300: number;
  };
  plays: number;
  songId: string;
  conductor: Conductor | undefined;
  mapBuilder?: MapBuilder;
  chain?: GameObjects.Text;

  constructor() {
    super({ key: 'Gameplay' });
    this.songId = '';
    this.keybinds;
    this.chain;
    this.components;
    this.beatmap;
    this.lastNote;
    this.map;
    this.baseline;
    this.receptorBody;
    this.timingPoints = [];
    this.gameData = {
      baseline: 0,
      scrollSpeed: 10,
      score: {
        value: 0,
      },
      accuracy: {
        value: 100.0,
        arrayVersion: [],
      },
      maxCombo: {
        value: 0,
      },
      combo: {
        value: 0,
      },
    };
    this.judgements = {
      n0: 0,
      n50: 0,
      n100: 0,
      n200: 0,
      n300: 0,
    };
    this.plays = 0;
    this.isActiveGameplay = false;
    this.songIsOver = false;
    this.menuControls;
    this.beatmapAudio;
    this.conductor;
    this.mapBuilder;
    this.track;
    this.chutes;
  }

  preload() {
    const songlist = new SongList();
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    directories.beatmaps.forEach((map) => {
      try {
        this.load.audio(`beatmap-audio-${map}`, new URL(`http://127.0.0.1:8080/assets/beatmaps/${map}/audio.mp3`, import.meta.url).href);
        for (const diff of songlist.getSongById(map)!.difficulties.total) {
          this.load.text(`beatmap-${map}-${diff}`, new URL(`http://127.0.0.1:8080/assets/beatmaps/${map}/${diff}.osu`, import.meta.url).href);
        }
      } catch (err) {
        console.log(err);
      }
    });
    directories.getImages('gameplay').forEach((image) => {
      try {
        this.load.image(
          image.name,
          new URL(`http://127.0.0.1:8080/assets/images/${image.category}/${image.name}.png`, import.meta.url).href,
        );
      } catch (err) {
        console.log(err);
      }
    });
  }

  init(data: any) {
    console.log(data);
  }

  create(data: any) {
    this.songId = data.songId;
    this.beatmapAudio = (this.sound.add(`beatmap-audio-${data.songId}`) as Sound.WebAudioSound);
    this.beatmap = Beatmap(this.cache.text.get(`beatmap-${data.songId}-${data.difficulty}`));
    this.lastNote = this.beatmap[this.beatmap.length - 1];
    this.keybinds = this.input.keyboard.addKeys({
      Q: Input.Keyboard.KeyCodes.Q,
      W: Input.Keyboard.KeyCodes.W,
      O: Input.Keyboard.KeyCodes.O,
      P: Input.Keyboard.KeyCodes.P,
      SHIFT: Input.Keyboard.KeyCodes.SHIFT,
    });
    this.menuControls = this.input.keyboard.addKey('SPACE');

    // building the rhythm game track and the "chutes" (basically columns) for the notes
    this.track = this.add.sprite(center.x, center.y /* - (99 / 4) */, 'track').setName('track').setDepth(5);
    const chuteMapping = [this.track.getLeftCenter().x + 10, this.track.getCenter().x, this.track.getCenter().x, this.track.getRightCenter().x - 10]; // [this.track.getCenter().x - (this.track.width * (1 / 4)), this.track.getCenter().x, this.track.getCenter().x, this.track.getRightCenter().x - (this.track.width * (1 / 4))];
    const Chutes = this.physics.add.staticGroup(
      [0, 1, 2, 3].map((column) => {
        // each chute within the columns is referred to as its own chute ex. chute-0
        const NextChute = this.add.sprite(chuteMapping[column], center.y - 27, 'chute')
          .setName('chute-' + column.toString())
          .setDepth(0);
        if (column == 1 || column == 3) {
          NextChute.setOrigin(1, 0.5);
        } else if (column == 0 || column == 2) {
          NextChute.setOrigin(0, 0.5);
        }
        return NextChute;
      }),
    );
    const Receptors = this.physics.add.staticGroup(
      [0, 1, 2, 3].map((column) => {
        const receptor = this.physics.add.sprite((Chutes.getChildren()[column] as GameObjects.Sprite).getCenter().x, 800, 'note-receptor')
          .setName('receptor-' + column.toString())
          .setOrigin(0.5, 0)
          .setDepth(1)
          .setVisible(false);
        return receptor;
      }),
    );

    Chutes.setName('chutes');

    this.chutes = Chutes;
    this.map = this.physics.add.group([], { name: 'beatmapNotes' }).setDepth(2);

    this.receptorBody = Receptors;

    // adding text
    this.gameData.accuracy.text = this.add.text(this.game.canvas.width, 100, '100.0%', {
      fontSize: '64px',
      fontFamily: 'Audiowide',
    }).setOrigin(1, 0);

    this.gameData.score.text = this.add.text(this.game.canvas.width, 16, '0000000', {
      fontSize: '72px',
      fontFamily: 'Audiowide',
    }).setOrigin(1, 0);

    this.gameData.combo.text = this.add.text(this.chutes.getChildren()[1].body.gameObject.getRightCenter().x, this.chutes.getChildren()[1].body.gameObject.getRightCenter().y, '0', {
      fontSize: '64px',
      fontFamily: 'Audiowide',
      stroke: '#000000',
      strokeThickness: 15,
      align: 'center',
    }).setOrigin(0.5).setDepth(10);
    // decorative
    this.chain = this.add.text(this.gameData.combo.text.getCenter().x, this.gameData.combo.text.y - 75, '- CHAIN -', {
      fontSize: '32px',
      fontFamily: 'Audiowide',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 15,
      align: 'center',
    }).setOrigin(0.5).setDepth(10);

    if (window.AudioContext && this.isActiveGameplay) {
      this.sound.play(`beatmap-audio-${data.songId}`);
      this.beatmapAudio!.pause();
    }

    this.gameData.scrollSpeed = parseFloat(localStorage.getItem('scrollspeed')!);

    this.baseline = this.physics.add
      .staticSprite(800, this.receptorBody.getChildren()[0].body.gameObject.getTopCenter().y, 'baseline-calibrator')
      .setVisible(false);
    this.gameData.baseline = this.baseline.getTopCenter().y;
    console.log(this.gameData.baseline);
    this.conductor = new Conductor({
      bpm: new SongList().getSongById(this.songId)!.bpm,
    }, this.beatmapAudio!);
    this.mapBuilder = new MapBuilder(this, this.beatmap, this.conductor, this.gameData.baseline, this.map);
    this.events.on('shutdown', this.shutdown, this);
  }

  update() {
    if (this.isActiveGameplay) {
      this.songIsOver = !this.beatmapAudio!.isPlaying || this.beatmap![this.beatmap!.length - 1].endTime < this.beatmapAudio!.seek;
      if (this.songIsOver) {
        this.endSong();
      }

      this.conductor!.update();
      const BaseTrackValue = this.track!.x;
      if (BaseTrackValue) {
        this.map = this.mapBuilder!.update(this.conductor!.beatNumber, 20, [BaseTrackValue! - 199, BaseTrackValue! - 66, BaseTrackValue! + 66, BaseTrackValue! + 199] /* this.receptorBody!.getChildren()[0] */);
      }

      this.map!.getChildren()
        .filter((child) => child.body.position.y > 1000)
        .forEach((missedNote) => {
          this.judgements.n0++;
          this.map!.remove(missedNote, true, true);
          this.judgeNote(0, this.gameData.baseline);
        });
      for (const key of ['Q', 'W', 'O', 'P']) {
        type Keybinds = {
          [index: string]: Input.Keyboard.Key,
        };
        if ((this.keybinds as Keybinds)[key].isDown) {
          const column = ['Q', 'W', 'O', 'P'].indexOf(key);
          this.chutes!.getChildren().find(c => c.name === `chute-${column.toString()}`)!
            .setState(1);

          if (this.physics.overlap(this.map!, this.receptorBody?.getChildren().find(r => r.name === `receptor-${column}`))) {
            try {
              const recCol = this.receptorBody!.getChildren().find((r) => r.name === `receptor-${column}`);
              this.deleteNote(this.map!, recCol);
            } catch (e) {
              console.log(e);
            }
          }
        } else {
          const column = ['Q', 'W', 'O', 'P'].indexOf(key);
          this.chutes!.getChildren().find(c => c.name === `chute-${column.toString()}`)!
            .setState(0);
        }
      }
      (this.chutes!.getChildren() as GameObjects.Sprite[]).forEach((chute: GameObjects.Sprite) => {
        // animate each chute on press
        if (chute.state === 1) {
          chute.setTexture('chute-enabled');
        } else {
          chute.setTexture('chute');
        }
      });
    } else {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.isActiveGameplay = true;
        this.beatmapAudio!.play();
        this.physics.resume();
      });
    }
  }

  shutdown(): void {
    this.input.keyboard.shutdown();
    // adding other scene shutdown stuff to make transitions easier
  }

  deleteNote(notes: Phaser.Physics.Arcade.Group | undefined, receptor: any) {
    const note = notes!.getChildren().find((n: GameObjects.GameObject) => {
      return this.physics.overlap(n, receptor);
    });

    if (note!.state === 3) return; // this only calls the deletion and judgement once
    const noteInput = note!.body.gameObject.getCenter().y;

    note?.setState(3);
    this.map!.remove(note!, true, true);

    // initiates the chain of judging notes
    if ((note as GameObjects.Sprite)!.texture.key === 'note') {
      this.judgeNote(noteInput, this.gameData.baseline);
    } else {
      this.updateData(null, 5);
    }
    
  }

  judgeNote(noteY: number | null, baseline: number) {
    if (noteY === null) {
      this.updateData(0);
      return;
    } else {
      const judgement = Math.abs(noteY - baseline);
      const result = (() => {
        // returning miss notes
        if (noteY === null || judgement > 175) {
          return 0;
        }
        // actual judgement for non-missed notes
        if (judgement >= 150 && judgement <= 175) {
          this.judgements.n50++;
          return 50;
        } else if (judgement >= 75) {
          this.judgements.n100++;
          return 100;
        } else if (judgement >= 50) {
          this.judgements.n200++;
          return 200;
        } else if (judgement >= 0) {
          this.judgements.n300++;
          return 300;
        } else {
          return 0; // this is so typescript doesnt complain
        }
      })();
      this.updateData(result);
    }
  }

  updateData(judgement: number | null, score?: number) {
    this.gameData.score.value += (!score ? judgement! : score);
    this.gameData.score.text!.setText(`${this.gameData.score.value}`.padStart(7, '0'));

    // resets combo if it's a miss, otherwise increase the score
    if (judgement == 0) {
      this.gameData.combo.value = 0;
    } else {
      this.gameData.combo.value++;
    }

    this.gameData.combo.text!.setText(`${this.gameData.combo.value}`);
    if (this.judgements.n0 === 0 && this.judgements.n50 === 0 && this.judgements.n100 === 0 && this.judgements.n200 === 0) {
      this.gameData.combo.text!
        .setColor('#FFD583')
        .setStroke('#000000', 15)
        .setShadowStroke(true)
        .setShadow(0, 0, '#FFD583', 10, true, false);
      this.chain!.setColor('#FFD583')
        .setStroke('#000000', 15)
        .setShadowStroke(true)
        .setShadow(0, 0, '#FFD583', 10, true, false);
    } else if (this.judgements.n200 > 0 && this.judgements.n0 === 0 && this.judgements.n50 === 0 && this.judgements.n100 === 0) {
      this.gameData.combo.text!
        .setColor('#839DF9')
        .setStroke('#000000', 15)
        .setShadowStroke(true)
        .setShadow(0, 0, '#839DF9', 10, true, false);
      this.chain!.setColor('#839DF9')
        .setStroke('#000000', 15)
        .setShadowStroke(true)
        .setShadow(0, 0, '#839DF9', 10, true, false);
    } else if (this.judgements.n0 > 0) {
      this.gameData.combo.text!
        .setColor('#FFFFFF')
        .setShadowStroke(false);
      this.chain!
        .setColor('#FFFFFF')
        .setShadowStroke(false);
    }
    this.chain!.setX(this.gameData.combo.text!.getCenter().x);

    // updates the maxcombo if the current combo is more than the original
    if (this.gameData.maxCombo.value < this.gameData.combo.value) {
      this.gameData.maxCombo.value = this.gameData.combo.value;
    }

    // updating the accuracy
    const acc = (j: number) => {
      switch (j) {
        case 0:
          return 0;
        case 50:
          return (1 / 6) * 100;
        case 100:
          return (1 / 3) * 100;
        case 200:
          return (2 / 3) * 100;
        case 300:
          return 100;
        default:
          return 0;
      }
    };
    if (judgement !== null) {
      this.gameData.accuracy.arrayVersion.push(acc(judgement));
    }
    
    // averages out the accuracy
    this.gameData.accuracy.value = (() => {
      try {
        return this.gameData.accuracy.arrayVersion.reduce((a, b) => a + b) / this.gameData.accuracy.arrayVersion.length;
      } catch {
        return 100;
      }
    })();

    this.gameData.accuracy.text?.setText(`${this.gameData.accuracy.value.toFixed(2)}%`);
  }

  endSong() {
    this.time.delayedCall(1500, () => {
      this.scene.stop();
      this.scene.start('GameplayResults', {
        accuracy: this.gameData.accuracy.value,
        maxCombo: this.gameData.maxCombo.value,
        score: this.gameData.score.value,
        n0: this.judgements.n0,
        n50: this.judgements.n50,
        n100: this.judgements.n100,
        n200: this.judgements.n200,
        n300: this.judgements.n300,
      });
    });
  }
}