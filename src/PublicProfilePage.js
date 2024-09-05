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
    <div>
      <h1>{user.pseudo}</h1>
      <p>{user.description}</p>
      <p>{user.email}</p>
      {user.photo && <img src={`http://localhost:3001/${user.photo}`} alt={`${user.pseudo}'s profile`} />}
      <p>Followers: {followersCount}</p>
      <button onClick={handleFollowButtonClick}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
      {Array.isArray(bds) && bds.length > 0 ? (
        bds.map((bdItem, index) => 
          bdItem.pages && bdItem.pages.length > 0 ? (
            <div key={bdItem.id}>
              <h2>{bdItem.title}</h2>
              <BD bd={bdItem} utilisateur_id={utilisateurId} />
            </div>
          ) : (
            <p key={index}>Cette BD n'a pas de pages</p>
          )
        )
      ) : (
        <p>Aucune BD publiée pour l'instant.</p>
      )}
      <BottomNavigation />
    </div>
  );
};

export default PublicProfilePage;
