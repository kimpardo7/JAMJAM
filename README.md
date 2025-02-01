# JAMJAM

A React-based web application that allows users to search for songs on Spotify, create custom playlists, and save them to their Spotify account.

## Features

- Spotify Authentication
- Search for tracks on Spotify
- Create custom playlists
- Save playlists to your Spotify account
- Modern, responsive UI with beautiful animations

## Technologies Used

- React
- TypeScript
- Vite
- Spotify Web API
- CSS3 with animations

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/kimpardo7/JAMJAM.git
```

2. Install dependencies:
```bash
cd jammming
npm install
```

3. Create a `.env` file in the root directory with your Spotify credentials:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
VITE_REDIRECT_URI=http://localhost:5173/JAM-JAM/
```

4. Start the development server:
```bash
npm run dev
```

## Environment Setup

Make sure to set up your Spotify Developer account and add the correct redirect URI in your Spotify Developer Dashboard.

## Purpose

This project was created to demonstrate the ability to build a modern React application that interacts with external APIs. It provides a user-friendly interface for searching songs and creating playlists, similar to popular music streaming services.

## Future Work

- Add search by artist name and genre
- Implement playlist sorting and filtering
- Add audio previews for songs
- Improve mobile responsiveness
- Add user authentication
- Add more customization options for playlists
- Implement full OAuth flow for saving playlists to music services
- Add drag-and-drop functionality for playlist management

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 