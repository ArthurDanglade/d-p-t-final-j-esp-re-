const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const connection = require('../../src/db'); // Assure-toi que ce fichier utilise mysql2/promise

// Route GET pour récupérer les BD d'un utilisateur
router.get('/user/:utilisateur_id', async (req, res) => {
  const { utilisateur_id } = req.params;
  const query = 'SELECT bd.id, bd.utilisateur_id, bd.title, bd.description, bd.characteristics, pages.id AS page_id, pages.image_url FROM bd LEFT JOIN pages ON bd.id = pages.bd_id WHERE bd.utilisateur_id = ?';

  try {
    const [result] = await connection.query(query, [utilisateur_id]);

    // Regroupe les pages par BD
    const bdWithPages = result.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          utilisateur_id: row.utilisateur_id,
          title: row.title,
          description: row.description,
          characteristics: row.characteristics,
          pages: [],
        };
      }

      if (row.page_id) {
        acc[row.id].pages.push({
          id: row.page_id,
          image_url: row.image_url,
        });
      }

      return acc;
    }, {});

    res.send(Object.values(bdWithPages));
  } catch (err) {
    console.error('Erreur lors de la récupération des BD:', err);
    res.status(500).send({ error: 'Une erreur s\'est produite lors de la récupération des BD.' });
  }
});

// Route GET pour récupérer une BD spécifique
router.get('/:bd_id', async (req, res) => {
  const { bd_id } = req.params;
  const query = 'SELECT bd.id, bd.utilisateur_id, bd.title, bd.description, bd.characteristics, pages.id AS page_id, pages.image_url, (SELECT COUNT(*) FROM utilisateursLikes WHERE bd_id = bd.id) AS likes FROM bd LEFT JOIN pages ON bd.id = pages.bd_id WHERE bd.id = ?';

  try {
    const [result] = await connection.query(query, [bd_id]);

    // Regroupe les pages par BD
    const bdWithPages = result.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          utilisateur_id: row.utilisateur_id,
          title: row.title,
          description: row.description,
          characteristics: row.characteristics,
          likes: row.likes,
          pages: [],
        };
      }

      if (row.page_id) {
        acc[row.id].pages.push({
          id: row.page_id,
          image_url: row.image_url,
        });
      }

      return acc;
    }, {});

    res.send(Object.values(bdWithPages)[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération de la BD:', err);
    res.status(500).send({ error: 'Une erreur s\'est produite lors de la récupération de la BD.' });
  }
});

// Route GET pour récupérer toutes les BD
router.get('/', async (req, res) => {
  const query = `
    SELECT bd.id, bd.utilisateur_id, bd.title, bd.description, bd.characteristics, utilisateurs.nom, utilisateurs.pseudo, utilisateurs.photo, utilisateurs.description AS utilisateur_description, pages.id AS page_id, pages.image_url
    FROM bd
    LEFT JOIN utilisateurs ON bd.utilisateur_id = utilisateurs.id
    LEFT JOIN pages ON bd.id = pages.bd_id
  `;

  try {
    const [result] = await connection.query(query);

    // BD par page et info de l'utilisateur qui a publié la BD
    const bdWithPages = result.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          utilisateur_id: row.utilisateur_id,
          title: row.title,
          description: row.description,
          characteristics: row.characteristics,
          utilisateur: {
            nom: row.nom,
            pseudo: row.pseudo,
            photo: row.photo,
            description: row.utilisateur_description,
          },
          pages: [],
        };
      }

      if (row.page_id) {
        acc[row.id].pages.push({
          id: row.page_id,
          image_url: row.image_url,
        });
      }

      return acc;
    }, {});

    res.send(Object.values(bdWithPages));
  } catch (err) {
    console.error('Erreur lors de la récupération des BD:', err);
    res.status(500).send({ error: 'Une erreur s\'est produite lors de la récupération des BD.' });
  }
});

module.exports = router;
