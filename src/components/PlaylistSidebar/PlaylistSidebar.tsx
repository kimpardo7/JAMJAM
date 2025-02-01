import { useState, useEffect } from 'react';
import { getUserPlaylists } from '../../utils/spotify';
import './PlaylistSidebar.css';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
}

export function PlaylistSidebar() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getUserPlaylists();
        setPlaylists(data.items);
      } catch (err) {
        setError('Failed to load playlists');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (error) return null;

  return (
    <div className="playlist-sidebar">
      <h2>Your Playlists</h2>
      {isLoading ? (
        <div className="loading-playlists">Loading playlists...</div>
      ) : (
        <div className="playlists-list">
          {playlists.map(playlist => (
            <div key={playlist.id} className="playlist-item">
              {playlist.images[0] && (
                <img 
                  src={playlist.images[0].url} 
                  alt={`${playlist.name} cover`}
                  className="playlist-image"
                />
              )}
              <div className="playlist-info">
                <span className="playlist-name">{playlist.name}</span>
                <span className="playlist-tracks">
                  {playlist.tracks.total} {playlist.tracks.total === 1 ? 'track' : 'tracks'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 