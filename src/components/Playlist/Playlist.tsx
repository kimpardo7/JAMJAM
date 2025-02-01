import React, { useState, useEffect } from 'react';
import './Playlist.css';
import { Track, loginToSpotify, getAccessToken } from '../../services/musicApi';

interface PlaylistProps {
  tracks: Track[];
  onRemoveTrack: (track: Track) => void;
  onSave: (name: string, tracks: Track[]) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({ tracks, onRemoveTrack, onSave }) => {
  const [playlistName, setPlaylistName] = useState('New Playlist');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on mount and when URL hash changes
    const checkAuth = () => {
      const token = getAccessToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('hashchange', checkAuth);
    return () => window.removeEventListener('hashchange', checkAuth);
  }, []);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(event.target.value);
  };

  const handleSave = async () => {
    setError(null);
    if (!isAuthenticated) {
      try {
        loginToSpotify();
      } catch (err) {
        setError('Failed to initiate Spotify login. Please try again.');
        console.error('Login error:', err);
      }
    } else {
      try {
        await onSave(playlistName, tracks);
      } catch (err) {
        setError('Failed to save playlist. Please try again.');
        console.error('Save error:', err);
      }
    }
  };

  return (
    <div className="playlist">
      <input
        type="text"
        value={playlistName}
        onChange={handleNameChange}
        className="playlist-name"
        placeholder="Enter Playlist Name"
      />
      {error && <div className="error-message">{error}</div>}
      <div className="tracks-list">
        {tracks.map(track => (
          <div key={track.id} className="track">
            <div className="track-info">
              <h3>{track.title}</h3>
              <p>{track.artist}</p>
            </div>
            <button onClick={() => onRemoveTrack(track)}>-</button>
          </div>
        ))}
      </div>
      <button className="save-button" onClick={handleSave}>
        {isAuthenticated ? 'SAVE TO SPOTIFY' : 'SIGN IN TO SPOTIFY'}
      </button>
    </div>
  );
}; 