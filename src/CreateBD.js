import React, { useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import { jwtDecode } from "jwt-decode";
import './components/CreateBD.css';

const CreateBD = () => {
  const token = localStorage.getItem('token');
  const [pages, setPages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [availableThemes] = useState(['Humour', 'Aventure', 'Science-fiction', 'Romance', 'Action', 'Amitié', 'Famille', 'Enquête', 'Magie', 'Super-héros', 'Absurde', 'Guerre', 'Espace', 'Sport', 'Mythologies', 'Bd courte', 'Bd longue', 'Amour']); // Liste des thèmes disponibles

  // Fonction pour ajouter une page
  const handleAddPage = () => {
    setPages([...pages, { content: null, url: '' }]);
  };

  // Fonction pour importer une page
  const handleImportPage = (index) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const newPages = [...pages];
      newPages[index] = { content: file, url: url };
      setPages(newPages);
    };
    fileInput.click();
  };

  // Fonction pour dessiner une page (à compléter)
  const handleDrawPage = (index) => {
    // futur bibliothèque de dessin ?
  };

  // Fonction pour supprimer une page
  const handleDeletePage = (index) => {
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
  };

  // Fonction pour publier la BD
  const handlePublish = async () => {
    if (!token) {
      console.error('Token is undefined');
      return;
    }

    const decodedToken = jwtDecode(token);
    const utilisateur_id = decodedToken.sub;

    const formData = new FormData();
    pages.forEach((page, index) => {
      if (page.content instanceof File) {
        formData.append('pages', page.content, `page-${index}.png`);
      }
    });

    formData.append('utilisateur_id', utilisateur_id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('characteristics', JSON.stringify(selectedThemes)); // Envoi des thèmes comme JSON

    const response = await fetch('http://localhost:3001/api/publish', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': token
      },
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      try {
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        const text = await response.text();
        console.log('Response text:', text);
      }
    } else {
      const text = await response.text();
      console.log(text);
    }
  };

  // Fonction pour ajouter un thème sélectionné
  const handleAddTheme = (event) => {
    const selectedTheme = event.target.value;
    if (selectedTheme && !selectedThemes.includes(selectedTheme)) {
      setSelectedThemes([...selectedThemes, selectedTheme]);
    }
    // Réinitialiser la sélection après ajout
    event.target.value = '';
  };

  // Fonction pour supprimer un thème sélectionné
  const handleRemoveTheme = (theme) => {
    setSelectedThemes(prevThemes => prevThemes.filter(t => t !== theme));
  };

  return (
    <div>
      <h1>Publie ta BD !</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      <div>
        <h3>Ajouter un thème :</h3>
        <select onChange={handleAddTheme}>
          <option value="">Sélectionner un thème</option>
          {availableThemes.map(theme => (
            <option key={theme} value={theme}>{theme}</option>
          ))}
        </select>
      </div>

      <div>
        <h3>Thèmes sélectionnés :</h3>
        {selectedThemes.map(theme => (
          <div key={theme}>
            {theme} <button onClick={() => handleRemoveTheme(theme)}>Supprimer</button>
          </div>
        ))}
      </div>

      <button onClick={handleAddPage}>Ajouter une page</button>
      {pages.map((page, index) => (
        <div key={index}>
          <h2>Page {index + 1}</h2>
          {page.content && <img src={page.url} alt={`Page ${index + 1}`} />}
          <button onClick={() => handleImportPage(index)}>Importer une page</button>
          <button onClick={() => handleDrawPage(index)}>Dessiner une page</button>
          <button onClick={() => handleDeletePage(index)}>Supprimer la page</button>
        </div>
      ))}
      <button onClick={handlePublish}>Publier la BD</button>
      <BottomNavigation />
    </div>
  );
};

export default CreateBD;
