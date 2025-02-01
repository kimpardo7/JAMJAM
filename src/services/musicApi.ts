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
  preview: string;
  uri?: string; // Spotify URI for the track
}

export async function searchTracks(query: string): Promise<Track[]> {
  const token = getAccessToken();
  if (token) {
    // If we have a Spotify token, search using Spotify API
    return searchSpotifyTracks(query, token);
  }

  // Fallback to Deezer if no Spotify auth
  const url = `https://${API_HOST}/search?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    return data.data.map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      artist: item.artist.name,
      album: item.album.title,
      preview: item.preview
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

async function searchSpotifyTracks(query: string, token: string): Promise<Track[]> {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search Spotify');
    }

    const data = await response.json();
    return data.tracks.items.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      preview: track.preview_url,
      uri: track.uri
    }));
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return [];
  }
}

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