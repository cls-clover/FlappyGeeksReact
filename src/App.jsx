// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import CharacterPage from './components/CharacterPage';
import RecordsPage from './components/RecordsPage';
import GamePage from './components/GamePage';

import './styles/global.scss';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainMenu />} />
                <Route path="/character" element={<CharacterPage />} />
                <Route path="/records" element={<RecordsPage />} />
                 <Route path="/game" element={<GamePage />} />
            </Routes>
        </Router>
    );
}

export default App;