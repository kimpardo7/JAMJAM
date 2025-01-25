import { useState } from 'react'
import './App.css'
import { Search } from './components/Search/Search'
import { SearchResults } from './components/SearchResults/SearchResults'
import { Playlist } from './components/Playlist/Playlist'
import { searchTracks, createPlaylist, Track } from './services/musicApi'

function App() {
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchTracks(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search tracks. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrack = (track: Track) => {
    if (!playlist.some(t => t.id === track.id)) {
      setPlaylist([...playlist, track]);
    }
  };

  const handleRemoveTrack = (track: Track) => {
    setPlaylist(playlist.filter(t => t.id !== track.id));
  };

  const handleSavePlaylist = async (name: string, tracks: Track[]) => {
    setIsLoading(true);
    setError(null);
    try {
      await createPlaylist(name, tracks);
      setPlaylist([]); // Clear playlist after saving
    } catch (err) {
      setError('Failed to save playlist. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Jammming</h1>
      <div className="container">
        <Search onSearch={handleSearch} />
        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="loading">Loading...</div>}
        <div className="content">
          <SearchResults 
            results={searchResults} 
            onAddTrack={handleAddTrack} 
          />
          <Playlist 
            tracks={playlist}
            onRemoveTrack={handleRemoveTrack}
            onSave={handleSavePlaylist}
          />
        </div>
      </div>
    </div>
  )
}

export default App 