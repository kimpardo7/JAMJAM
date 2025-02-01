import { useState, useEffect, useCallback } from 'react';
import './PlayButton.css';

interface PlayButtonProps {
  previewUrl: string;
  size?: 'small' | 'medium' | 'large';
  isSpotifyUri?: boolean;
}

export function PlayButton({ previewUrl, size = 'medium', isSpotifyUri = false }: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
    if (!previewUrl || previewUrl === '') return;

    if (isSpotifyUri) {
      // Open Spotify app or web player
      window.open(previewUrl, '_blank');
      return;
    }

    if (!audio) {
      stopOtherAudio();
      const newAudio = new Audio(previewUrl);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      } else {
        stopOtherAudio();
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  if (!previewUrl || previewUrl === '') {
    return null;
  }

  return (
    <button 
      className={`play-button ${size} ${isPlaying ? 'playing' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
    >
      {isSpotifyUri ? '▶' : (isPlaying ? '⏸' : '▶')}
    </button>
  );
} 