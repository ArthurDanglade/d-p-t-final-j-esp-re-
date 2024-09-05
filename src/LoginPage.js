import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './components/LoginPage.css'; // Assure-toi d'importer le fichier CSS

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleMotDePasseChange = (e) => {
    setMotDePasse(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, mot_de_passe });
      if (response.status === 200) {
        // Quand la connexion réussie, stocke le token dans le localStorage
        localStorage.setItem('token', response.data.token);
        console.log('Connexion réussie');
        navigate("/HomePage");
      }
    } catch (error) {
      // Console d'erreur de connexion
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="login-page-container">
            <div className="logo-containerlogin">
        <img src="/logo.svg" alt="Bubble Logo" className="logo" />
      </div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div>
          <label htmlFor="mot_de_passe">Mot de passe:</label>
          <input
            type="password"
            id="mot_de_passe"
            value={mot_de_passe}
            onChange={handleMotDePasseChange}
            required
          />
        </div>
        <button type="submit">Se connecter</button>
      </form>
      <Link to="/signup" className="create-account-link">Créer un compte</Link>
    </div>
  );
};

export default LoginPage;