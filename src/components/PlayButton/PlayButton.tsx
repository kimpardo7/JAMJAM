import { useState, useEffect, useCallback } from 'react';
import './PlayButton.css';

interface PlayButtonProps {
  previewUrl: string;
  size?: 'small' | 'medium' | 'large';
}

export function PlayButton({ previewUrl, size = 'medium' }: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const stopOtherAudio = useCallback(() => {
    // Stop any other playing audio elements
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const handlePlay = () => {
    if (!previewUrl) {
      setError('No preview available for this track');
      return;
    }

    if (!audio) {
      stopOtherAudio();
      const newAudio = new Audio(previewUrl);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.addEventListener('error', () => {
        setError('Failed to load audio preview');
        setIsPlaying(false);
      });
      newAudio.play().catch(() => {
        setError('Failed to play audio preview');
        setIsPlaying(false);
      });
      setAudio(newAudio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      } else {
        stopOtherAudio();
        audio.play().catch(() => {
          setError('Failed to play audio preview');
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  if (!previewUrl) {
    return (
      <button 
        className={`play-button ${size} disabled`}
        disabled={true}
        title="No preview available"
      >
        ⚠️
      </button>
    );
  }

  return (
    <button 
      className={`play-button ${size} ${isPlaying ? 'playing' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
      title={error || (isPlaying ? 'Pause preview' : 'Play preview')}
    >
      {error ? '⚠️' : (isPlaying ? '⏸' : '▶')}
    </button>
  );
} 