import { useState, useEffect } from 'react'
import './App.css'
import { Search } from './components/Search/Search'
import { SearchResults } from './components/SearchResults/SearchResults'
import { Playlist } from './components/Playlist/Playlist'
import { UserProfile } from './components/UserProfile/UserProfile'
import { PlaylistSidebar } from './components/PlaylistSidebar/PlaylistSidebar'
import { Notification } from './components/Notification/Notification'
import { searchTracks, createPlaylist } from './services/musicApi'
import { handleAuthResponse, isAuthenticated, getPlaylistTracks, initiateSpotifyLogin } from './utils/spotify'
import { Track } from './types/Track'

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

function App() {
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [refreshPlaylistTrigger, setRefreshPlaylistTrigger] = useState(0)
  const [notification, setNotification] = useState<NotificationState | null>(null)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)

  useEffect(() => {
    // Check login status when component mounts and after URL hash changes
    setIsLoggedIn(isAuthenticated())
  }, [window.location.hash])

  useEffect(() => {
    // Handle the auth response if present
    handleAuthResponse();
  }, []);

  useEffect(() => {
    // Load selected playlist tracks
    const loadPlaylistTracks = async () => {
      if (selectedPlaylistId && isLoggedIn) {
        setIsLoading(true);
        try {
          const tracks = await getPlaylistTracks(selectedPlaylistId);
          setPlaylist(tracks);
          showNotification(`Loaded playlist with ${tracks.length} tracks`, 'success');
        } catch (err) {
          console.error('Failed to load playlist tracks:', err);
          showNotification('Failed to load playlist tracks', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPlaylistTracks();
  }, [selectedPlaylistId, isLoggedIn]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ message, type });
  };

  const handleSearch = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      showNotification('Searching Spotify...', 'info');
      const results = await searchTracks(searchTerm);
      setSearchResults(results);
      if (results.length === 0) {
        showNotification('No tracks found. Try a different search term.', 'warning');
      } else {
        showNotification(`Found ${results.length} tracks!`, 'success');
      }
    } catch (err) {
      setError('Failed to search tracks. Please try again.');
      showNotification('Search failed. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrack = (track: Track) => {
    if (!playlist.some(t => t.id === track.id)) {
      setPlaylist([...playlist, track]);
      showNotification(`Added "${track.title}" to playlist`, 'success');
      if (playlist.length === 0) {
        showNotification('Tip: You can drag tracks to reorder them!', 'info');
      }
    } else {
      showNotification('This track is already in your playlist', 'warning');
    }
  };

  const handleRemoveTrack = (track: Track) => {
    setPlaylist(playlist.filter(t => t.id !== track.id));
    showNotification(`Removed "${track.title}" from playlist`, 'info');
  };

  const handleSavePlaylist = async (name: string, tracks: Track[]) => {
    if (tracks.length === 0) {
      showNotification('Add some tracks to your playlist first!', 'warning');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      showNotification('Creating your playlist...', 'info');
      await createPlaylist(name, tracks);
      setPlaylist([]); // Clear playlist after saving
      setRefreshPlaylistTrigger(prev => prev + 1);
      showNotification(`Playlist "${name}" saved successfully!`, 'success');
    } catch (err) {
      setError('Failed to save playlist. Please try again.');
      showNotification('Failed to save playlist. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorderTracks = (reorderedTracks: Track[]) => {
    setPlaylist(reorderedTracks);
  };

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylistId(playlistId || null);
    if (!playlistId) {
      // Clear the current playlist when creating a new one
      setPlaylist([]);
    }
  };

  return (
    <div className="App">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {!isLoggedIn ? (
        <div className="login-container">
          <h1>JAM JAM</h1>
          <button onClick={initiateSpotifyLogin} className="login-button">Sign in to Spotify</button>
        </div>
      ) : (
        <>
          <PlaylistSidebar 
            refreshTrigger={refreshPlaylistTrigger} 
            onPlaylistSelect={handlePlaylistSelect}
            selectedPlaylistId={selectedPlaylistId}
          />
          <div className="main-content">
            <h1>JAM JAM</h1>
            <UserProfile />
            <Search onSearch={handleSearch} isLoading={isLoading} />
            {error && <div className="error-message">{error}</div>}
            <div className="content">
              <div className="results-section">
                <SearchResults 
                  results={searchResults} 
                  onAddTrack={handleAddTrack} 
                />
              </div>
              <div className="create-playlist-section">
                <Playlist 
                  tracks={playlist}
                  onRemoveTrack={handleRemoveTrack}
                  onSave={handleSavePlaylist}
                  onReorder={handleReorderTracks}
                  mode={selectedPlaylistId ? 'edit' : 'create'}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App 