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
  public baseline: number;
  constructor(scene: Scene, beatmap: BeatmapSet, conductor: Conductor, baseline: number) {
    this.beatmap = beatmap;
    this.spawnedNotes = [];
    this.crotchet = conductor.crotchet;
    this.scene = scene;
    this.physicalMap = scene.physics.add.group();
    this.conductor = conductor;
    this.baseline = baseline;
  }

  update(beatNumber: number, scrollSpeed: number, columnValues: number[] /* , baseReceptor: Phaser.GameObjects.GameObject, sound: Sound.WebAudioSound */) {
    const notesToLoad = this.beatmap.filter((n) => {
      return (n.startTime / 1000) >= this.conductor.songPosition + (1 * (scrollSpeed / 20)) && (n.startTime / 1000) <= this.conductor.songPosition + (1.25 * (scrollSpeed / 20));
    }).map((n: Note) => {
      return {
        type: n.type,
        startTime: n.startTime,
        column: n.column,
        endTime: n.endTime,
        spawned: false,
      };
    }); // get all notes that are within the next two bars of the song and load them into a variable
    // console.log(notesToLoad);
    for (const note of notesToLoad) {
      this.spawnNote(note, columnValues);
    }

    this.physicalMap.incY(parseFloat(localStorage.getItem('scrollspeed')!));
    return this.physicalMap;
  }

  spawnNote(note: Note & { spawned: boolean }, columnValues: number[]) {
    const noteToSpawn = this.spawnedNotes.find((n) => n === note.startTime);
    if (!noteToSpawn) { // if the note that is queued up to spawn isnt already loaded
      this.spawnedNotes.push(note.startTime);
      // console.log(note.startTime / this.conductor.bpm);
      // const noteStartTimeInSeconds = note.startTime / 1000;
      // const beatPlacement = (Math.round(noteStartTimeInSeconds * 4) / 4);
      const newNote = this.scene.physics.add.sprite(columnValues[note.column] + (parseFloat(localStorage.getItem('offset')!) * -1), -(this.baseline), 'note').setName(`note-${note.startTime}-${note.column}`);
      this.physicalMap.add(newNote);
      // console.log(`spawned ${note.startTime} at ${newNote.y}`);
      note.spawned = true;
    } // else if (noteToSpawn) {
    //   const x = this.scene.children.list.find((n) => {
    //     return n.name === `note-${note.startTime}-${note.column}`;
    //   });
    // }
  }
}