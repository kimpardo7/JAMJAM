export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri: string;
  albumUrl: string;
  duration: number;
  previewUrl: string | null;
} 