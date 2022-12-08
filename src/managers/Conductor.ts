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
    }
  }
}

// source for conductor class info: https://web.archive.org/web/20210225110635/http://ludumdare.com/compo/2014/09/09/an-ld48-rhythm-game-part-2/

// "bpm, which gives the bpm of the song
// crotchet, which gives the time duration of a beat, calculated from the bpm
// offset, always important due to the fact that MP3s always have a teeny gap at the very beginning, no matter what you do, which is used for metadata (artist name, song name, etc)
// songposition, a variable that should be set directly from the corresponding variable on the Audio object. This varies from engine to engine, but in Unity for example, the variable to use is AudioSettings.dspTime. What I do is, in the same frame that I play the song, I record the dspTime at that moment, so then my song position variable is set on every frame as follows:"