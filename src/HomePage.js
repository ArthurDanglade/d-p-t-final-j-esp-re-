import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BD from './components/BD';
import BottomNavigation from './components/BottomNavigation';
import FollowButton from './components/FollowButton';
import './components/HomePage.css';
import { FiFilter } from 'react-icons/fi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faStar as faStarEmpty } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const [bds, setBds] = useState([]);
  const [filteredBds, setFilteredBds] = useState([]);
  const [utilisateurId, setUtilisateurId] = useState(null);
  const [utilisateursSuivis, setUtilisateursSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

        setBds(updatedData);
        setFilteredBds(updatedData);
        const allThemes = updatedData.flatMap(bd => bd.themes);
        const uniqueThemes = [...new Set(allThemes)];
        setAvailableThemes(uniqueThemes);
      } catch (error) {
        console.error('Error fetching BDs:', error);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBds();
  }, [utilisateurId]);

  useEffect(() => {
    const fetchUtilisateursSuivis = async () => {
      if (!utilisateurId) return;
      try {
        const response = await fetch(`http://localhost:3001/api/utilisateursSuivis/${utilisateurId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUtilisateursSuivis(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching utilisateurs suivis:', error);
      }
    };

    fetchUtilisateursSuivis();
  }, [utilisateurId]);

  useEffect(() => {
    if (selectedThemes.length > 0) {
      const newFilteredBds = bds.filter(bd =>
        selectedThemes.every(theme => bd.themes.includes(theme))
      );
      setFilteredBds(newFilteredBds);
    } else {
      setFilteredBds(bds);
    }
  }, [selectedThemes, bds]);

  const handleThemeChange = (theme) => {
    setSelectedThemes(prevSelectedThemes =>
      prevSelectedThemes.includes(theme)
        ? prevSelectedThemes.filter(t => t !== theme)
        : [...prevSelectedThemes, theme]
    );
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
    <div className="homepage-container homepage">
      <div className="logo-container">
        <img src="/logo.svg" alt="Bubble Logo" className="logo" />
      </div>
      
      <div className="filter-icon" onClick={() => setShowFilterMenu(prev => !prev)}>
        <FiFilter size={24} />
      </div>
      
      {showFilterMenu && (
        <div className="filter-menu">
          <h2>Filtrer par thème</h2>
          {availableThemes.map(theme => (
            <label key={theme}>
              <input
                type="checkbox"
                checked={selectedThemes.includes(theme)}
                onChange={() => handleThemeChange(theme)}
              />
              {theme}
            </label>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="bd-container">
          {filteredBds.map((bdItem, index) => (
            <React.Fragment key={bdItem.id}>
              <div className="bd-item">
                <h2>
                  {bdItem.title} <br />
                </h2>
                <div>
                  <span className="average-rating">
                    {renderStars(bdItem.averageRating)} ({bdItem.averageRating.toFixed(1)} étoiles)
                  </span>
                </div>
                <p>
                  Publié par :{' '}
                  <Link to={`/public-profile/${bdItem.utilisateur.pseudo}`} className="pseudo-link">
                    {bdItem.utilisateur.pseudo}
                  </Link>{' '}
                  | {bdItem.followersCount} - 
                  <FollowButton
                    utilisateurId={bdItem.utilisateur_id}
                    isFollowing={utilisateursSuivis.includes(bdItem.utilisateur_id)}
                    onFollowChange={(following, followersCount) => {
                      setBds(prevBds =>
                        prevBds.map(bd =>
                          bd.utilisateur_id === bdItem.utilisateur_id
                            ? { ...bd, followersCount }
                            : bd
                        )
                      );
                      setUtilisateursSuivis(prevSuivis =>
                        following
                          ? [...prevSuivis, bdItem.utilisateur_id]
                          : prevSuivis.filter(id => id !== bdItem.utilisateur_id)
                      );
                    }}
                  />
                </p>

                <div className="bd-themes">
                  {bdItem.themes.length > 0 ? (
                    bdItem.themes.map(theme => (
                      <span key={theme} className="bd-theme">{theme}</span>
                    ))
                  ) : (
                    <span>Pas de thèmes</span>
                  )}
                </div>

                <BD bd={bdItem} utilisateur_id={utilisateurId} />
              </div>
              {index < filteredBds.length - 1 && <hr className="bd-separator" />}
            </React.Fragment>
          ))}
        </div>
      )}
      <BottomNavigation />
    </div>
  );
};

export default HomePage;