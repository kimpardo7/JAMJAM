import type { Track } from '../types/Track';
import { spotifyRequest } from '../utils/spotify';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export const searchTracks = async (query: string): Promise<Track[]> => {
  const data = await spotifyRequest(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=20`
  );

  return data.tracks.items.map((item: any) => ({
    id: item.id,
    title: item.name,
    artist: item.artists[0].name,
    album: item.album.name,
    uri: item.uri,
    albumUrl: item.album.images[0]?.url,
    duration: Math.floor(item.duration_ms / 1000),
    previewUrl: item.preview_url || ''
  }));
};

export const createPlaylist = async (name: string, tracks: Track[]): Promise<boolean> => {
  try {
    // Get user ID
    const userData = await spotifyRequest('/me');
    const userId = userData.id;

    // Create playlist
    const playlistData = await spotifyRequest(
      `/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: 'Created with JAM JAM',
          public: true,
        }),
      }
    );

    // Add tracks to playlist
    const trackUris = tracks
      .filter(track => track.uri)
      .map(track => track.uri);

    if (trackUris.length > 0) {
      await spotifyRequest(
        `/playlists/${playlistData.id}/tracks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: trackUris,
          }),
        }
      );
    }

    return true;
  } catch (error) {
    console.error('Error creating Spotify playlist:', error);
    return false;
  }
};

export const loginToSpotify = () => {
  // Generate a random state value for security
  const state = Math.random().toString(36).substring(7);
  
  // Store state in sessionStorage to verify later
  sessionStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: SCOPES.join(' ')
  });

  const authUrl = `${SPOTIFY_AUTHORIZE_ENDPOINT}?${params.toString()}`;
  console.log('Redirecting to:', authUrl); // Debug log
  window.location.href = authUrl;
};

export const getAccessToken = () => {
  // First check if we already have a token in sessionStorage
  const storedToken = sessionStorage.getItem('spotify_access_token');
  if (storedToken) {
    return storedToken;
  }

  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1)); // Remove the # character
    const token = params.get('access_token');
    const state = params.get('state');
    
    // Verify state matches
    const storedState = sessionStorage.getItem('spotify_auth_state');
    sessionStorage.removeItem('spotify_auth_state'); // Clean up
    
    if (state === storedState && token) {
      // Store the token in sessionStorage
      sessionStorage.setItem('spotify_access_token', token);
      window.location.hash = ''; // Clear hash from URL
      return token;
    }
  }
  return null;
};

// Add a function to check if we're logged in
export const isLoggedIn = () => {
  return !!getAccessToken();
};

// Add a logout function
export const logout = () => {
  sessionStorage.removeItem('spotify_access_token');
  sessionStorage.removeItem('spotify_auth_state');
}; 