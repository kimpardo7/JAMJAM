import { useState, useEffect } from 'react';
import { getUserProfile } from '../../utils/spotify';
import './UserProfile.css';

interface UserData {
  display_name: string;
  images?: { url: string }[];
}

export function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setUserData(data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      }
    };

    fetchUserData();
  }, []);

  if (error) return null; // Silently fail if there's an error
  if (!userData) return null; // Don't render anything while loading

  return (
    <div className="user-profile">
      {userData.images?.[0]?.url && (
        <img 
          src={userData.images[0].url} 
          alt={`${userData.display_name}'s profile`} 
          className="profile-image"
        />
      )}
      <span className="username">
        {userData.display_name}
      </span>
    </div>
  );
} 