import { useState, useEffect, useCallback } from 'react';
import { getUserPlaylists } from '../../utils/spotify';
import { isAuthenticated } from '../../utils/spotify';
import { PlayButton } from '../PlayButton/PlayButton';
import './PlaylistSidebar.css';

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
      setError(null);
    } catch (err) {
      setError('Failed to load playlists');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPlaylists = async () => {
      if (!isAuthenticated()) {
        if (isMounted) {
          setPlaylists([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getUserPlaylists();
        if (isMounted) {
          setPlaylists(data.items);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load playlists');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPlaylists();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handlePlaylistClick = (playlistId: string) => {
    if (onPlaylistSelect) {
      onPlaylistSelect(playlistId);
    }
  };

  const handleNewPlaylist = () => {
    if (onPlaylistSelect) {
      onPlaylistSelect(''); // Clear selected playlist
    }
  };

  if (error) return null;

  return (
    <div className="playlist-sidebar">
      <div className="playlist-header">
        <h2>Your Playlists</h2>
        <button 
          className="new-playlist-btn" 
          aria-label="Create new playlist"
          onClick={handleNewPlaylist}
        >
          +
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading-playlists">Loading playlists...</div>
      ) : (
        <div className="playlists-list">
          {playlists.map((playlist, index) => (
            <div
              key={playlist.id}
              className={`playlist-item ${selectedPlaylistId === playlist.id ? 'selected' : ''}`}
              onClick={() => handlePlaylistClick(playlist.id)}
              style={{ '--index': index } as React.CSSProperties}
            >
              <div className="playlist-image-container">
                {playlist.images[0] && (
                  <img 
                    src={playlist.images[0].url} 
                    alt={`${playlist.name} cover`}
                    className="playlist-image"
                  />
                )}
                <div className="playlist-play-overlay">
                  <PlayButton 
                    previewUrl={playlist.uri} 
                    size="medium" 
                    isSpotifyUri={true}
                  />
                </div>
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
                  {playlist.tracks.total}
                </span>
              </div>
              <div className="playlist-actions">
                <button 
                  className="action-btn" 
                  aria-label="Edit playlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add edit handler
                  }}
                >
                  ✎
                </button>
                <button 
                  className="action-btn delete" 
                  aria-label="Delete playlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add delete handler
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 