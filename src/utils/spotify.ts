import type { Track } from '../types/Track';

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Array of scopes we're requesting from Spotify
const scopes = [
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'playlist-read-collaborative',
];

// Generate a random string for state parameter
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const TOKEN_KEY = 'spotify_access_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';

export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  // Check if token is expired
  if (Date.now() > Number(expiry)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }

  return token;
};

export const handleAuthResponse = () => {
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (accessToken && expiresIn) {
      // Save token and expiry
      localStorage.setItem(TOKEN_KEY, accessToken);
      const expiryTime = Date.now() + Number(expiresIn) * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      // Clear the URL hash without triggering a reload
      window.history.replaceState(null, '', window.location.pathname);
      return true;
    }
  }
  return false;
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export const initiateSpotifyLogin = () => {
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);

  const args = new URLSearchParams({
    response_type: 'token',
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    state: state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${args}`;
};

export const getPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlist tracks');
  }

  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.track.id,
    title: item.track.name,
    artist: item.track.artists[0].name,
    album: item.track.album.name,
    uri: item.track.uri,
    albumUrl: item.track.album.images[0]?.url,
    duration: Math.floor(item.track.duration_ms / 1000),
    previewUrl: item.track.preview_url || ''
  }));
};

export const getUserProfile = async () => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

export const getUserPlaylists = async () => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }

  return response.json();
};

// Helper function to make authenticated requests to Spotify API
export const spotifyRequest = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return response.json();
}; 