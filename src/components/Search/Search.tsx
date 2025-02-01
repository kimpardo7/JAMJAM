import { useState, FormEvent } from 'react';
import './Search.css';

interface SearchProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export function Search({ onSearch, isLoading }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Search for songs, artists, or albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={`search-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? '' : 'Search'}
        </button>
      </form>
    </div>
  );
} 