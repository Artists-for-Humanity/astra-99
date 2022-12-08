import { Physics, Sound } from 'phaser';

interface SongData {
  bpm: number
}

export default class Conductor {
  public bpm: number;
  public crochet: number;
  public songPosition: number;
  public lastBeat: number;
  public beatmap: Physics.Arcade.Group;
  public sound: Sound.WebAudioSound;
  public beatNumber: number;
  constructor(songData: SongData, sound: Sound.WebAudioSound, beatmap: Physics.Arcade.Group) {
    this.bpm = songData.bpm;
    this.crochet = Math.round(60 / this.bpm); // the time duration of a beat, calculated by tempo
    // offset = ???
    this.sound = sound;
    this.songPosition = sound.seek;
    this.lastBeat = 0;
    this.beatNumber = 1;
    this.beatmap = beatmap;
  }

  update(scrollSpeed: number) {
    this.songPosition = this.sound.seek;
    if (this.songPosition > this.lastBeat + this.crochet) {
      this.lastBeat += this.crochet;
    }

    console.log(this.songPosition % this.crochet);

    this.beatmap.incY(this.crochet * scrollSpeed);
  }
}

// source for conductor class info: https://web.archive.org/web/20210225110635/http://ludumdare.com/compo/2014/09/09/an-ld48-rhythm-game-part-2/

// "bpm, which gives the bpm of the song
// crotchet, which gives the time duration of a beat, calculated from the bpm
// offset, always important due to the fact that MP3s always have a teeny gap at the very beginning, no matter what you do, which is used for metadata (artist name, song name, etc)
// songposition, a variable that should be set directly from the corresponding variable on the Audio object. This varies from engine to engine, but in Unity for example, the variable to use is AudioSettings.dspTime. What I do is, in the same frame that I play the song, I record the dspTime at that moment, so then my song position variable is set on every frame as follows:"