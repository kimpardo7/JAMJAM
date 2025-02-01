import { useEffect, useState } from 'react';
import { initiateSpotifyLogin, handleRedirect, getSpotifyAccessToken } from '../utils/spotify';

export const SpotifyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if we're returning from Spotify auth
    if (window.location.hash) {
      const success = handleRedirect();
      setIsAuthenticated(success);
      return;
    }

    // Check if we already have a valid token
    const token = getSpotifyAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    initiateSpotifyLogin();
  };

  return (
    <div className="spotify-auth">
      {!isAuthenticated ? (
        <button 
          onClick={handleLogin}
          className="login-button"
        >
          Connect to Spotify
        </button>
      ) : (
        <div className="auth-status">Connected to Spotify</div>
      )}
    </div>
  );
}; 