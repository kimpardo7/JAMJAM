import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import './Playlist.css';
import { Track, loginToSpotify, getAccessToken } from '../../services/musicApi';

interface PlaylistProps {
  tracks: Track[];
  onRemoveTrack: (track: Track) => void;
  onSave: (name: string, tracks: Track[]) => void;
  onReorder: (reorderedTracks: Track[]) => void;
  mode?: 'create' | 'edit';
}

export function Playlist({ tracks, onRemoveTrack, onSave, onReorder, mode = 'create' }: PlaylistProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [draggedTrack, setDraggedTrack] = useState<Track | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Check authentication status on mount and when URL hash changes
    const checkAuth = () => {
      const token = getAccessToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('hashchange', checkAuth);
    return () => window.removeEventListener('hashchange', checkAuth);
  }, []);

  const handleDragStart = (track: Track) => {
    setDraggedTrack(track);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedTrack) return;

    const sourceIndex = tracks.findIndex(t => t.id === draggedTrack.id);
    if (sourceIndex === -1) return;

    const newTracks = [...tracks];
    newTracks.splice(sourceIndex, 1);
    newTracks.splice(targetIndex, 0, draggedTrack);

    onReorder(newTracks);
    setDraggedTrack(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setError(null);
    if (!isAuthenticated) {
      try {
        loginToSpotify();
      } catch (err) {
        setError('Failed to initiate Spotify login. Please try again.');
        console.error('Login error:', err);
      }
    } else {
      try {
        await onSave(playlistName.trim(), tracks);
        setPlaylistName('');
        setIsEditing(false);
      } catch (err) {
        setError('Failed to save playlist. Please try again.');
        console.error('Save error:', err);
      }
    }
  };

  return (
    <div className="playlist">
      <div className="playlist-header">
        <h2 className="create-playlist-title">
          {mode === 'edit' ? 'Edit Playlist' : 'Create Playlist'}
        </h2>
      </div>
      <div className="playlist-actions">
        <input
          type="text"
          className="playlist-name-input"
          placeholder="Name your playlist..."
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <button
          className="save-button"
          onClick={handleSave}
          disabled={!playlistName.trim() || tracks.length === 0}
        >
          <span className="save-button-icon">💾</span>
          Save
        </button>
      </div>

      {tracks.length === 0 ? (
        <div className="empty-playlist">
          <span className="empty-playlist-icon">🎵</span>
          <h3 className="empty-playlist-text">Your playlist is empty</h3>
          <p className="empty-playlist-subtext">
            Search for songs and add them to your playlist
          </p>
        </div>
      ) : (
        <div className="tracks-container">
          {tracks.map((track, index) => (
            <div key={track.id}>
              {dragOverIndex === index && (
                <div className="drag-indicator active" />
              )}
              <div
                className={`playlist-track ${draggedTrack?.id === track.id ? 'dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(track)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <img
                  src={track.albumUrl}
                  alt={`${track.album} cover`}
                  className="playlist-track-image"
                />
                <div className="playlist-track-info">
                  <span className="playlist-track-name">{track.title}</span>
                  <span className="playlist-track-artist">{track.artist}</span>
                  <span className="playlist-track-album">{track.album}</span>
                </div>
                <span className="playlist-track-duration">
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </span>
                <button
                  className="remove-track-btn"
                  onClick={() => onRemoveTrack(track)}
                  aria-label={`Remove ${track.title} from playlist`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {dragOverIndex === tracks.length && (
            <div className="drag-indicator active" />
          )}
        </div>
      )}
    </div>
  );
} 