import { GameObjects } from 'phaser';

interface ConductorOptions {
  songBPM: number;
  secPerBeat: number;
  songPosition: number;
  songPositionInBeats: number;
  dspSongTime: number;
  musicSource: any;
}

export default class Conductor {
  constructor(options: ConductorOptions) {
    // //Song beats per minute
    // //This is determined by the song you're trying to sync up to
    // public float songBpm;
    // this.songBPM
    // //The number of seconds for each song beat
    // public float secPerBeat;

    // //Current song position, in seconds
    // public float songPosition;

    // //Current song position, in beats
    // public float songPositionInBeats;

    // //How many seconds have passed since the song started
    // public float dspSongTime;

    // //an AudioSource attached to this GameObject that will play the music.
    // public AudioSource musicSource;
  }
}