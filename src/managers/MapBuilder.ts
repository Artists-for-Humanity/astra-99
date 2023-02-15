import { Physics } from 'phaser';
import Conductor from './Conductor';
import Gameplay from '../scenes/Gameplay';

type Note = {
  type: string;
  startTime: number;
  column: number;
  endTime: number;
}
type BeatmapSet = Note[]

export default class MapBuilder {
  public beatmap: BeatmapSet;
  public spawnedNotes: (number | { edge: number })[];
  public spawnedEndNotes: (number | { edge: number })[];
  public crotchet: number;
  public scene: Gameplay;
  public physicalMap: Physics.Arcade.Group;
  public conductor: Conductor;
  public baseline: number;
  public sliderMap: Physics.Arcade.Group;
  constructor(scene: Gameplay, beatmap: BeatmapSet, conductor: Conductor, baseline: number, map: Physics.Arcade.Group) {
    this.beatmap = beatmap;
    this.spawnedNotes = [];
    this.spawnedEndNotes = [];
    this.crotchet = conductor.crotchet;
    this.scene = scene;
    this.physicalMap = map;
    this.sliderMap = scene.physics.add.group();
    this.conductor = conductor;
    this.baseline = baseline;
  }

  update(beatNumber: number, scrollSpeed: number, columnValues: number[] /* , baseReceptor: Phaser.GameObjects.GameObject, sound: Sound.WebAudioSound */) {
    const circlesToLoad = this.beatmap.filter((n) => {
      return (n.startTime === n.endTime) && (n.startTime / 1000) >= this.conductor.songPosition + (1 * (scrollSpeed / 20)) && (n.startTime / 1000) <= this.conductor.songPosition + (1.25 * (scrollSpeed / 20));
    }).map((n: Note) => {
      return {
        edge: n.startTime,
        type: 'circle',
        startTime: n.startTime,
        column: n.column,
        endTime: n.endTime,
        spawned: false,
      };
    });

    const slidersToLoad = this.beatmap.filter((n) => {
      const start = (n.startTime / 1000) >= this.conductor.songPosition + (1 * (scrollSpeed / 20)) && (n.startTime / 1000) <= this.conductor.songPosition + (1.25 * (scrollSpeed / 20));
      const end = (n.endTime / 1000) >= this.conductor.songPosition + (1 * (scrollSpeed / 20)) && (n.endTime / 1000) <= this.conductor.songPosition + (1.25 * (scrollSpeed / 20));

      return (n.startTime !== n.endTime) && ((start && !this.spawnedNotes.includes(n.startTime)) || end);
    }).map((note: Note) => {
      const start = (note.startTime / 1000) >= this.conductor.songPosition + (1 * (scrollSpeed / 20)) && (note.startTime / 1000) <= this.conductor.songPosition + (1.25 * (scrollSpeed / 20));
      const end = (note.endTime / 1000) >= this.conductor.songPosition + (1 * (scrollSpeed / 20)) && (note.endTime / 1000) <= this.conductor.songPosition + (1.25 * (scrollSpeed / 20));
      let currentEdge = note.startTime;
      if (start && !this.spawnedNotes.includes(note.startTime)) {
        currentEdge = note.startTime;
      } else if (end) {
        currentEdge = note.endTime;
      }
      return {
        edge: currentEdge!,
        type: 'slider',
        startTime: note.startTime,
        column: note.column,
        endTime: note.endTime,
        spawned: false,
      };
    });

    const notesToLoad = [...circlesToLoad, ...slidersToLoad];

    for (const note of notesToLoad) {
      if (note.startTime === note.endTime) {
        this.spawnNote(note);
      } else if (note.startTime !== note.endTime) {
        this.spawnSlider(note);
      }
    }
    this.physicalMap.getChildren().filter(n => !columnValues.includes(n.body.position.x));
    this.physicalMap.incY(parseFloat(localStorage.getItem('scrollspeed')!));
    // this.sliderMap.incY(parseFloat(localStorage.getItem('scrollspeed')!));
    return this.physicalMap;
  }

  spawnNote(note: Note & { spawned: boolean }) {
    const cols = this.scene.chutes!.getChildren().map(chute => chute.body.gameObject.getCenter().x);
    const noteToSpawn = this.spawnedNotes.includes(note.startTime);
    if (!noteToSpawn) { // if the note that is queued up to spawn isnt already loaded
      this.spawnedNotes.push(note.startTime);
      const newNote = this.scene.physics.add.sprite(cols[note.column], -(this.baseline) + (parseFloat(localStorage.getItem('offset')!) * -1), 'note')
        .setName(`note-${note.startTime}-${note.column}`)
        .setOrigin(0.5)
        .setScale(1.35294117647, 1);
      if (!cols.includes(newNote.x)) {
        newNote.destroy();
        return;
      }
      this.physicalMap.add(newNote);
      note.spawned = true;
    }
  }

  spawnSlider(note: Note & { spawned: boolean, edge: number, }) {
    const cols = this.scene.chutes!.getChildren().map(chute => chute.body.gameObject.getCenter().x);
    const noteToSpawn = this.spawnedNotes.includes({ edge: note.startTime }) || this.spawnedEndNotes.includes({ edge: note.endTime });
    if (!noteToSpawn) { // if the note that is queued up to spawn isnt already loaded
      if (note.startTime === note.edge) {
        this.spawnedNotes.push({ edge: note.startTime });
        const newNote = this.scene.physics.add.sprite(cols[note.column], -(this.baseline) + (parseFloat(localStorage.getItem('offset')!) * -1), 'note-end')
          .setName(`note-${note.startTime}-${note.column}`)
          .setOrigin(0.5)
          .setScale(1.35294117647, 1);
        if (!cols.includes(newNote.x)) {
          newNote.destroy();
          return;
        }
        this.physicalMap.add(newNote);
      } else if (note.endTime === note.edge) {
        this.spawnedEndNotes.push({ edge: note.endTime });
        const newNote = this.scene.physics.add.sprite(cols[note.column], -(this.baseline) + (parseFloat(localStorage.getItem('offset')!) * -1), 'note-end')
          .setName(`note-${note.endTime}-${note.column}`)
          .setScale(1.35294117647, 1)
          .setOrigin(0.5);
        if (!cols.includes(newNote.x)) {
          newNote.destroy();
          return;
        }
        this.physicalMap.add(newNote);
      }
      note.spawned = true;
    }
  }
}