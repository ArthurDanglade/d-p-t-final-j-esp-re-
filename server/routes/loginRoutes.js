const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require('../../src/db');

router.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  // Tous les champs remplis
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  // Est-ce que l'utilisateur est dans la base de données
  const selectUserQuery = "SELECT * FROM utilisateurs WHERE email = ? AND mot_de_passe = ?";

  try {
    const [results] = await connection.query(selectUserQuery, [email, mot_de_passe]);

    // Est-ce que l'utilisateur est trouvé dans la base de données
    if (results.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const user = results[0];
    const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });

    // Réponse de connexion réussie
    res.status(200).json({ message: "Connexion réussie.", token: token });
  } catch (err) {
    console.error("Erreur lors de la recherche de l'utilisateur :", err);
    res.status(500).json({ error: "Une erreur s'est produite lors de la connexion de l'utilisateur." });
  }
});

module.exports = router;
