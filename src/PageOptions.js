import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageOptions = () => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template) => {
    navigate(`/drawing-canvas/${template}`);
  };

  return (
    <div>
      <h1>Choisissez une disposition</h1>
      <button onClick={() => handleSelectTemplate('1')}>1 Case</button>
      <button onClick={() => handleSelectTemplate('2')}>2 Cases</button>
      <button onClick={() => handleSelectTemplate('3')}>3 Cases</button>
    </div>
  );
};

export default PageOptions;
