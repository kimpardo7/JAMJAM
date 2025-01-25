import './SearchResults.css';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
}

interface SearchResultsProps {
  results: Track[];
  onAddTrack: (track: Track) => void;
}

export function SearchResults({ results, onAddTrack }: SearchResultsProps) {
  return (
    <div className="search-results">
      <h2>Results</h2>
      <div className="tracks-list">
        {results.map((track) => (
          <div key={track.id} className="track">
            <div className="track-info">
              <h3>{track.name}</h3>
              <p>{track.artist} | {track.album}</p>
            </div>
            <button onClick={() => onAddTrack(track)}>+</button>
          </div>
        ))}
      </div>
    </div>
  );
} 