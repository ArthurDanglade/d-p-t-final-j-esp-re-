import React, { useState, useEffect } from 'react';

function FollowButton({ utilisateurId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (!utilisateurId) return; // Check if utilisateurId is available

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const responseCount = await fetch(`http://localhost:3001/api/followersCount/${utilisateurId}`);
        const dataCount = await responseCount.json();
        setFollowersCount(dataCount.followersCount);

        const responseFollowing = await fetch(`http://localhost:3001/api/isFollowing/${utilisateurId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataFollowing = await responseFollowing.json();
        setIsFollowing(dataFollowing.isFollowing);

        console.log('Following status:', dataFollowing.isFollowing);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [utilisateurId]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/suivre', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ utilisateur_id_suivi: utilisateurId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setIsFollowing(true);
      setFollowersCount(data.followersCount);
    } catch (error) {
      console.error('Error following user:', error.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/unfollow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ utilisateur_id_suivi: utilisateurId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setIsFollowing(false);
      setFollowersCount(data.followersCount);
    } catch (error) {
      console.error('Error unfollowing user:', error.message);
    }
  };

  return (
    <div className="follow-button-container">
      <p className="followers-count">{followersCount} Followers</p>
      {isFollowing ? (
        <button onClick={handleUnfollow} className="follow-button unfollow">Unfollow</button>
      ) : (
        <button onClick={handleFollow} className="follow-button follow">Follow</button>
      )}
    </div>
  );
}

export default FollowButton;
