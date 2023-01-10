import { Scene, GameObjects, Sound } from 'phaser';
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

type BeatmapObj = {
  type: string;
  startTime: number;
  column: number;
  endTime: number;
}[];

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
  menuControls: unknown;
  components?: GameObjects.Container;
  beatmap?: BeatmapObj;
  map?: Phaser.Physics.Arcade.Group;
  receptorBody?: Phaser.Physics.Arcade.StaticGroup;
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
  songId: string;
  conductor: Conductor | undefined;
  mapBuilder?: MapBuilder;

  constructor() {
    super({ key: 'Gameplay' });
    this.songId = '';
    this.keybinds;
    this.components;
    this.beatmap;
    this.map;
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
    this.isActiveGameplay = false;
    this.songIsOver = false;
    this.menuControls;
    this.beatmapAudio;
    this.conductor;
    this.mapBuilder;
    this.track;
  }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    directories.beatmaps.forEach((map) => {
      try {
        this.load.audio(`beatmap-audio-${map}`, new URL(`http://127.0.0.1:8080/assets/beatmaps/${map}/audio.mp3`, import.meta.url).href).on('complete', () => {
          console.log('done???');
        });
        this.load.text(`beatmap-${map}`, new URL(`http://127.0.0.1:8080/assets/beatmaps/${map}/beatmap.osu`, import.meta.url).href);
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

  create(data: any) {
    this.songId = data.songId;
    this.beatmapAudio = (this.sound.add(`beatmap-audio-${data.songId}`) as Sound.WebAudioSound);
    this.beatmap = Beatmap(this.cache.text.get(`beatmap-${data.songId}`));
    this.keybinds = this.input.keyboard.addKeys('Q,W,O,P');
    this.menuControls = this.input.keyboard.addKey('SPACE');

    // building the rhythm game track and the "chutes" (basically columns) for the notes
    this.track = this.add.sprite(center.x, center.y /* - (99 / 4) */, 'track').setName('track');
    const chuteMapping = [this.track.x - 199, this.track.x - 66, this.track.x + 66, this.track.x + 199];
    const Chutes = this.add.container(
      0,
      0,
      [0, 1, 2, 3].map((column) => {
        // each chute within the columns is referred to as its own chute ex. chute-0
        const NextChute = this.add.sprite(chuteMapping[column], center.y - 27, 'chute');
        NextChute.setName('chute-' + column.toString());
        return NextChute;
      }),
    );
    const Receptors = this.physics.add.staticGroup(
      [0, 1, 2, 3].map((column) => {
        const receptor = this.physics.add.sprite(chuteMapping[column], this.game.canvas.height - 150, 'note-receptor');
        receptor.setName('receptor-' + column.toString());
        return receptor;
      }),
    );

    Chutes.setName('chutes');
    const FullTrack = this.add.container(0, 0, [Chutes, this.track]);

    FullTrack.moveBelow(Chutes, this.track);
    this.components = FullTrack;

    // building beatmaps
    const noteSet = this.beatmap.map((note) => {
      const col = (this.components!.getByName('chutes') as GameObjects.Container).getByName(
        'chute-' + note.column.toString(),
      ) as GameObjects.Sprite;
      const res = this.add.sprite(col.x, note.startTime * -1.21, 'note').setScale(0.95);
      res.setName(`note-${note.startTime}`);
      return res;
    });
    this.map = this.physics.add.group(noteSet, { name: 'beatmapNotes' });

    Receptors.setDepth(2);
    this.map.setDepth(1);
    FullTrack.setDepth(0);

    this.receptorBody = Receptors;

    // adding text
    this.gameData.accuracy.text = this.add.text(this.game.canvas.width - 250, 100, '100.0%', {
      fontSize: '64px',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      align: 'right',
    });

    this.gameData.score.text = this.add.text(this.game.canvas.width - 300, 16, '0000000', {
      fontSize: '72px',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      align: 'right',
    });

    this.gameData.combo.text = this.add.text(this.game.canvas.width - 250, this.game.canvas.height - 100, '0x', {
      fontSize: '64px',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      align: 'right',
    });
    if (window.AudioContext && this.isActiveGameplay) {
      this.sound.play(`beatmap-audio-${data.songId}`);
      this.beatmapAudio!.pause();
    }

    this.gameData.scrollSpeed =
      Math.abs(this.receptorBody!.getChildren()[0].body.position.y - this.map!.getChildren()[0].body.position.y) / 750;

    const baselineEditor = 10; // 40.75;
    this.gameData.baseline = this.physics.add
      .staticSprite(800, this.receptorBody.getChildren()[0].body.position.y + baselineEditor, 'baseline-calibrator')
      .setVisible(false)
      .body.position.y;

    this.conductor = new Conductor({
      bpm: new SongList().getSongById(this.songId)!.bpm,
    }, this.beatmapAudio!);
    this.mapBuilder = new MapBuilder(this, this.beatmap, this.conductor, this.gameData.baseline);
    this.events.on('shutdown', this.shutdown, this);
  }

  update() {
    if (this.isActiveGameplay) {
      this.songIsOver = (this.map!.children.size === 0) && (this.beatmapAudio?.seek === this.beatmapAudio?.totalDuration) && (this.beatmapAudio?.isPlaying === false);
      if (this.songIsOver) {
        this.endSong();
      }

      this.conductor!.update();
      const BaseTrackValue = this.track!.x;
      if (BaseTrackValue) {
        this.map = this.mapBuilder!.update(this.conductor!.beatNumber, 20, [BaseTrackValue! - 199, BaseTrackValue! - 66, BaseTrackValue! + 66, BaseTrackValue! + 199] /* this.receptorBody!.getChildren()[0] */);
      }

      this.map!.getChildren()
        .filter((child) => child.body.position.y > this.game.canvas.height)
        .forEach((missedNote) => {
          this.judgements.n0++;
          this.map!.remove(missedNote, true, true);
          this.judgeNote(0, this.gameData.baseline);
        });

      for (const key of ['Q', 'W', 'O', 'P']) {
        this.input.keyboard.on('keydown-' + key, () => {
          const column = ['Q', 'W', 'O', 'P'].indexOf(key);
          (this.components!.getByName('chutes') as GameObjects.Container)
            .getByName('chute-' + column.toString())
            .setState(1);

          if (
            this.physics.overlap(
              this.map!,
              this.receptorBody!.getChildren().find((r) => r.name === `receptor-${column}`),
            )
          ) {
            const recCol = this.receptorBody!.getChildren().find((r) => r.name === `receptor-${column}`);
            this.deleteNote(this.map!, recCol);
          }
        });
        this.input.keyboard.on('keyup-' + key, () => {
          const column = ['Q', 'W', 'O', 'P'].indexOf(key);
          (this.components!.getByName('chutes') as GameObjects.Container)
            .getByName('chute-' + column.toString())
            .setState(0);
        });
      }
      (this.components!.getByName('chutes') as GameObjects.Container).iterate((chute: GameObjects.Sprite) => {
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

  shutdown() {
    this.input.keyboard.shutdown();
    // adding other scene shutdown stuff to make transitions easier
  }

  deleteNote(notes: Phaser.Physics.Arcade.Group | undefined, receptor: any) {
    const note = notes!.getChildren().find((n: GameObjects.GameObject) => {
      return this.physics.overlap(n, receptor);
    });

    if (note!.state === 3) return; // this only calls the deletion and judgement once
    const noteInput = note!.body.position.y;

    note?.setState(3);
    this.map!.remove(note!, true, true);

    // initiates the chain of judging notes
    this.judgeNote(noteInput, this.gameData.baseline);
  }

  judgeNote(noteY: number, baseline: number) {
    const judgement = Math.abs(noteY - baseline);
    console.log(judgement);
    const result = (() => {
      // returning miss notes
      if (noteY === 0) {
        return 0;
      }
      // actual judgement for non-missed notes
      if (judgement >= 150) {
        this.judgements.n50++;
        return 50;
      } else if (judgement >= 100) {
        this.judgements.n100++;
        return 100;
      } else if (judgement >= 50) {
        this.judgements.n200++;
        return 200;
      } else if (judgement >= 0) {
        this.judgements.n300++;
        return 300;
      } else {
        this.judgements.n0++;
        return 0;
      }
    })();
    this.updateData(result);
  }

  updateData(judgement: number) {
    this.gameData.score.value += judgement;
    this.gameData.score.text!.setText(`${this.gameData.score.value}`.padStart(7, '0'));

    // resets combo if it's a miss, otherwise increase the score
    if (judgement == 0) {
      this.gameData.combo.value = 0;
    } else {
      this.gameData.combo.value++;
    }

    this.gameData.combo.text!.setText(`${this.gameData.combo.value}x`);

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

    this.gameData.accuracy.arrayVersion.push(acc(judgement));

    // averages out the accuracy
    this.gameData.accuracy.value =
      this.gameData.accuracy.arrayVersion.reduce((a, b) => a + b) / this.gameData.accuracy.arrayVersion.length;

    this.gameData.accuracy.text?.setText(`${this.gameData.accuracy.value.toFixed(2)}%`);
  }

  endSong() {
    this.time.delayedCall(1500, () => {
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