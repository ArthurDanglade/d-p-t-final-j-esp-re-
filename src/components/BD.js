// BD.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BD.css'; // Importation du CSS
import CommentModal from './CommentModal'; // Importation correcte du composant CommentModal

function BD({ bd, utilisateur_id, showDetails = true }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(bd.likes || 0);
  const [showAll, setShowAll] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(1);
  const [showComments, setShowComments] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour gérer l'ouverture de la modale

  const location = useLocation();

  useEffect(() => {
    setLikes(bd.likes || 0);
    setShowAll(location.pathname === `/bd/${bd.id}`);
    fetchBDLikes();
    fetchUserLikeStatus();
    fetchComments();
  }, [bd, location, utilisateur_id]);

  const fetchUserLikeStatus = async () => {
    if (!utilisateur_id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/communaute/utilisateur/${utilisateur_id}/likes/${bd.id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      const data = await response.json();
      setLiked(data.liked);
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de like de l\'utilisateur:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/comments/${bd.id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
    }
  };

  const handleLike = async () => {
    if (!utilisateur_id) {
      console.error('utilisateur_id est undefined');
      return;
    }

    try {
      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:3001/api/communaute/${utilisateur_id}/like/${bd.id}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setLiked(!liked);
        setLikes(prevLikes => prevLikes + (liked ? -1 : 1));
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du like:', error);
    }
  };

  const fetchBDLikes = async () => {
    try {
      console.log(`Fetching likes for BD ID: ${bd.id}`);
      const response = await fetch(`http://localhost:3001/api/communaute/likes/${bd.id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Fetched likes for BD ID ${bd.id}:`, data);
      setLikes(data.total_likes);
    } catch (error) {
      console.error('Erreur lors de la récupération des likes:', error);
    }
  };

  const handleAddComment = async () => {
    if (!utilisateur_id || !newComment.trim()) {
      console.error('Utilisateur ID ou nouveau commentaire est vide');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bd_id: bd.id, utilisateur_id, comment: newComment, rating }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        await fetchComments();
        setNewComment('');
        setRating(1);
      } else {
        console.error('Erreur lors de l\'ajout du commentaire:', result);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const openCommentModal = () => {
    setIsModalOpen(true);
  };

  const closeCommentModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`bd-item ${showDetails ? 'show-details' : 'show-cover'}`}>
      {/* Affichage seulement de la couverture si showDetails est false */}
      <img src={`http://localhost:3001/${bd.pages[0].image_url.replace(/\\/g, '/')}`} alt="Couverture" className="bd-cover" />

      {showDetails && (
        <>
          <p className="bd-description">{bd.description}</p>
          <Link to={`/bd/${bd.id}`}>Lire plus</Link><br />
          <button onClick={handleLike} style={{ color: liked ? 'red' : 'black' }}>
            ❤
          </button>
          <span>{likes}</span>
          <button onClick={openCommentModal} style={{ marginLeft: '10px' }}>
            💬
          </button>

          {/* Affichage de la modale des commentaires */}
          {isModalOpen && (
            <CommentModal
              comments={comments}
              newComment={newComment}
              rating={rating}
              setNewComment={setNewComment}
              setRating={setRating}
              handleAddComment={handleAddComment}
              closeModal={closeCommentModal}
            />
          )}
        </>
      )}
    </div>
  );
}

export default BD;
