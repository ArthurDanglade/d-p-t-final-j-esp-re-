import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BD from './components/BD';
import BottomNavigation from './components/BottomNavigation';
import './components/SearchPage.css'; // Importer le CSS pour SearchPage

const SearchPage = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [randomBds, setRandomBds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBds = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/bd');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Mélanger les BD
        const shuffledBds = shuffleArray(data.map(bd => ({
          ...bd,
          coverUrl: bd.pages && bd.pages.length > 0 ? bd.pages[0].image_url : 'default-cover.png'
        })));

        setRandomBds(shuffledBds);
      } catch (error) {
        console.error('Error fetching BDs:', error);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBds();
  }, []);

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    // Tant que des éléments restent à mélanger...
    while (currentIndex !== 0) {
      // Choisir un index restant...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Et échanger avec l'élément à l'index actuel
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/auth/search?pseudo=${search}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching for users:', error);
      setError('Failed to perform search.');
    }
  };

  return (
    <div className="search-page">
      <h1>Page de recherche</h1>
      <p>Recherche d'utilisateur et de BD</p>
      <form onSubmit={handleSearch} className="search-page-form">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur"
          className="search-page-input"
        />
        <button type="submit" className="search-page-button">Rechercher</button>
      </form>

      {search.trim() ? (
        <div className="search-page-results">
          <h2>Résultats de recherche :</h2>
          <ul className="search-page-results-list">
            {results.length > 0 ? (
              results.map((user) => (
                <li key={user.id} className="search-page-results-item">
                  <Link to={`/public-profile/${user.pseudo}`}>{user.pseudo}</Link>
                </li>
              ))
            ) : (
              <p>Aucun utilisateur trouvé.</p>
            )}
          </ul>
        </div>
      ) : (
        <div className="search-page-random-bd-container">

          <h2>Découvrez des auteurs :</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <div className="search-page-bd-grid">
              {randomBds.map((bd) => (
                <div key={bd.id} className="search-page-bd-item">
                  <Link to={`/bd/${bd.id}`}>
                  <h3 className="search-page-bd-title">{bd.title}</h3>
                    <BD bd={bd} showDetails={false} /> {/* Afficher uniquement l'image de couverture */}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default SearchPage;
