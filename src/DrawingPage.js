import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DrawingCanvas from './components/DrawingCanvas';
import { AppContext } from './components/AppContext'; // Import AppContext

const DrawingPage = () => {
  const { index } = useParams();
  const navigate = useNavigate();
  const { pages, setPages } = useContext(AppContext); // Use context

  const saveDrawing = (dataUrl) => {
    const newPages = [...pages];
    newPages[index] = { content: dataUrl, url: dataUrl };
    setPages(newPages);
    navigate('/createbd'); // Rediriger vers la page CreateBD après la sauvegarde
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'white' }}>
      <DrawingCanvas onSave={saveDrawing} />
    </div>
  );
};

export default DrawingPage;