const express = require('express');
const router = express.Router();
const connection = require('../../src/db'); // Assure-toi que ce fichier utilise mysql2/promise
const jwt = require('jsonwebtoken');

// Endpoint pour obtenir le nombre de followers
router.get('/followersCount/:id', async (req, res) => {
  const utilisateur_id = req.params.id;

  const sqlCount = 'SELECT COUNT(*) AS followersCount FROM user_fans WHERE utilisateur_id_suivi = ?';

  try {
    const [results] = await connection.query(sqlCount, [utilisateur_id]);
    const followersCount = results[0].followersCount;
    res.status(200).json({ followersCount });
  } catch (err) {
    console.error('Erreur lors du calcul du nombre de followers:', err);
    res.status(500).send('Erreur lors du calcul du nombre de followers');
  }
});

// Endpoint pour supprimer un suivi
router.post('/unfollow', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token manquant');
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    const utilisateur_id_suiveur = decoded.id;
    const { utilisateur_id_suivi } = req.body;

    if (!utilisateur_id_suivi) {
      return res.status(400).send('L\'ID de l\'utilisateur suivi est requis.');
    }

    // Vérifiez si le suivi existe avant de tenter de le supprimer
    const [existing] = await connection.query('SELECT 1 FROM user_fans WHERE utilisateur_id_suiveur = ? AND utilisateur_id_suivi = ?', [utilisateur_id_suiveur, utilisateur_id_suivi]);
    if (existing.length === 0) {
      return res.status(400).send('Vous ne suivez pas cet utilisateur.');
    }

    const sqlDelete = 'DELETE FROM user_fans WHERE utilisateur_id_suiveur = ? AND utilisateur_id_suivi = ?';
    const sqlCount = 'SELECT COUNT(*) AS followersCount FROM user_fans WHERE utilisateur_id_suivi = ?';

    await connection.query(sqlDelete, [utilisateur_id_suiveur, utilisateur_id_suivi]);

    const [countResults] = await connection.query(sqlCount, [utilisateur_id_suivi]);
    const followersCount = countResults[0].followersCount;

    res.status(200).json({ followersCount });
  } catch (err) {
    console.error('Erreur lors de la suppression du suivi:', err);
    res.status(500).send('Erreur lors de la suppression du suivi');
  }
});



router.post('/suivre', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token manquant');
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    const utilisateur_id_suiveur = decoded.id;

    const { utilisateur_id_suivi } = req.body;

    if (!utilisateur_id_suivi) {
      return res.status(400).send('L\'ID de l\'utilisateur suivi est requis.');
    }

    // Vérifiez si l'utilisateur suit déjà cet utilisateur pour éviter les doublons
    const [existingFollow] = await connection.query(
      'SELECT * FROM user_fans WHERE utilisateur_id_suiveur = ? AND utilisateur_id_suivi = ?',
      [utilisateur_id_suiveur, utilisateur_id_suivi]
    );

    if (existingFollow.length > 0) {
      return res.status(400).send('Vous suivez déjà cet utilisateur.');
    }

    const sqlInsert = 'INSERT INTO user_fans (utilisateur_id_suiveur, utilisateur_id_suivi) VALUES (?, ?)';
    const sqlCount = 'SELECT COUNT(*) AS followersCount FROM user_fans WHERE utilisateur_id_suivi = ?';

    await connection.query(sqlInsert, [utilisateur_id_suiveur, utilisateur_id_suivi]);

    const [countResults] = await connection.query(sqlCount, [utilisateur_id_suivi]);
    const followersCount = countResults[0].followersCount;

    res.status(200).send({ message: 'Suivi ajouté avec succès', followersCount });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du suivi:', err);
    res.status(500).send('Erreur lors de l\'ajout du suivi');
  }
});




// Endpoint pour obtenir les utilisateurs suivis
router.get('/utilisateursSuivis/:id', async (req, res) => {
  const utilisateur_id = req.params.id;

  const sqlSelect = 'SELECT utilisateur_id_suivi FROM user_fans WHERE utilisateur_id_suiveur = ?';

  try {
    const [results] = await connection.query(sqlSelect, [utilisateur_id]);
    const suivis = results.map(result => result.utilisateur_id_suivi);
    res.status(200).send(suivis);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs suivis:', err);
    res.status(500).send('Erreur lors de la récupération des utilisateurs suivis');
  }
});

// Endpoint pour vérifier si l'utilisateur suit un autre utilisateur
router.get('/isFollowing/:utilisateur_id', async (req, res) => {
  const utilisateur_id_suivi = req.params.utilisateur_id;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token manquant');
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    const utilisateur_id_suiveur = decoded.id;

    const sqlSelect = 'SELECT COUNT(*) AS isFollowing FROM user_fans WHERE utilisateur_id_suiveur = ? AND utilisateur_id_suivi = ?';
    const [results] = await connection.query(sqlSelect, [utilisateur_id_suiveur, utilisateur_id_suivi]);
    const isFollowing = results[0].isFollowing > 0;

    res.status(200).json({ isFollowing });
  } catch (err) {
    console.error('Erreur lors de la vérification du suivi:', err);
    res.status(500).send('Erreur lors de la vérification du suivi');
  }
});


module.exports = router;
