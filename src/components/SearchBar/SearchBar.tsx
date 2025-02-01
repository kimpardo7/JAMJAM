import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(term);
  };

  const handleTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(event.target.value);
  };

  return (
    <form className="SearchBar" onSubmit={handleSubmit}>
      <input
        placeholder="Enter A Song Title"
        onChange={handleTermChange}
        value={term}
      />
      <button type="submit" className="SearchButton">
        Search
      </button>
    </form>
  );
};

export default SearchBar; 