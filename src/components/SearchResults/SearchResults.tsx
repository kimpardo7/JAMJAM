import './SearchResults.css';
import { Track } from '../../types/Track';
import { PlayButton } from '../PlayButton/PlayButton';

interface SearchResultsProps {
  results: Track[];
  onAddTrack: (track: Track) => void;
}

export function SearchResults({ results, onAddTrack }: SearchResultsProps) {
  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2 className="results-title">Search Results</h2>
      </div>

      {results.length === 0 ? (
        <div className="empty-results">
          <span className="empty-results-icon">🎵</span>
          <h3 className="empty-results-text">No tracks found</h3>
          <p className="empty-results-subtext">
            Start by searching for your favorite songs, artists, or albums
          </p>
        </div>
      ) : (
        <div className="results-list">
          {results.map((track) => (
            <div key={track.id} className="track-item">
              <div className="track-image-container">
                <img
                  src={track.albumUrl}
                  alt={`${track.album} cover`}
                  className="track-image"
                />
                <div className="track-play-overlay">
                  {track.previewUrl && track.previewUrl !== '' && (
                    <PlayButton previewUrl={track.previewUrl} size="medium" />
                  )}
                </div>
              </div>
              <div className="track-info">
                <span className="track-title">{track.title}</span>
                <span className="track-artist">{track.artist}</span>
                <span className="track-album">{track.album}</span>
              </div>
              <span className="track-duration">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>
              <button
                className="add-track-btn"
                onClick={() => onAddTrack(track)}
                aria-label={`Add ${track.title} to playlist`}
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 