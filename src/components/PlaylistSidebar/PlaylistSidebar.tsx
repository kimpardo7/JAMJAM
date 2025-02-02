import { useState, useEffect, useCallback } from 'react';
import { getUserPlaylists, getPlaylistTracks, isAuthenticated, initiateSpotifyLogin } from '../../utils/spotify';
import { PlayButton } from '../PlayButton/PlayButton';
import './PlaylistSidebar.css';
import { Track } from '../../types/Track';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
  uri: string;
}

interface PlaylistSidebarProps {
  refreshTrigger?: number;
  onPlaylistSelect?: (playlistId: string) => void;
  selectedPlaylistId?: string | null;
}

export function PlaylistSidebar({ 
  refreshTrigger = 0, 
  onPlaylistSelect,
  selectedPlaylistId 
}: PlaylistSidebarProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistPreviews, setPlaylistPreviews] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    if (!isAuthenticated()) {
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getUserPlaylists();
      setPlaylists(data.items);
      
      // Fetch preview URLs for the first track of each playlist
      const previews: Record<string, string> = {};
      for (const playlist of data.items) {
        try {
          const tracks = await getPlaylistTracks(playlist.id);
          if (tracks.length > 0) {
            previews[playlist.id] = tracks[0].previewUrl;
          }
        } catch (err) {
          console.error(`Failed to fetch preview for playlist ${playlist.id}:`, err);
        }
      }
      setPlaylistPreviews(previews);
      setError(null);
    } catch (err) {
      setError('Failed to load playlists');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists, refreshTrigger]);

  if (!isAuthenticated()) {
    return (
      <div className="playlist-sidebar">
        <div className="playlist-header">
          <h2>Your Playlists</h2>
        </div>
        <div className="login-prompt">
          <p>Please log in to see your playlists</p>
          <button 
            className="spotify-login-btn"
            onClick={() => initiateSpotifyLogin()}
          >
            Login with Spotify
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="playlist-sidebar">
        <div className="playlist-header">
          <h2>Your Playlists</h2>
        </div>
        <div className="loading-playlists">
          <span className="loading-spinner"></span>
          <span>Loading your playlists...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="playlist-sidebar">Error: {error}</div>;
  }

  return (
    <div className="playlist-sidebar">
      <div className="playlist-header">
        <h2>Your Playlists</h2>
        <button 
          className="new-playlist-btn" 
          aria-label="Create new playlist"
          onClick={() => onPlaylistSelect?.('')}
        >
          +
        </button>
      </div>
      
      <div className="playlists-list">
        {playlists.map((playlist, index) => (
          <div 
            key={playlist.id}
            className={`playlist-item ${selectedPlaylistId === playlist.id ? 'selected' : ''}`}
            onClick={() => onPlaylistSelect?.(playlist.id)}
          >
            <div className="playlist-image-container">
              {playlist.images[0] && (
                <img 
                  src={playlist.images[0].url} 
                  alt={playlist.name}
                  className="playlist-image"
                />
              )}
            </div>
            <div className="playlist-info">
              <span 
                className="playlist-name"
                data-full-name={playlist.name}
                title={playlist.name}
              >
                {playlist.name}
              </span>
              <span className="track-count">
                {playlist.tracks.total} tracks
              </span>
            </div>
            <PlayButton 
              previewUrl={playlistPreviews[playlist.id] || ''}
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
} 