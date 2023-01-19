import { Sound } from 'phaser';

interface SongData {
  bpm: number
}

export default class Conductor {
  public bpm: number;
  public crotchet: number;
  public songPosition: number;
  public lastBeat: number;
  public sound: Sound.WebAudioSound;
  public beatNumber: number;
  public mapPosition: number;
  public totalBeats: number;
  constructor(songData: SongData, sound: Sound.WebAudioSound) {
    this.bpm = songData.bpm;
    this.crotchet = 60 / this.bpm; // the time duration of a beat, calculated by tempo
    // offset = ???
    this.sound = sound;
    this.songPosition = 0;
    this.mapPosition = 0;
    this.lastBeat = 0;
    this.beatNumber = 1;
    this.totalBeats = Math.floor(this.sound.totalDuration / this.crotchet);
  }

  update() {
    if (this.sound.isPlaying) {
      this.songPosition = this.sound.seek;

      if (this.songPosition > this.lastBeat + this.crotchet) {
        this.lastBeat += this.crotchet;
      }

      this.beatNumber = Math.floor(this.songPosition / this.crotchet);
      console.log(this.beatNumber);
    }
  }
}