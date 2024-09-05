import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import BottomNavigation from './components/BottomNavigation';
import BD from './components/BD';

const PublicProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bds, setBds] = useState([]);
  const [utilisateurId, setUtilisateurId] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const { pseudo } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUtilisateurId(decodedToken.id);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/auth/public-profile/${pseudo}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        setUser(data);

        // Fetch BDs
        const fetchBds = async () => {
          const bdResponse = await fetch(`http://localhost:3001/api/bd/user/${data.id}`);
          if (!bdResponse.ok) throw new Error(bdResponse.statusText);
          const bdData = await bdResponse.json();
          setBds(bdData);
        };
        fetchBds();

        // Fetch followers count
        const fetchFollowersCount = async () => {
          const followersResponse = await fetch(`http://localhost:3001/api/followersCount/${data.id}`);
          if (!followersResponse.ok) throw new Error(followersResponse.statusText);
          const followersData = await followersResponse.json();
          setFollowersCount(followersData.followersCount || 0);
        };
        fetchFollowersCount();

        // Fetch total likes
const fetchTotalLikes = async () => {
  const likesResponse = await fetch(`http://localhost:3001/api/total-likes/${data.id}`);
  if (!likesResponse.ok) throw new Error(likesResponse.statusText);
  const likesData = await likesResponse.json();
  setTotalLikes(likesData.totalLikes || 0);
};
        fetchTotalLikes();

        // Check if the user is following this profile
        const checkIfFollowing = async () => {
          const response = await fetch(`http://localhost:3001/api/utilisateursSuivis/${utilisateurId}`);
          if (!response.ok) throw new Error(response.statusText);
          const suivis = await response.json();
          setIsFollowing(suivis.includes(data.id));
        };
        if (utilisateurId) {
          checkIfFollowing();
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUser();
  }, [pseudo, utilisateurId]);

  const handleFollowButtonClick = async () => {
    if (isFollowing) {
      await unfollowUser();
    } else {
      await followUser();
    }
  };

  const followUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/suivre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ utilisateur_id_suiveur: utilisateurId, utilisateur_id_suivi: user.id }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setFollowersCount(data.followersCount);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/unfollow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ utilisateur_id_suivi: user.id }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setFollowersCount(data.followersCount);
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profil-page profilpage">
      <header className="profil-header">
        <div className="profil-header-info">
          <img 
            src={user.photo ? `http://localhost:3001/${user.photo}` : '/images/defaultprofil.png'} 
            alt={`${user.pseudo}'s profile`} 
            className="profil-header-photo" 
          />
          <div className="profil-header-details">
            <h2 className="profil-header-pseudo">{user.pseudo}</h2>
            <p className="profil-header-description">{user.description}</p>
          </div>
        </div>
        <div className="profil-header-stats">
          <p className="profil-header-followers">
            Followers: {followersCount}
          </p>
          <p className="profil-header-likes">
            Total Likes: {totalLikes}
          </p>
          <button onClick={handleFollowButtonClick}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </header>

      <div className="profil-bd-grid">
        {Array.isArray(bds) && bds.length > 0 ? (
          bds.map((bdItem) => (
            <div key={bdItem.id} className="profil-bd-item">
              <h4>{bdItem.title}</h4>
              <BD bd={bdItem} utilisateur_id={utilisateurId} />
            </div>
          ))
        ) : (
          <p className="profil-bd-no-items">Aucune BD publiée pour l'instant</p>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default PublicProfilePage;
