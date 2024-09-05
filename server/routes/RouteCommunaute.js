const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const connection = require('../../src/db'); // Utilisez 'connection' ici pour être cohérent

// Route pour ajouter ou retirer un like
router.post('/:utilisateurs_id/like/:bd_id', async (req, res) => {
  const { utilisateurs_id, bd_id } = req.params;

  const checkQuery = 'SELECT * FROM utilisateursLikes WHERE utilisateurs_id = ? AND bd_id = ?';
  try {
    const [result] = await connection.query(checkQuery, [utilisateurs_id, bd_id]);

    if (result.length > 0) {
      // L'utilisateur a déjà aimé cette BD, on supprime le like
      const deleteQuery = 'DELETE FROM utilisateursLikes WHERE utilisateurs_id = ? AND bd_id = ?';
      await connection.query(deleteQuery, [utilisateurs_id, bd_id]);
      res.json({ status: 'success', action: 'unlike' });
    } else {
      // L'utilisateur n'a pas encore aimé cette BD, on ajoute le like
      const insertQuery = 'INSERT INTO utilisateursLikes (utilisateurs_id, bd_id) VALUES (?, ?)';
      await connection.query(insertQuery, [utilisateurs_id, bd_id]);
      res.json({ status: 'success', action: 'like' });
    }
  } catch (err) {
    console.error('Erreur lors de la gestion du like:', err);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
});

// Route pour retirer un like
router.delete('/:utilisateurs_id/like/:bd_id', async (req, res) => {
  console.log(`DELETE request received for utilisateur_id: ${req.params.utilisateurs_id} and bd_id: ${req.params.bd_id}`);
  const { utilisateurs_id, bd_id } = req.params;
  const query = 'DELETE FROM utilisateursLikes WHERE utilisateurs_id = ? AND bd_id = ?';

  try {
    const [result] = await connection.query(query, [utilisateurs_id, bd_id]);

    if (result.affectedRows === 0) {
      console.log('Like non trouvé');
      return res.status(404).json({ status: 'error', message: 'Like non trouvé' });
    }
    res.json({ status: 'success' });
  } catch (err) {
    console.error('Erreur lors de la suppression du like:', err);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
});

// Endpoint pour vérifier si un utilisateur a liké une BD
router.get('/utilisateur/:utilisateur_id/likes/:bd_id', async (req, res) => {
  const { utilisateur_id, bd_id } = req.params;

  const query = 'SELECT COUNT(*) as total FROM utilisateursLikes WHERE utilisateurs_id = ? AND bd_id = ?';
  try {
    const [result] = await connection.query(query, [utilisateur_id, bd_id]);
    res.json({ liked: result[0].total > 0 });
  } catch (err) {
    console.error('Erreur lors de la vérification du like:', err);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
});

// Route pour obtenir le nombre total de likes pour une BD
router.get('/likes/:bdId', async (req, res) => {
  const { bdId } = req.params;

  try {
    console.log(`Fetching likes for bdId: ${bdId}`);
    const [rows] = await connection.query(`
      SELECT COUNT(*) AS total_likes
      FROM utilisateurslikes
      WHERE bd_id = ?
    `, [bdId]);

    console.log(`Likes count for bdId ${bdId}: ${rows[0].total_likes}`);
    res.json({ total_likes: rows[0].total_likes });
  } catch (error) {
    console.error('Error fetching BD likes:', error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
