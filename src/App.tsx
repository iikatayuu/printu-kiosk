
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Homepage from './pages/Homepage';
import Print from './pages/Print';
import Success from './pages/Success';
import './App.css';

class App extends React.Component {
  render () {
    return (
      <Routes>
        <Route index element={<Homepage />} />
        <Route path="/print/:uploadId" element={<Print />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    );
  }
}

export default App;
