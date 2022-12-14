import { Physics, Scene /* , Sound */ } from 'phaser';
import Conductor from './Conductor';

type Note = {
  type: string;
  startTime: number;
  column: number;
  endTime: number;
}
// class EventDispatcher extends Phaser.Events.EventEmitter {
//   constructor() {
//     super();
//   }

//   static getInstance() {
//     if (instance == null) {
//       instance = new EventDispatcher();
//     }
//     return instance;
//   }
// }

type BeatmapSet = Note[]

export default class MapBuilder {
  public beatmap: BeatmapSet;
  public spawnedNotes: number[];
  public crotchet: number;
  public scene: Scene;
  public physicalMap: Physics.Arcade.Group;
  public conductor: Conductor;
  constructor(scene: Scene, beatmap: BeatmapSet, conductor: Conductor) {
    this.beatmap = beatmap;
    this.spawnedNotes = [];
    this.crotchet = conductor.crotchet;
    this.scene = scene;
    this.physicalMap = scene.physics.add.group();
    this.conductor = conductor;
  }

  update(beatNumber: number, scrollSpeed: number, columnValues: number[], baseReceptor: Phaser.GameObjects.GameObject /* , sound: Sound.WebAudioSound */) {
    const notesToLoad = this.beatmap.filter((n) => {
      return (n.startTime / (this.crotchet * 1000)) <= beatNumber + 4;
    }).map((n: Note) => {
      return {
        type: n.type,
        startTime: n.startTime,
        column: n.column,
        endTime: n.endTime,
        spawned: false,
      };
    }); // get all notes that are within the next two bars of the song and load them into a variable
    for (const note of notesToLoad) {
      this.spawnNote(note, 20, columnValues);
    }

    this.physicalMap.incY(scrollSpeed);
  }

  spawnNote(note: Note & { spawned: boolean }, scrollSpeed: number, columnValues: number[]) {
    const noteToSpawn = this.spawnedNotes.find((n) => n === note.startTime);
    if (!noteToSpawn) { // if the note that is queued up to spawn isnt already loaded
      this.spawnedNotes.push(note.startTime);
      // console.log(note.startTime / this.conductor.bpm);
      const noteStartTimeInSeconds = note.startTime / 1000;
      const newNote = this.scene.physics.add.sprite(columnValues[note.column], (-100 * (noteStartTimeInSeconds % 1)), 'note').setName(`note-${note.startTime}-${note.column}`);
      this.physicalMap.add(newNote);
      // console.log(`spawned note-${note.startTime}-${note.column}`);
      note.spawned = true;
    } // else if (noteToSpawn) {
    //   const x = this.scene.children.list.find((n) => {
    //     return n.name === `note-${note.startTime}-${note.column}`;
    //   });
    // }
  }
}