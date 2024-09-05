import React, { useState, useEffect } from 'react';
import BottomNavigation from './components/BottomNavigation';
import BD from './components/BD';
import { jwtDecode } from 'jwt-decode';
import FollowButton from './components/FollowButton';
import './components/ProfilPage.css';
import { FiSettings } from 'react-icons/fi'; // Importez l'icône d'engrenage

function ProfilPage() {
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [photo, setPhoto] = useState('');
  const [description, setDescription] = useState('');
  const [bd, setBd] = useState([]);
  const [utilisateur_id, setUtilisateurId] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // État pour contrôler l'affichage du formulaire de modification
  const [newPseudo, setNewPseudo] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPhoto, setNewPhoto] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    setUtilisateurId(decodedToken.id);
  
    const fetchProfile = async () => {
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'x-access-token': token
        }
      });
  
      const data = await response.json();
      setEmail(data.email);
      setPseudo(data.pseudo);
      setPhoto(data.photo || '');
      setDescription(data.description || '');
      setNewPseudo(data.pseudo || '');
      setNewDescription(data.description || '');
      setNewPhoto(data.photo || '');
  
      // Log utilisateur_id to verify
      console.log('Utilisateur ID:', decodedToken.id);
    };
  
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchBd = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/bd/user/${utilisateur_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('An error occurred:', response.statusText);
        return;
      }

      const data = await response.json();
      setBd(data);
    };

    if (utilisateur_id) {
      fetchBd();
    }
  }, [utilisateur_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3001/api/auth/profile', {
      method: 'PUT',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pseudo: newPseudo,
        photo: newPhoto,
        description: newDescription
      })
    });

    if (!response.ok) {
      console.error('Une erreur est survenue lors de la mise à jour du profil');
      return;
    }

    const data = await response.json();
    setEmail(data.email);
    setPseudo(data.pseudo);
    setPhoto(data.photo);
    setDescription(data.description);
    setIsEditing(false); // Masquer le formulaire après la soumission
  };

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:3001/uploads', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      setNewPhoto(data.path.replace(/^\//, ''));
    } else {
      console.log("HTTP-Error: " + response.status);
    }
  }

  return (
    <div className="profil-page">
      <header className="profil-header">
        <div className="profil-header-info">
          <img 
            src={photo ? `http://localhost:3001/${photo}` : '/images/defaultprofil.png'} 
            alt="Profil" 
            className="profil-header-photo" 
          />
          <div className="profil-header-details">
            <h2 className="profil-header-pseudo">{pseudo}</h2>
            <p className="profil-header-description">{description}</p>
          </div>
        </div>
        <div className="profil-header-stats">
          <FollowButton utilisateurId={utilisateur_id} />
          
          <div className="profil-settings">
            <FiSettings
              size={24}
              onClick={() => setIsEditing(prev => !prev)}
              className="settings-icon"
            />
          </div>
        </div>
      </header>

      {isEditing && (
        <div className="profil-edit-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="pseudo">Pseudo</label>
              <input
                type="text"
                id="pseudo"
                value={newPseudo}
                onChange={(e) => setNewPseudo(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="photo">Photo de Profil</label>
              <input
                type="file"
                id="photo"
                onChange={handleFileUpload}
              />
              {newPhoto && <img src={`http://localhost:3001/${newPhoto}`} alt="New Profil" className="preview-photo" />}
            </div>
            <button type="submit">Sauvegarder</button>
          </form>
        </div>
      )}

      <div className="profil-bd-grid">
        {Array.isArray(bd) && bd.length > 0 ? (
          bd.map((bdItem) => (
            <div key={bdItem.id} className="profil-bd-item">
              <BD bd={bdItem} utilisateur_id={utilisateur_id} />
            </div>
          ))
        ) : (
          <p className="profil-bd-no-items">Aucune BD publiée pour l'instant</p>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}

export default ProfilPage;
