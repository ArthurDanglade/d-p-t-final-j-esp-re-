import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import HomePage from './HomePage';
import SearchPage from './SearchPage';
import CreateBD from './CreateBD';
import ProfilPage from './ProfilPage';
import PublicProfilePage from './PublicProfilePage';
import BDPage from './components/BDPage'; 
import 'bootstrap/dist/css/bootstrap-grid.css'; 
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [utilisateur_id, setUtilisateurId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('utilisateur_id');
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    } else {
      setIsLoggedIn(false);
    }
    if (storedUserId) {
      setUtilisateurId(storedUserId);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={isLoggedIn ? <Navigate to="/HomePage" /> : <Navigate to="/login" />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/SearchPage" element={<SearchPage />} />
        <Route path="/CreateBD" element={<CreateBD token={token} />} /> {/* passe token a createbd */}
        <Route path="/ProfilPage" element={<ProfilPage utilisateur_id={utilisateur_id} />} />        <Route path="/public-profile/:pseudo" element={<PublicProfilePage />} />
        <Route path="/bd/:id" element={<BDPage utilisateur_id={utilisateur_id} />} />      
          </Routes>
    </Router>
  );
};

export default App;