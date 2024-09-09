import React, { createContext, useState } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [pages, setPages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedThemes, setSelectedThemes] = useState([]);

  return (
    <AppContext.Provider value={{ pages, setPages, title, setTitle, description, setDescription, selectedThemes, setSelectedThemes }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };