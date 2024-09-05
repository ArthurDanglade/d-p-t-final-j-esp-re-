import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BD from './components/BD';
import BottomNavigation from './components/BottomNavigation';
import FollowButton from './components/FollowButton';
import './components/SearchPage.css'; // Assurez-vous d'avoir ce fichier CSS
import { FiFilter } from 'react-icons/fi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faStar as faStarEmpty } from '@fortawesome/free-solid-svg-icons';

const SearchPage = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [randomBds, setRandomBds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [utilisateurId, setUtilisateurId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUtilisateurId(decodedToken.id);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    } else {
      console.error('Token is not available in localStorage');
    }
  }, []);

  useEffect(() => {
    const fetchBds = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3001/api/bd');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const updatedData = await Promise.all(data.map(async (item) => {
          const followersResponse = await fetch(`http://localhost:3001/api/followersCount/${item.utilisateur_id}`);
          if (!followersResponse.ok) {
            throw new Error(`HTTP error! Status: ${followersResponse.status}`);
          }
          const followersData = await followersResponse.json();
          const averageRatingResponse = await fetch(`http://localhost:3001/api/comments/average-rating/${item.id}`);
          if (!averageRatingResponse.ok) {
            throw new Error(`HTTP error! Status: ${averageRatingResponse.status}`);
          }
          const averageRatingData = await averageRatingResponse.json();

          const themes = item.characteristics ? item.characteristics.split(',').map(theme => theme.trim()) : [];

          return {
            ...item,
            followersCount: followersData.followersCount || 0,
            averageRating: parseFloat(averageRatingData.averageRating) || 0,
            themes: themes,
          };
        }));

        // Mélanger les BD
        const shuffledBds = shuffleArray(updatedData);
        setRandomBds(shuffledBds);
      } catch (error) {
        console.error('Error fetching BDs:', error);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBds();
  }, [utilisateurId]);

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

  const renderStars = (averageRating) => {
    const fullStars = Math.floor(averageRating);
    const halfStar = averageRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesomeIcon key={`full-${i}`} icon={faStar} style={{ color: '#FFD700' }} />
        ))}
        {halfStar && <FontAwesomeIcon icon={faStarHalfAlt} style={{ color: '#FFD700' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesomeIcon key={`empty-${i}`} icon={faStarEmpty} style={{ color: '#C0C0C0' }} />
        ))}
      </>
    );
  };

  return (
    <div className="search-page">
      <h1 className="search-page-title">Page de recherche</h1>
      <p className="search-page-description">Recherche d'utilisateur et de BD</p>
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
          <h2 className="search-page-results-title">Résultats de recherche :</h2>
          <ul className="search-page-results-list">
            {results.length > 0 ? (
              results.map((user) => (
                <li key={user.id} className="search-page-results-item">
                  <Link to={`/public-profile/${user.pseudo}`}>{user.pseudo}</Link>
                </li>
              ))
            ) : (
              <p className="search-page-no-results">Aucun utilisateur trouvé.</p>
            )}
          </ul>
        </div>
      ) : (
        <div className="search-page-random-bd-container">
          <h2 className="search-page-random-bd-title">Découvrez des auteurs :</h2>

          {loading ? (
            <p className="search-page-loading">Chargement...</p>
          ) : error ? (
            <p className="search-page-error">{error}</p>
          ) : (
<div className="search-page-bd-grid">
  {randomBds.map((bdItem) => (
    <div key={bdItem.id} className="search-page-bd-item">
      <h2 className="search-page-bd-title">{bdItem.title}</h2>
      <div className="search-page-bd-rating">
        <span className="average-rating">
          {renderStars(bdItem.averageRating)} ({(bdItem.averageRating || 0).toFixed(1)} étoiles)
        </span>
      </div>
      <p className="search-page-bd-author">
        Publié par :{' '}
        <Link to={`/public-profile/${bdItem.utilisateur.pseudo}`} className="pseudo-link">
          {bdItem.utilisateur.pseudo}
        </Link>
      </p>
      <div className="search-page-bd-themes">
        {bdItem.themes && bdItem.themes.length > 0 ? (
          bdItem.themes.map(theme => (
            <span key={theme} className="search-page-bd-theme">{theme}</span>
          ))
        ) : (
          <span className="search-page-no-themes">Pas de thèmes</span>
        )}
      </div>
      <BD bd={bdItem} utilisateur_id={utilisateurId} />
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