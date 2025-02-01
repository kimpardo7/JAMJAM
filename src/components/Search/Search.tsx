import { useState, useRef } from 'react';
import './Search.css';

interface SearchProps {
  onSearch: (searchTerm: string) => void;
  isLoading?: boolean;
}

export function Search({ onSearch, isLoading = false }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    } else {
      // Add shake animation for empty search
      formRef.current?.classList.add('shake');
      setTimeout(() => {
        formRef.current?.classList.remove('shake');
      }, 300);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !searchTerm.trim()) {
      e.preventDefault();
      // Add shake animation for empty search
      formRef.current?.classList.add('shake');
      setTimeout(() => {
        formRef.current?.classList.remove('shake');
      }, 300);
    }
  };

  return (
    <div className="search">
      <form ref={formRef} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for songs, artists, or albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          aria-label="Search input"
        />
        <button 
          type="submit" 
          className={isLoading ? 'loading' : ''}
          disabled={isLoading}
          aria-label={isLoading ? 'Searching...' : 'Search'}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
} 