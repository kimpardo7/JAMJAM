# Technical Design Document: Track Preview Feature

## Feature Overview
Add audio preview functionality to each track in both search results and playlist sections, allowing users to listen to a 30-second preview of songs before adding them to their playlist.

## Motivation
Currently, users can only see track information without being able to preview the song. This makes it difficult to identify the correct song, especially when multiple versions exist. Adding preview functionality will improve user experience and confidence in song selection.

## Technical Design

### 1. Data Structure Changes
```typescript
interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
  previewUrl: string;  // New field for preview URL
  isPlaying: boolean;  // New field to track playback state
}
```

### 2. Component Changes

#### 2.1 Track Component (New)
- Create a reusable Track component to handle individual track display and playback
- Include play/pause button with appropriate icons
- Handle audio playback state
- Display loading state during audio loading

```typescript
interface TrackProps {
  track: Track;
  onAdd?: (track: Track) => void;
  onRemove?: (track: Track) => void;
  isInPlaylist?: boolean;
}
```

#### 2.2 Audio Controller (New)
- Singleton service to manage audio playback
- Ensure only one track plays at a time
- Handle play/pause/stop functionality
- Manage audio events and state

### 3. API Integration
- Update Deezer API integration to include preview_url in track data
- Handle cases where preview is not available
- Implement error handling for failed audio loading

### 4. User Interface
- Add play/pause button to each track
- Show loading spinner during audio load
- Indicate tracks without preview availability
- Visual feedback for currently playing track
- Progress bar for preview duration

### 5. Implementation Phases

#### Phase 1: Core Audio Functionality
1. Create AudioController service
2. Update Track interface
3. Implement basic play/pause functionality

#### Phase 2: UI Components
1. Create Track component
2. Add play/pause buttons
3. Implement loading states
4. Add progress indicator

#### Phase 3: Integration
1. Update API service to include preview URLs
2. Integrate Track component into SearchResults and Playlist
3. Add error handling
4. Test cross-browser compatibility

### 6. Error Handling
- Handle unavailable preview URLs
- Manage network errors during audio loading
- Handle playback errors
- Provide user feedback for all error states

### 7. Testing Plan
1. Unit tests for AudioController
2. Component tests for Track component
3. Integration tests for preview functionality
4. Cross-browser testing
5. Mobile device testing

## Timeline
- Phase 1: 2 days
- Phase 2: 2 days
- Phase 3: 1 day
- Testing: 1 day
Total: 6 days

## Success Metrics
1. User engagement with preview feature
2. Reduction in playlist modifications
3. User satisfaction surveys
4. Performance metrics (load times, error rates)

## Alternatives Considered
1. Using YouTube API for previews
   - Pros: Full songs available
   - Cons: More complex integration, licensing issues
2. Using Spotify API
   - Pros: Better integration with existing functionality
   - Cons: Requires user authentication

## Dependencies
- Browser audio API support
- Deezer API preview URL availability
- Network bandwidth for audio streaming

## Security Considerations
- CORS configuration for audio files
- Audio file access restrictions
- Rate limiting for preview requests 