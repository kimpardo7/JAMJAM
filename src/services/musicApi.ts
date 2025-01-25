const API_KEY = '27ec92f205mshb372f8bfbd1b341p126e13jsn0d0f9fa780c0';
const API_HOST = 'deezerdevs-deezer.p.rapidapi.com'; // We'll use Deezer API as an example

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
}

export async function searchTracks(query: string): Promise<Track[]> {
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
    
    // Transform Deezer data to our Track interface
    return data.data.map((item: any) => ({
      id: item.id.toString(),
      name: item.title,
      artist: item.artist.name,
      album: item.album.title,
      uri: item.link
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

export async function createPlaylist(name: string, tracks: Track[]): Promise<boolean> {
  // Since we can't actually save to Deezer without OAuth, we'll mock this
  console.log('Creating playlist:', name, 'with tracks:', tracks);
  // In a real app, you would make a POST request to create the playlist
  return true;
} 