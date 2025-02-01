import './SearchResults.css';
import { Track as TrackComponent } from '../Track/Track';
import { Track } from '../../services/musicApi';

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
          <TrackComponent
            key={track.id}
            track={track}
            onAdd={onAddTrack}
            isInPlaylist={false}
          />
        ))}
      </div>
    </div>
  );
} 