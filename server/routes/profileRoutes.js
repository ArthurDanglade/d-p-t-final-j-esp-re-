const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require('../../src/db');

// Route GET pour récupérer le profil
router.get('/profile', async (req, res) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({ error: 'Aucun token fourni.' });
  }

  try {
    const decoded = await jwt.verify(token, 'secret_key');
    const userId = decoded.id;

    // Récupération du profil utilisateur
    const [userResults] = await connection.query('SELECT * FROM utilisateurs WHERE id = ?', [userId]);
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = userResults[0];

    // Récupération des BD associées à l'utilisateur
    const [bdResults] = await connection.query('SELECT * FROM bd WHERE utilisateur_id = ?', [userId]);

    user.bds = bdResults;
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du profil.' });
  }
});

// Route PUT pour mettre à jour le profil
router.put('/profile', async (req, res) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({ error: 'Aucun token fourni.' });
  }

  try {
    const decoded = await jwt.verify(token, 'secret_key');
    const userId = decoded.id;

    // Récupération des changements du profil
    const { photo, pseudo, description } = req.body;

    // Mise à jour du profil
    await connection.query('UPDATE utilisateurs SET photo = ?, pseudo = ?, description = ? WHERE id = ?', [photo, pseudo, description, userId]);

    // Récupération du profil mis à jour
    const [updatedResults] = await connection.query('SELECT * FROM utilisateurs WHERE id = ?', [userId]);
    if (updatedResults.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = updatedResults[0];
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du profil.' });
  }
});

// Route GET pour rechercher des utilisateurs par pseudo
router.get('/search', async (req, res) => {
  const pseudo = req.query.pseudo;

  try {
    const [results] = await connection.query('SELECT * FROM utilisateurs WHERE pseudo LIKE ?', [`%${pseudo}%`]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la recherche de l\'utilisateur:', err);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la recherche de l\'utilisateur.' });
  }
});

// Route GET pour récupérer le profil public par pseudo
router.get('/public-profile/:pseudo', async (req, res) => {
  const pseudo = req.params.pseudo;

  try {
    const [results] = await connection.query('SELECT * FROM utilisateurs WHERE pseudo = ?', [pseudo]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = results[0];
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du profil.' });
  }
});

module.exports = router;
