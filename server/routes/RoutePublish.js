const express = require('express');
const multer = require('multer');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

let db;

// Connexion à la base de données
async function connectToDatabase() {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Hitomi2000-',
      database: 'Bubble2'
    });
    console.log('Connecté à la base de données');
  } catch (err) {
    console.error('Impossible de se connecter à la base de données:', err);
  }
}

// Appel initial pour établir la connexion à la base de données
connectToDatabase();

router.post('/api/publish', upload.array('pages'), async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'Token requis.' });
  }

  let utilisateur_id;

  try {
    const decoded = jwt.verify(token, 'secret_key');
    utilisateur_id = decoded.id;
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la vérification du token.' });
  }

  const pages = req.files;
  const { title, description, characteristics } = req.body;

  if (!utilisateur_id) {
    return res.status(400).json({ error: 'L\'ID de l\'utilisateur est requis.' });
  }

  if (!title || !description || !characteristics) {
    return res.status(400).json({ error: 'Les champs title, description et characteristics sont requis.' });
  }

  try {
    // Insertion d'une nouvelle BD dans la base de données
    const [bdResult] = await db.query(
      'INSERT INTO bd (utilisateur_id, title, description, characteristics) VALUES (?, ?, ?, ?)', 
      [utilisateur_id, title, description, characteristics]
    );

    // Insertion de chaque page dans la base de données
    for (const page of pages) {
      await db.query(
        'INSERT INTO pages (bd_id, image_url) VALUES (?, ?)',
        [bdResult.insertId, page.path]
      );
    }

    res.status(200).json({ message: 'Publication réussie.' });
  } catch (err) {
    console.error('Erreur lors de la publication:', err);
    res.status(500).json({ error: 'Erreur lors de la publication.' });
  }
});

module.exports = router;
