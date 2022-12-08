import Beatmap from './BeatmapManager';

type BeatmapSet = {
  type: string;
  startTime: number;
  column: number;
  endTime: number;
}[]
export class MapBuilder {
    public beatmap: BeatmapSet;
  constructor(beatmap: BeatmapSet) {
    this.beatmap = beatmap;
  }

  update(beatNumber: number, crotchet: number, sound: any) {
    const notesToLoad = this.beatmap.filter((n) => {
      n.startTime / crotchet <= beatNumber + 8;
    }); // get all notes that are within the next two bars of the song and load them into a variable
    // for (const note of notesToLoad) {

    // }
  }
}