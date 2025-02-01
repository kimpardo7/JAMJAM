import { useState, useEffect } from 'react';
import './Track.css';
import AudioController from '../../services/audioController';
import { Track as APITrack } from '../../services/musicApi';

interface TrackProps {
  track: APITrack;
  onAdd?: (track: APITrack) => void;
  onRemove?: (track: APITrack) => void;
  isInPlaylist?: boolean;
}

export function Track({ track, onAdd, onRemove, isInPlaylist }: TrackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioController = AudioController.getInstance();

  useEffect(() => {
    // Update isPlaying state when audio controller state changes
    const updatePlayingState = () => {
      setIsPlaying(audioController.isPlaying(track.id));
    };

    // Check every 100ms if this track is playing
    const interval = setInterval(updatePlayingState, 100);

    return () => clearInterval(interval);
  }, [track.id]);

  const handlePlayPause = async () => {
    if (!track.preview) {
      setError('No preview available for this track');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await audioController.play(track.id, track.preview);
      setIsPlaying(true);
    } catch (err) {
      setError('Failed to play preview');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="track">
      <div className="track-info">
        <h3>{track.title}</h3>
        <p>{track.artist} | {track.album}</p>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="track-controls">
        {track.preview && (
          <button 
            className={`preview-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? '•••' : isPlaying ? '| |' : '►'}
          </button>
        )}
        <button 
          className="action-button"
          onClick={() => isInPlaylist ? onRemove?.(track) : onAdd?.(track)}
        >
          {isInPlaylist ? '-' : '+'}
        </button>
      </div>
    </div>
  );
} 