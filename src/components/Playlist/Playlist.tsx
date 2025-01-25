import { useState } from 'react';
import './Playlist.css';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
}

interface PlaylistProps {
  tracks: Track[];
  onRemoveTrack: (track: Track) => void;
  onSave: (name: string, tracks: Track[]) => void;
}

export function Playlist({ tracks, onRemoveTrack, onSave }: PlaylistProps) {
  const [playlistName, setPlaylistName] = useState('New Playlist');

  const handleSave = () => {
    onSave(playlistName, tracks);
  };

  return (
    <div className="playlist">
      <input
        type="text"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        className="playlist-name"
      />
      <div className="tracks-list">
        {tracks.map((track) => (
          <div key={track.id} className="track">
            <div className="track-info">
              <h3>{track.name}</h3>
              <p>{track.artist} | {track.album}</p>
            </div>
            <button onClick={() => onRemoveTrack(track)}>-</button>
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="save-button">
        Save to Spotify
      </button>
    </div>
  );
} 