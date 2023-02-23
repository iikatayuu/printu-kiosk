
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Homepage from './pages/Homepage';
import Print from './pages/Print';
import './App.css';

class App extends React.Component {
  render () {
    return (
      <Routes>
        <Route index element={<Homepage />} />
        <Route path="/print/:uploadId" element={<Print />} />
      </Routes>
    );
  }
}

export default App;
