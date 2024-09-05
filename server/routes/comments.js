const express = require('express');
const router = express.Router();
const db = require('../../src/db');

router.get('/:bd_id', async (req, res) => {
  const bd_id = req.params.bd_id;
  
  // La requête SQL pour récupérer les commentaires avec les pseudos des utilisateurs
  const query = `
    SELECT comments.*, utilisateurs.pseudo 
    FROM comments 
    JOIN utilisateurs ON comments.utilisateur_id = utilisateurs.id 
    WHERE comments.bd_id = ?`;

  try {
    // Exécution de la requête
    const [results] = await db.query(query, [bd_id]);
    console.log('Commentaires récupérés:', results);
    res.json({ comments: results });
  } catch (err) {
    // Gestion des erreurs
    console.error('Erreur lors de la récupération des commentaires:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.post('/', async (req, res) => {
  const { bd_id, utilisateur_id, comment, rating } = req.body;
  
  if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5 étoiles.' });
  }
  
  try {
    await db.query('INSERT INTO comments (bd_id, utilisateur_id, comment, rating) VALUES (?, ?, ?, ?)', [bd_id, utilisateur_id, comment, rating]);
    res.status(201).json({ status: 'success', message: 'Commentaire ajouté avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
  }
});

router.get('/average-rating/:bd_id', async (req, res) => {
  const bd_id = req.params.bd_id;
  try {
    const [results] = await db.query(`
      SELECT AVG(rating) AS averageRating 
      FROM comments 
      WHERE bd_id = ?`, [bd_id]);
    
    const averageRating = results[0].averageRating || 0;
    res.json({ averageRating });
  } catch (err) {
    console.error('Erreur lors de la récupération de la moyenne des notes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;