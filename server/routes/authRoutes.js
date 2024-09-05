const express = require('express');
const router = express.Router();
const connection = require('../../src/db'); // Connexion fichier mysql

router.post('/signup', async (req, res) => {
  // Logique d'inscription des utilisateurs ici
  const { nom, email, mot_de_passe } = req.body;

  // Tous les champs requis remplis
  if (!nom || !email || !mot_de_passe) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  // Email valide ou non
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "L'email n'est pas valide." });
  }

  // Insertion de l'utilisateur dans la base de données Bubble2 dans la table utilisateur
  const insertUserQuery = "INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES (?, ?, ?)";
  
  try {
    const [result] = await connection.query(insertUserQuery, [nom, email, mot_de_passe]);
    console.log("Utilisateur inscrit avec succès :", result);
    res.status(200).json({ message: "Utilisateur inscrit avec succès." });
  } catch (err) {
    console.error("Erreur lors de l'inscription de l'utilisateur :", err);
    res.status(500).json({ error: "Une erreur s'est produite lors de l'inscription de l'utilisateur." });
  }
});

module.exports = router;
