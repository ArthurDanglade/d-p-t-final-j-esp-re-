const express = require('express');
const router = express.Router();
const db = require('../../src/db'); // Assurez-vous que ce fichier utilise mysql2/promise

// Route pour obtenir le nombre total de likes pour les BD d'un utilisateur
router.get('/total-likes/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Requête SQL pour compter les likes des BD de l'utilisateur
    const [rows] = await db.query(`
      SELECT COUNT(*) AS totalLikes
      FROM utilisateurslikes ul
      JOIN bd b ON ul.bd_id = b.id
      WHERE b.utilisateur_id = ?
    `, [userId]);

    res.json({ totalLikes: rows[0].totalLikes });
  } catch (error) {
    console.error('Error fetching total likes:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
