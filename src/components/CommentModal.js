import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import './CommentModal.css';

function CommentModal({ comments, newComment, rating, setNewComment, setRating, handleAddComment, closeModal }) {

  // Fonction pour gérer le clic sur une étoile
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  return (
    <div className="comment-modal-overlay">
      <div className="comment-modal">
        <button className="comment-modal-close" onClick={closeModal}>×</button>
        <h3>Commentaires</h3>
        <div className="comment-list">
          {comments.length === 0 ? (
            <p>Aucun commentaire pour le moment</p>
          ) : (
            comments.map((comment, index) => (
              <div key={index} className="comment">
                <p><strong>{comment.pseudo}</strong> - {new Date(comment.created_at).toLocaleDateString()}</p>
                <p>
                  Rating: {' '}
                  {[...Array(comment.rating)].map((star, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} style={{ color: '#FFD700' }} />
                  ))}
                </p>
                <p>{comment.comment}</p>
              </div>
            ))
          )}
        </div>
        <div className="comment-form">
          <input 
            type="text" 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder="Ajouter un commentaire" 
          />
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(starValue => (
              <FontAwesomeIcon
                key={starValue}
                icon={faStar}
                onClick={() => handleStarClick(starValue)}
                style={{
                  color: rating >= starValue ? '#FFD700' : '#C0C0C0',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <button onClick={handleAddComment}>Commenter</button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;