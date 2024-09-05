import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './components/SignupPage.css'; // Assure-toi d'importer le fichier CSS

const SignupPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: ''
  });

  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/signup', formData);
      if (response.status === 200) {
        console.log('Inscription réussie');
        setSignupSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    }
  };

  return (
    <div className="signup-page-container">
      <h1>Inscription</h1>
      <div className="signup-form-container">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div>
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              name="nom"
              id="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="mot_de_passe">Mot de passe</label>
            <input
              type="password"
              name="mot_de_passe"
              id="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">S'inscrire</button>
        </form>
        {signupSuccess && <p className="signup-success">Inscription réussie ! Redirection vers la page de connexion...</p>}
      </div>
      <Link to="/login" className="login-link">Déjà un compte ? Se connecter</Link>
    </div>
  );
};

export default SignupPage;
