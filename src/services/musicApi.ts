import { Track } from '../types/Track';
import { getAccessToken } from '../utils/spotify';

const API_KEY = '27ec92f205mshb372f8bfbd1b341p126e13jsn0d0f9fa780c0';
const API_HOST = 'deezerdevs-deezer.p.rapidapi.com'; // We'll use Deezer API as an example
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SPOTIFY_AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SCOPES = ['playlist-modify-public', 'playlist-modify-private'];

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri: string;
  albumUrl: string;
  duration: number; // Duration in seconds
  previewUrl: string;
}

export const searchTracks = async (query: string): Promise<Track[]> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=20`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search tracks');
  }

  const data = await response.json();
  return data.tracks.items.map((item: any) => ({
    id: item.id,
    title: item.name,
    artist: item.artists[0].name,
    album: item.album.name,
    uri: item.uri,
    albumUrl: item.album.images[0]?.url,
    duration: Math.floor(item.duration_ms / 1000),
    previewUrl: item.preview_url
  }));
};

export async function createPlaylist(name: string, tracks: Track[]): Promise<boolean> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Spotify');
  }

  try {
    // Get user ID
    const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = await userResponse.json();
    const userId = userData.id;

    // Create playlist
    const createResponse = await fetch(
      `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: 'Created with JAM JAM',
          public: true,
        }),
      }
    );
    const playlistData = await createResponse.json();

    // Add tracks to playlist
    const trackUris = tracks
      .filter(track => track.uri)
      .map(track => track.uri);

    if (trackUris.length > 0) {
      await fetch(
        `${SPOTIFY_API_BASE}/playlists/${playlistData.id}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
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
}

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