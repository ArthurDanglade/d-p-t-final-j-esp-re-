const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const path = require('path');

// Configuration du répertoire statique
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/uploads', upload.single('file'), (req, res) => {
  // Renvoie le chemin complet avec le dossier 'uploads'
  res.json({ path: 'uploads/' + req.file.filename });
});

// Route d'authentification
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// route de connexon
const loginRoutes = require('./routes/loginRoutes');
app.use('/api/auth', loginRoutes);

// route de profil
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/auth', profileRoutes);

// route de publication
const publishRoutes = require('./routes/RoutePublish');
app.use(publishRoutes);

// route de bd
const bdRoutes = require('./routes/RouteBD');
app.use('/api/bd', bdRoutes);

// route de communauté (like)
const communauteRoutes = require('./routes/RouteCommunaute');
app.use('/api/communaute', communauteRoutes);

const followRoutes = require('./routes/Routefollow');
app.use('/api', followRoutes);

const commentsRouter = require('./routes/comments');
app.use('/api/comments', commentsRouter); 




app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});