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

    console.log(this.beatmap[0].startTime, this.crotchet * 1000);
    console.log(this.beatmap[0].startTime / (this.crotchet * 1000));
  }

  update(beatNumber: number, scrollSpeed: number, columnValues: number[] /* , baseReceptor: Phaser.GameObjects.GameObject, sound: Sound.WebAudioSound */) {
    // eslint-disable-next-line yoda
    console.log(this.conductor.songPosition, (5.726 >= this.conductor.songPosition + 1000 && 5.726 <= this.conductor.songPosition + 2000));
    const notesToLoad = this.beatmap.filter((n) => {
      return (n.startTime / 1000) >= this.conductor.songPosition + 500 && (n.startTime / 1000) <= this.conductor.songPosition + 2000;
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
      console.log(note.startTime);
      this.spawnNote(note, 20, columnValues);
    }

    this.physicalMap.incY(scrollSpeed);
  }

  spawnNote(note: Note & { spawned: boolean }, scrollSpeed: number, columnValues: number[]) {
    const noteToSpawn = this.spawnedNotes.find((n) => n === note.startTime);
    if (!noteToSpawn) { // if the note that is queued up to spawn isnt already loaded
      console.log(note.startTime);
      this.spawnedNotes.push(note.startTime);
      // console.log(note.startTime / this.conductor.bpm);
      const noteStartTimeInSeconds = note.startTime / 1000;
      const beatPlacement = (Math.round(noteStartTimeInSeconds * 4) / 4);
      console.log(beatPlacement);
      const newNote = this.scene.physics.add.sprite(columnValues[note.column], (-862), 'note').setName(`note-${note.startTime}-${note.column}`);
      this.physicalMap.add(newNote);
      console.log(`spawned ${note.startTime} at ${newNote.y}`);
      note.spawned = true;
    } // else if (noteToSpawn) {
    //   const x = this.scene.children.list.find((n) => {
    //     return n.name === `note-${note.startTime}-${note.column}`;
    //   });
    // }
  }
}