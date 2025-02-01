export default class AudioController {
  private static instance: AudioController;
  private audio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;

  private constructor() {}

  public static getInstance(): AudioController {
    if (!AudioController.instance) {
      AudioController.instance = new AudioController();
    }
    return AudioController.instance;
  }

  public play(trackId: string, previewUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop current track if playing
      if (this.audio && this.currentTrackId === trackId) {
        this.stop();
        resolve();
        return;
      }

      // Stop any other playing track
      this.stop();

      // Create and play new audio
      this.audio = new Audio(previewUrl);
      this.currentTrackId = trackId;

      this.audio.addEventListener('ended', () => {
        this.stop();
      });

      this.audio.addEventListener('error', (e) => {
        console.error('Error playing audio:', e);
        this.stop();
        reject(new Error('Failed to play audio'));
      });

      this.audio.play()
        .then(resolve)
        .catch(reject);
    });
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
      this.currentTrackId = null;
    }
  }

  public isPlaying(trackId: string): boolean {
    return this.currentTrackId === trackId && this.audio !== null && !this.audio.paused;
  }

  public getCurrentTime(): number {
    return this.audio ? this.audio.currentTime : 0;
  }

  public getDuration(): number {
    return this.audio ? this.audio.duration : 0;
  }
} 