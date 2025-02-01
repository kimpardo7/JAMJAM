const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

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

// Save access token and expiration time
const setAccessToken = (accessToken: string, expiresIn: number) => {
  window.localStorage.setItem('spotify_access_token', accessToken);
  const expirationTime = Date.now() + expiresIn * 1000;
  window.localStorage.setItem('spotify_token_expires', expirationTime.toString());
};

// Get the access token from localStorage
const getAccessToken = (): string | null => {
  const accessToken = window.localStorage.getItem('spotify_access_token');
  const expirationTime = window.localStorage.getItem('spotify_token_expires');

  if (!accessToken || !expirationTime) {
    return null;
  }

  if (Date.now() > parseInt(expirationTime)) {
    // Token has expired
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_token_expires');
    return null;
  }

  return accessToken;
};

export const initiateSpotifyLogin = () => {
  const state = generateRandomString(16);
  window.localStorage.setItem('spotify_auth_state', state);

  const args = new URLSearchParams({
    response_type: 'token',
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    state: state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${args}`;
};

export const handleRedirect = (): boolean => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  const accessToken = params.get('access_token');
  const state = params.get('state');
  const storedState = window.localStorage.getItem('spotify_auth_state');
  const expiresIn = params.get('expires_in');

  // Clear the state
  window.localStorage.removeItem('spotify_auth_state');

  if (!accessToken || state !== storedState) {
    return false;
  }

  if (expiresIn) {
    setAccessToken(accessToken, parseInt(expiresIn));
  }

  // Remove the hash from the URL
  window.history.replaceState(null, '', window.location.pathname);
  return true;
};

export const getSpotifyAccessToken = (): string | null => {
  const accessToken = getAccessToken();
  
  if (accessToken) {
    return accessToken;
  }

  // If we don't have a token, initiate the login flow
  initiateSpotifyLogin();
  return null;
};

// Helper function to make authenticated requests to Spotify API
export const spotifyRequest = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = getSpotifyAccessToken();
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