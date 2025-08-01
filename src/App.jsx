import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../Layout.js'; // Note the path goes up one directory
import Dashboard from '../Pages/Dashboard.jsx';
import Gallery from '../Pages/Gallery.jsx';
import Favorites from '../Pages/Favorites.jsx';
import Upload from '../Pages/Upload.jsx';
import PhotoPage from '../Pages/Photo.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/Dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/Gallery" element={<Layout><Gallery /></Layout>} />
        <Route path="/Favorites" element={<Layout><Favorites /></Layout>} />
        <Route path="/Upload" element={<Layout><Upload /></Layout>} />
        <Route path="/Photo" element={<Layout><PhotoPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;